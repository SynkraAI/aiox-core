#!/usr/bin/env node
'use strict';

const http = require('http');
const https = require('https');
const { URL } = require('url');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth/callback';

// Validate environment variables
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required');
  console.error('Set them in .env or export before running this script');
  process.exit(1);
}
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
].join(' ');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3000');

  if (url.pathname === '/oauth/callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h1>Erro: ${error}</h1>`);
      server.close();
      return;
    }

    if (code) {
      // Exchange code for tokens
      const postData = new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }).toString();

      const tokenReq = https.request({
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      }, (tokenRes) => {
        let data = '';
        tokenRes.on('data', chunk => data += chunk);
        tokenRes.on('end', () => {
          const tokens = JSON.parse(data);

          if (tokens.refresh_token) {
            console.log('\n=== SUCESSO ===');
            console.log('Refresh Token:', tokens.refresh_token);
            console.log('\nGuarde esse token! Ele nao expira.');

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
              <html><body style="font-family:system-ui;padding:40px;text-align:center">
                <h1 style="color:green">Autorizado com sucesso!</h1>
                <p>Pode fechar esta aba e voltar ao terminal.</p>
                <pre style="background:#f0f0f0;padding:20px;border-radius:8px;text-align:left;max-width:600px;margin:20px auto;word-break:break-all">Refresh Token: ${tokens.refresh_token}</pre>
              </body></html>
            `);
          } else {
            console.error('Erro ao obter tokens:', data);
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(`<h1>Erro</h1><pre>${data}</pre>`);
          }

          setTimeout(() => server.close(), 2000);
        });
      });

      tokenReq.on('error', (e) => {
        console.error('Erro na request:', e);
        res.writeHead(500);
        res.end('Erro interno');
        server.close();
      });

      tokenReq.write(postData);
      tokenReq.end();
    }
  }
});

server.listen(3000, () => {
  const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`;

  console.log('Servidor OAuth rodando em http://localhost:3000');
  console.log('Abrindo navegador para autorizacao...\n');

  require('child_process').exec(`open "${authUrl}"`);
});
