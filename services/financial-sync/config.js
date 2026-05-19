// config.js - Configuração centralizada

module.exports = {
  clickup: {
    apiKey: process.env.CLICKUP_API_KEY || 'test-key',
    teamId: process.env.CLICKUP_TEAM_ID || '123456',
    listIds: {
      crmOficial: process.env.CLICKUP_CRM_OFICIAL_ID || 'list-id-1',
      crmVendas: process.env.CLICKUP_CRM_VENDAS_ID || 'list-id-2',
    },
    // Sincronização em TEMPO REAL (a cada 5 minutos)
    // Para usar webhooks, configure em ClickUp → Integrations → Webhooks
    syncInterval: process.env.SYNC_INTERVAL_MS || (5 * 60 * 1000), // 5 minutos (padrão)
    webhookSecret: process.env.CLICKUP_WEBHOOK_SECRET || null,
    webhookUrl: process.env.CLICKUP_WEBHOOK_URL || null,
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'financial_sync',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },
  api: {
    port: process.env.API_PORT || 3001,
    host: process.env.API_HOST || 'localhost',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Webhook ClickUp
  webhooks: {
    enabled: process.env.WEBHOOKS_ENABLED === 'true',
    endpoint: '/api/webhooks',
  },

  // Real-time updates
  realtime: {
    dashboardRefreshMs: 5000, // Dashboard atualiza a cada 5 segundos
    debounceMs: 10000, // Debounce de sync a cada 10 segundos
  },
};
