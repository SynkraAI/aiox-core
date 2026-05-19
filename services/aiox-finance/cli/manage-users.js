#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cGFiYXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.SUPABASE_JWT_SECRET_PLACEHOLDER';

const supabase = createClient(supabaseUrl, supabaseKey);

async function manageUsers() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  try {
    switch (command) {
      case 'list':
        await listUsers();
        break;
      case 'create':
        await createUser();
        break;
      case 'edit':
        await editUser();
        break;
      case 'delete':
        await deleteUser();
        break;
      default:
        console.error(`❌ Comando desconhecido: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║           🧑‍💼 Gerenciador de Usuários - AIOX Finance              ║
╚════════════════════════════════════════════════════════════════════╝

Uso: node manage-users.js <comando> [opções]

COMANDOS:
─────────────────────────────────────────────────────────────────────

1️⃣  LIST (Listar todos os usuários)
   node manage-users.js list

2️⃣  CREATE (Criar novo usuário)
   node manage-users.js create \\
     --name "João Silva" \\
     --email "joao@example.com" \\
     --role COMERCIAL \\
     --commission-percentage 10

   Roles disponíveis: ADMIN, COMERCIAL, VENDEDOR, GERENTE

3️⃣  EDIT (Editar usuário existente)
   node manage-users.js edit \\
     --id <user-id> \\
     --name "Novo Nome" \\
     --commission-percentage 15

   Opções: --name, --email, --role, --commission-percentage

4️⃣  DELETE (Deletar usuário)
   node manage-users.js delete --id <user-id>

EXEMPLO COMPLETO:
─────────────────────────────────────────────────────────────────────

# Criar um vendedor
node manage-users.js create \\
  --name "Maria Santos" \\
  --email "maria@example.com" \\
  --role VENDEDOR \\
  --commission-percentage 8

# Listar todos
node manage-users.js list

# Editar comissão
node manage-users.js edit \\
  --id 550e8400-e29b-41d4-a716-446655440000 \\
  --commission-percentage 12

# Deletar
node manage-users.js delete --id 550e8400-e29b-41d4-a716-446655440000

NOTAS:
─────────────────────────────────────────────────────────────────────
• Commission percentage: 0-100 (ex: 10 = 10%)
• Email deve ser único no sistema
• Não é possível deletar usuários com vendas ativas
  `);
}

async function listUsers() {
  console.log('\n🔍 Carregando usuários...\n');

  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, email, role, commission_percentage, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Erro ao listar: ${error.message}`);
  }

  if (!users || users.length === 0) {
    console.log('Nenhum usuário cadastrado\n');
    return;
  }

  console.log('┌────────────────────────────────────────────────────────────────────┐');
  console.log('│ ID (primeiras 8) │ Nome          │ Email            │ Comissão   │');
  console.log('├────────────────────────────────────────────────────────────────────┤');

  users.forEach(user => {
    const id = user.id.substring(0, 8);
    const name = (user.name || '-').substring(0, 13).padEnd(13);
    const email = (user.email || '-').substring(0, 16).padEnd(16);
    const commission = `${user.commission_percentage}%`.padEnd(10);
    console.log(`│ ${id} │ ${name} │ ${email} │ ${commission}│`);
  });

  console.log('└────────────────────────────────────────────────────────────────────┘');
  console.log(`\n✅ Total: ${users.length} usuário${users.length !== 1 ? 's' : ''}\n`);
}

async function createUser() {
  const args = process.argv.slice(2);
  const name = getArg(args, '--name');
  const email = getArg(args, '--email');
  const role = getArg(args, '--role') || 'COMERCIAL';
  const commission = parseFloat(getArg(args, '--commission-percentage') || '10');

  if (!name || !email) {
    console.error('❌ Campos obrigatórios faltando: --name, --email');
    process.exit(1);
  }

  if (commission < 0 || commission > 100) {
    console.error('❌ Commission percentage deve estar entre 0 e 100');
    process.exit(1);
  }

  const validRoles = ['ADMIN', 'COMERCIAL', 'VENDEDOR', 'GERENTE'];
  if (!validRoles.includes(role)) {
    console.error(`❌ Role inválido. Válidos: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  console.log('\n📝 Criando novo usuário...');
  console.log(`   Nome: ${name}`);
  console.log(`   Email: ${email}`);
  console.log(`   Role: ${role}`);
  console.log(`   Comissão: ${commission}%\n`);

  const userId = uuidv4();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      name,
      email,
      role,
      commission_percentage: commission,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar: ${error.message}`);
  }

  console.log('✅ Usuário criado com sucesso!');
  console.log(`   ID: ${data.id}`);
  console.log(`   Nome: ${data.name}`);
  console.log(`   Email: ${data.email}`);
  console.log(`   Role: ${data.role}`);
  console.log(`   Comissão: ${data.commission_percentage}%\n`);
}

async function editUser() {
  const args = process.argv.slice(2);
  const userId = getArg(args, '--id');

  if (!userId) {
    console.error('❌ Campo obrigatório faltando: --id');
    process.exit(1);
  }

  const updateData = {};
  const nameArg = getArg(args, '--name');
  const emailArg = getArg(args, '--email');
  const roleArg = getArg(args, '--role');
  const commissionArg = getArg(args, '--commission-percentage');

  if (nameArg) updateData.name = nameArg;
  if (emailArg) updateData.email = emailArg;
  if (roleArg) {
    const validRoles = ['ADMIN', 'COMERCIAL', 'VENDEDOR', 'GERENTE'];
    if (!validRoles.includes(roleArg)) {
      console.error(`❌ Role inválido. Válidos: ${validRoles.join(', ')}`);
      process.exit(1);
    }
    updateData.role = roleArg;
  }
  if (commissionArg) {
    const commission = parseFloat(commissionArg);
    if (commission < 0 || commission > 100) {
      console.error('❌ Commission percentage deve estar entre 0 e 100');
      process.exit(1);
    }
    updateData.commission_percentage = commission;
  }

  if (Object.keys(updateData).length === 0) {
    console.error('❌ Nenhum campo para atualizar');
    process.exit(1);
  }

  updateData.updated_at = new Date().toISOString();

  console.log('\n✏️  Atualizando usuário...\n');

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao editar: ${error.message}`);
  }

  console.log('✅ Usuário atualizado com sucesso!');
  console.log(`   ID: ${data.id}`);
  console.log(`   Nome: ${data.name}`);
  console.log(`   Email: ${data.email}`);
  console.log(`   Role: ${data.role}`);
  console.log(`   Comissão: ${data.commission_percentage}%\n`);
}

async function deleteUser() {
  const args = process.argv.slice(2);
  const userId = getArg(args, '--id');

  if (!userId) {
    console.error('❌ Campo obrigatório faltando: --id');
    process.exit(1);
  }

  // Get user info first
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', userId)
    .single();

  if (fetchError) {
    throw new Error(`Usuário não encontrado: ${fetchError.message}`);
  }

  console.log('\n🗑️  Deletando usuário...');
  console.log(`   Nome: ${user.name}`);
  console.log(`   Email: ${user.email}\n`);

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    throw new Error(`Erro ao deletar: ${error.message}`);
  }

  console.log('✅ Usuário deletado com sucesso!\n');
}

function getArg(args, flag) {
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return null;
}

manageUsers();
