// db/database.js - Camada de persistência com JSON files

const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'data');
const SALES_FILE = path.join(DB_DIR, 'sales.json');
const CLIENTS_FILE = path.join(DB_DIR, 'clients.json');
const METRICS_FILE = path.join(DB_DIR, 'metrics.json');
const SYNC_LOG_FILE = path.join(DB_DIR, 'sync-log.json');

class Database {
  constructor() {
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  saveSales(sales) {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        sales,
        count: sales.length,
      };
      fs.writeFileSync(SALES_FILE, JSON.stringify(data, null, 2));
      return { success: true, count: sales.length };
    } catch (error) {
      throw new Error(`Failed to save sales: ${error.message}`);
    }
  }

  getSales() {
    try {
      if (!fs.existsSync(SALES_FILE)) {
        return { sales: [], timestamp: null };
      }
      const data = JSON.parse(fs.readFileSync(SALES_FILE, 'utf8'));
      return data;
    } catch (error) {
      return { sales: [], timestamp: null };
    }
  }

  saveClients(clients) {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        clients,
        count: clients.length,
      };
      fs.writeFileSync(CLIENTS_FILE, JSON.stringify(data, null, 2));
      return { success: true, count: clients.length };
    } catch (error) {
      throw new Error(`Failed to save clients: ${error.message}`);
    }
  }

  getClients() {
    try {
      if (!fs.existsSync(CLIENTS_FILE)) {
        return { clients: [], timestamp: null };
      }
      const data = JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf8'));
      return data;
    } catch (error) {
      return { clients: [], timestamp: null };
    }
  }

  saveMetrics(metrics) {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        metrics,
      };
      fs.writeFileSync(METRICS_FILE, JSON.stringify(data, null, 2));
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to save metrics: ${error.message}`);
    }
  }

  getMetrics() {
    try {
      if (!fs.existsSync(METRICS_FILE)) {
        return { metrics: null, timestamp: null };
      }
      const data = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
      return data;
    } catch (error) {
      return { metrics: null, timestamp: null };
    }
  }

  addSyncLog(entry) {
    try {
      const logs = this.getSyncLogs();
      logs.push({
        ...entry,
        timestamp: new Date().toISOString(),
      });
      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs.shift();
      }
      fs.writeFileSync(SYNC_LOG_FILE, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error('Failed to add sync log:', error.message);
    }
  }

  getSyncLogs(limit = 50) {
    try {
      if (!fs.existsSync(SYNC_LOG_FILE)) {
        return [];
      }
      const logs = JSON.parse(fs.readFileSync(SYNC_LOG_FILE, 'utf8'));
      return logs.slice(-limit).reverse();
    } catch (error) {
      return [];
    }
  }

  clear() {
    [SALES_FILE, CLIENTS_FILE, METRICS_FILE, SYNC_LOG_FILE].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }
}

module.exports = new Database();
