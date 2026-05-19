// cli/mock-data.js - Dados simulados para DEMO

const mockSalesData = {
  tasks: [
    {
      id: 'task-001',
      name: 'Venda ABC Consultoria',
      status: { status: 'completed' },
      assignees: [{ id: 'seller-1', username: 'João Silva' }],
      due_date: '1712188800000',
      custom_fields: [
        { name: 'Deal Value', value: '50000' },
        { name: 'Paid Amount', value: '50000' },
        { name: 'Payment Method', value: 'PIX' },
        { name: 'Payment Date', value: '2024-04-01' },
      ],
    },
    {
      id: 'task-002',
      name: 'Venda XYZ Serviços',
      status: { status: 'completed' },
      assignees: [{ id: 'seller-2', username: 'Maria Santos' }],
      due_date: '1712188800000',
      custom_fields: [
        { name: 'Deal Value', value: '75000' },
        { name: 'Paid Amount', value: '37500' },
        { name: 'Payment Method', value: 'Boleto' },
        { name: 'Payment Date', value: '2024-04-10' },
      ],
    },
    {
      id: 'task-003',
      name: 'Venda DEF Ltda',
      status: { status: 'open' },
      assignees: [{ id: 'seller-1', username: 'João Silva' }],
      due_date: '1712188800000',
      custom_fields: [
        { name: 'Deal Value', value: '120000' },
        { name: 'Paid Amount', value: '0' },
        { name: 'Payment Method', value: 'Recorrência' },
        { name: 'Payment Date', value: null },
      ],
    },
    {
      id: 'task-004',
      name: 'Venda GHI Indústria',
      status: { status: 'completed' },
      assignees: [{ id: 'seller-3', username: 'Carlos Oliveira' }],
      due_date: '1712188800000',
      custom_fields: [
        { name: 'Deal Value', value: '95000' },
        { name: 'Paid Amount', value: '95000' },
        { name: 'Payment Method', value: 'PIX' },
        { name: 'Payment Date', value: '2024-03-25' },
      ],
    },
    {
      id: 'task-005',
      name: 'Venda JKL Comércio',
      status: { status: 'open' },
      assignees: [{ id: 'seller-2', username: 'Maria Santos' }],
      due_date: '1712188800000',
      custom_fields: [
        { name: 'Deal Value', value: '65000' },
        { name: 'Paid Amount', value: '65000' },
        { name: 'Payment Method', value: 'Boleto' },
        { name: 'Payment Date', value: '2024-04-05' },
      ],
    },
  ],
};

const mockClientsData = {
  tasks: [
    {
      id: 'client-001',
      name: 'ABC Consultoria LTDA',
      custom_fields: [
        { name: 'Email', value: 'contato@abc.com' },
        { name: 'Phone', value: '11 3000-0000' },
        { name: 'Company Size', value: 'Média' },
        { name: 'Industry', value: 'Consultoria' },
        { name: 'Risk Score', value: 'Baixo' },
        { name: 'Last Payment Date', value: '2024-04-01' },
      ],
    },
    {
      id: 'client-002',
      name: 'XYZ Serviços e Soluções',
      custom_fields: [
        { name: 'Email', value: 'vendas@xyz.com' },
        { name: 'Phone', value: '11 3001-0000' },
        { name: 'Company Size', value: 'Grande' },
        { name: 'Industry', value: 'Tecnologia' },
        { name: 'Risk Score', value: 'Médio' },
        { name: 'Last Payment Date', value: '2024-04-10' },
      ],
    },
    {
      id: 'client-003',
      name: 'DEF Manufatura Brasil',
      custom_fields: [
        { name: 'Email', value: 'compras@def.com.br' },
        { name: 'Phone', value: '21 3010-0000' },
        { name: 'Company Size', value: 'Grande' },
        { name: 'Industry', value: 'Manufatura' },
        { name: 'Risk Score', value: 'Alto' },
        { name: 'Last Payment Date', value: null },
      ],
    },
    {
      id: 'client-004',
      name: 'GHI Indústria e Comércio',
      custom_fields: [
        { name: 'Email', value: 'financeiro@ghi.com' },
        { name: 'Phone', value: '31 3020-0000' },
        { name: 'Company Size', value: 'Média' },
        { name: 'Industry', value: 'Indústria' },
        { name: 'Risk Score', value: 'Baixo' },
        { name: 'Last Payment Date', value: '2024-03-25' },
      ],
    },
    {
      id: 'client-005',
      name: 'JKL Comércio Eletrônico',
      custom_fields: [
        { name: 'Email', value: 'suporte@jkl.com.br' },
        { name: 'Phone', value: '85 3030-0000' },
        { name: 'Company Size', value: 'Pequena' },
        { name: 'Industry', value: 'E-commerce' },
        { name: 'Risk Score', value: 'Médio' },
        { name: 'Last Payment Date', value: '2024-04-05' },
      ],
    },
  ],
};

module.exports = {
  mockSalesData,
  mockClientsData,
};
