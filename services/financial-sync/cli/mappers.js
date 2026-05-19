// cli/mappers.js - Mapeia dados ClickUp → Schema local

class Mappers {
  static mapSale(task) {
    const customField = (fieldName) => {
      if (!task.custom_fields) return null;
      const field = task.custom_fields.find(f => f.name === fieldName);
      return field?.value || null;
    };

    return {
      clickup_id: task.id,
      clickup_name: task.name,
      value_negotiated: parseFloat(customField('Deal Value')) || 0,
      value_received: parseFloat(customField('Paid Amount')) || 0,
      payment_method: customField('Payment Method') || 'unknown',
      due_date: task.due_date ? new Date(parseInt(task.due_date)) : null,
      payment_date: customField('Payment Date') ? new Date(customField('Payment Date')) : null,
      status: task.status?.status || 'unknown',
      seller_id: task.assignees?.[0]?.id || null,
      seller_name: task.assignees?.[0]?.username || 'unassigned',
      client_id: Mappers.extractClientLink(task),
      synced_at: new Date(),
      raw_data: JSON.stringify(task),
    };
  }

  static mapClient(task) {
    const customField = (fieldName) => {
      if (!task.custom_fields) return null;
      const field = task.custom_fields.find(f => f.name === fieldName);
      return field?.value || null;
    };

    return {
      clickup_id: task.id,
      name: task.name,
      email: customField('Email') || null,
      phone: customField('Phone') || null,
      company_size: customField('Company Size') || null,
      industry: customField('Industry') || null,
      credit_risk: customField('Risk Score') || 'unknown',
      last_payment_at: customField('Last Payment Date') ? new Date(customField('Last Payment Date')) : null,
      synced_at: new Date(),
      raw_data: JSON.stringify(task),
    };
  }

  static extractClientLink(task) {
    if (task.dependencies && task.dependencies.length > 0) {
      return task.dependencies[0].task_id || null;
    }
    return null;
  }

  static enrichSalesWithClientNames(sales, clients) {
    if (!clients || clients.length === 0) return sales;

    const clientMap = {};
    clients.forEach(c => {
      clientMap[c.id] = c.name;
      clientMap[c.clickup_id] = c.name;
    });

    return sales.map(sale => ({
      ...sale,
      client_name: clientMap[sale.client_id] || sale.clickup_name || 'Cliente Desconhecido',
      id: sale.clickup_id,
    }));
  }

  static calculateMetrics(sales) {
    const total = sales.length;
    if (total === 0) {
      return {
        total_negotiated: 0,
        total_received: 0,
        total_pending: 0,
        completion_rate: 0,
        average_days_to_receive: 0,
        default_rate: 0,
      };
    }

    const totalNegotiated = sales.reduce((sum, s) => sum + (s.value_negotiated || 0), 0);
    const totalReceived = sales.reduce((sum, s) => sum + (s.value_received || 0), 0);
    const totalPending = totalNegotiated - totalReceived;
    const completionRate = totalNegotiated > 0 ? (totalReceived / totalNegotiated) * 100 : 0;

    const daysToReceive = sales
      .filter(s => s.payment_date && s.due_date)
      .map(s => Math.floor((new Date(s.payment_date) - new Date(s.due_date)) / (1000 * 60 * 60 * 24)))
      .reduce((sum, days) => sum + days, 0) / (sales.filter(s => s.payment_date && s.due_date).length || 1);

    const defaultCount = sales.filter(s => s.value_received < s.value_negotiated).length;
    const defaultRate = (defaultCount / total) * 100;

    return {
      total_negotiated: totalNegotiated,
      total_received: totalReceived,
      total_pending: totalPending,
      completion_rate: parseFloat(completionRate.toFixed(2)),
      average_days_to_receive: parseFloat(daysToReceive.toFixed(2)),
      default_rate: parseFloat(defaultRate.toFixed(2)),
      total_sales: total,
    };
  }
}

module.exports = Mappers;
