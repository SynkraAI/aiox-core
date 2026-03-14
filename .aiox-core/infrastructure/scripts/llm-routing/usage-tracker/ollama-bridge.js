#!/usr/bin/env node
/**
 * AIOX Ollama-to-Anthropic Bridge (Streaming Support)
 * Translates Anthropic SSE (Claude Code) to Ollama/OpenAI API
 */

const http = require('http');

const PORT = process.env.BRIDGE_PORT || 8788;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const anthropicReq = JSON.parse(body);
      const isStreaming = anthropicReq.stream || false;

      // Translate Anthropic to OpenAI/Ollama
      const openaiReq = {
        model: anthropicReq.model,
        messages: anthropicReq.messages.map(m => ({
          role: m.role,
          content: Array.isArray(m.content) 
            ? m.content.map(c => c.text || c).join('\n') 
            : m.content
        })),
        stream: isStreaming,
        max_tokens: anthropicReq.max_tokens,
      };

      console.log(`[Bridge] Proxying request for model: ${openaiReq.model} (stream: ${isStreaming})`);

      // Call Ollama
      let baseUrl = OLLAMA_URL;
      if (baseUrl.endsWith('/v1')) baseUrl = baseUrl.slice(0, -3);
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
      
      const targetUrl = `${baseUrl}/v1/chat/completions`;
      const ollamaReq = http.request(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer local-key'
        }
      }, (ollamaRes) => {
        if (!isStreaming) {
          // Standard response translation
          res.writeHead(ollamaRes.statusCode, ollamaRes.headers);
          let responseBody = '';
          ollamaRes.on('data', chunk => { responseBody += chunk; });
          ollamaRes.on('end', () => {
            try {
              const openaiRes = JSON.parse(responseBody);
              const anthropicRes = {
                id: openaiRes.id,
                type: 'message',
                role: 'assistant',
                model: openaiRes.model,
                content: [{ type: 'text', text: openaiRes.choices[0].message.content }],
                usage: {
                  input_tokens: openaiRes.usage?.prompt_tokens || 0,
                  output_tokens: openaiRes.usage?.completion_tokens || 0
                }
              };
              res.end(JSON.stringify(anthropicRes));
            } catch (e) {
              res.end(responseBody);
            }
          });
        } else {
          // Streaming translation (OpenAI -> Anthropic SSE)
          res.writeHead(ollamaRes.statusCode, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          });

          // Send message_start
          res.write('event: message_start\n');
          res.write(`data: ${JSON.stringify({ type: 'message_start', message: { id: 'msg_' + Date.now(), role: 'assistant', content: [], model: openaiReq.model } })}\n\n`);
          
          res.write('event: content_block_start\n');
          res.write(`data: ${JSON.stringify({ type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } })}\n\n`);

          ollamaRes.on('data', chunk => {
            const lines = chunk.toString().split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                if (line.includes('[DONE]')) continue;
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                    const text = data.choices[0].delta.content;
                    res.write('event: content_block_delta\n');
                    res.write(`data: ${JSON.stringify({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: text } })}\n\n`);
                  }
                } catch (e) {
                  // Ignore parse errors from partial chunks
                }
              }
            }
          });

          ollamaRes.on('end', () => {
            res.write('event: content_block_stop\n');
            res.write(`data: ${JSON.stringify({ type: 'content_block_stop', index: 0 })}\n\n`);
            
            res.write('event: message_delta\n');
            res.write(`data: ${JSON.stringify({ type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 0 } })}\n\n`);
            
            res.write('event: message_stop\n');
            res.write('data: {"type": "message_stop"}\n\n');
            res.end();
          });
        }
      });

      ollamaReq.on('error', (e) => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Ollama connection failed', message: e.message }));
      });

      ollamaReq.write(JSON.stringify(openaiReq));
      ollamaReq.end();

    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request', message: e.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Ollama-Anthropic Bridge (Streaming) running on http://127.0.0.1:${PORT}`);
});
