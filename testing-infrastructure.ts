/**
 * AIOS-Core: Infraestrutura de Testes e Resiliência -@lorenzavolponi
 * 
 * @description Provê um LLM Simulado (Mock) para testes determinísticos (custo zero)
 * e um Executor Resiliente que se auto-corrigi em falhas de parsing.
 */

import { EventEmitter } from 'events';

// --- Interfaces Tipadas (Removendo 'any') ---

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

export interface MockResponse {
  role: 'assistant';
  content: string;
  function_call?: { name: string; arguments: string };
}

export interface ChatCompletionResponse {
  choices: {
    message: ChatCompletionMessage;
  }[];
}

export class SimulatedLLM {
  private responseQueue: MockResponse[] = [];
  private callHistory: ChatCompletionMessage[][] = []; // Tipado

  public setNextResponse(response: MockResponse): void {
    this.responseQueue.push(response);
  }

  public async createChatCompletion(messages: ChatCompletionMessage[]): Promise<ChatCompletionResponse> {
    this.callHistory.push(messages);

    if (this.responseQueue.length > 0) {
      const mockResp = this.responseQueue.shift();
      return {
        choices: [{
          message: mockResp as ChatCompletionMessage
        }]
      };
    }

    // CORREÇÃO: Proteção contra array vazio
    if (!messages || messages.length === 0) {
      return {
        choices: [{
          message: { role: 'assistant', content: 'Simulated error: No messages provided.' }
        }]
      };
    }

    const lastUserMsg = messages[messages.length - 1].content;
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: `Simulated response to: ${lastUserMsg}`
        }
      }]
    };
  }

  public getCallHistory(): ChatCompletionMessage[][] {
    return this.callHistory;
  }
}

// --- Executor Resiliente (Lógica de Retry Corrigida) ---

export interface ExecutorConfig {
  maxRetries: number;
  parser: (output: string) => unknown; // Retorno alterado para 'unknown' (seguro)
}

export class ResilientExecutor {
  private config: ExecutorConfig;

  constructor(config: Partial<ExecutorConfig> = {}) {
    this.config = {
      maxRetries: 3,
      parser: JSON.parse,
      ...config
    };
  }

  /**
   * Executa a chamada e retenta APENAS em erros de parsing.
   * Erros de rede/requisição são propagados imediatamente.
   */
  public async execute(llmCall: () => Promise<string>): Promise<unknown> {
    let attempts = 0;
    let lastError: Error | null = null;
    let output = "";

    while (attempts < this.config.maxRetries) {
      try {
        // 1. Chama o LLM (Se falhar aqui, é erro de rede -> Propaga imediatamente)
        output = await llmCall();
        
        // 2. Tenta parsear (Se falhar aqui, é erro de formatação -> RETENTA)
        try {
          const parsed = this.config.parser(output);
          return parsed;
        } catch (parseError) {
           lastError = parseError instanceof Error ? parseError : new Error(String(parseError));
           attempts++;
           console.warn(`[ResilientExecutor] Erro de parsing na tentativa ${attempts}. Retentando...`);
           
           // Aqui entraria a lógica futura de pedir correção ao LLM
           // Por ora, apenas tentamos chamar novamente (assumindo que o caller possa modificar o prompt)
        }

      } catch (networkError) {
        // Erro de chamada (Network/Auth) não deve ser retentado aqui para não queimar créditos
        console.error(`[ResilientExecutor] Erro crítico na chamada LLM. Propagando.`);
        throw networkError;
      }
    }

    throw new Error(`Execução falhou após ${this.config.maxRetries} tentativas de parsing. Último erro: ${lastError?.message}`);
  }
}
