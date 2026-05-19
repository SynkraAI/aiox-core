// cli/clickup-client.js - Cliente para API ClickUp

const https = require('https');
const config = require('../config');

const CLICKUP_API = 'https://api.clickup.com/api/v2';

class ClickUpClient {
  constructor(apiKey = config.clickup.apiKey) {
    this.apiKey = apiKey;
  }

  async fetchTasks(listId) {
    try {
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.clickup.com',
          port: 443,
          path: `/api/v2/list/${listId}/task?include_subtasks=false&limit=100`,
          method: 'GET',
          headers: {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json',
          },
        };

        const req = https.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            if (res.statusCode === 200) {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(new Error(`Invalid JSON response: ${e.message}`));
              }
            } else {
              reject(new Error(`ClickUp API error: ${res.statusCode} ${data}`));
            }
          });
        });

        req.on('error', reject);
        req.end();
      });
    } catch (error) {
      throw new Error(`Failed to fetch tasks from ClickUp: ${error.message}`);
    }
  }

  async getSalesData() {
    console.log('[ClickUp] Buscando dados de CRM-VENDAS...');
    const data = await this.fetchTasks(config.clickup.listIds.crmVendas);
    return data.tasks || [];
  }

  async getClientsData() {
    console.log('[ClickUp] Buscando dados de CRM-OFICIAL...');
    const data = await this.fetchTasks(config.clickup.listIds.crmOficial);
    return data.tasks || [];
  }

  parseCustomField(task, fieldName) {
    if (!task.custom_fields) return null;
    const field = task.custom_fields.find(f => f.name === fieldName);
    return field?.value || null;
  }
}

module.exports = ClickUpClient;
