# 🚀 Guia: Configurar Supabase Cloud (10 minutos)

## Passo 1: Criar Projeto Supabase

1. Acesse **https://supabase.com**
2. Clique **"New Project"**
3. Preencha:
   - **Name:** `aiox-finance` (ou outro nome)
   - **Password:** copie e guarde em local seguro
   - **Region:** escolha mais perto de você
4. Clique **"Create new project"**
5. **Aguarde 2-3 minutos** enquanto ele cria

---

## Passo 2: Copiar Credenciais

Na página do projeto, clique **⚙️ Settings** → **API**

Você verá:
```
Project URL:  https://seu-projeto.supabase.co
Anon public key: eyJhbGc...
```

**Copie e guarde essas 2 coisas!** Você usará no dashboard.

---

## Passo 3: Executar SQL (Criar Tabelas)

1. No menu esquerdo, clique **SQL Editor**
2. Clique **"New Query"**
3. Cole **TODO O CONTEÚDO** do arquivo:
   ```
   SUPABASE-SETUP.sql
   ```
4. Clique **"Run"** (botão verde)
5. Aguarde a mensagem "Success"

✅ Pronto! Tabelas criadas automaticamente!

---

## Passo 4: Verificar Tabelas

1. No menu esquerdo, clique **Table Editor**
2. Você verá:
   - users
   - customers
   - sales
   - commissions

Se ver as 4 tabelas = **sucesso!**

---

## Passo 5: Usar no Dashboard

1. Abra `dashboard.html` no navegador
2. Na aba **⚙️ Configuração**:
   - **URL do Supabase:** cola a Project URL
   - **Chave Anon:** cola a Anon key
3. Clique **"Testar Conexão"**
4. Se aparecer ✅ = **funcionando!**

---

## Passo 6: Criar Usuários

Na linha de comando:

```bash
# Criar ADMIN
node manage-users.js create \
  --name "Admin" \
  --email "admin@example.com" \
  --role ADMIN \
  --commission-percentage 0

# Criar COMERCIAL
node manage-users.js create \
  --name "João Vendedor" \
  --email "joao@example.com" \
  --role COMERCIAL \
  --commission-percentage 10

# Ver lista
node manage-users.js list
```

Copie os **IDs** que aparecerem — você usará no dashboard!

---

## Passo 7: Começar a Usar

1. Abra dashboard.html
2. Na aba **⚙️ Configuração**, selecione seu usuário
3. Vá para **📝 Lançar Nova Venda** e comece!

---

## ✅ Checklist Final

- [ ] Projeto Supabase criado
- [ ] Credenciais copiadas (URL + Key)
- [ ] SQL executado no SQL Editor
- [ ] 4 tabelas visíveis no Table Editor
- [ ] Dashboard testado e conectado
- [ ] 2-3 usuários criados via CLI
- [ ] Dashboard abrindo sem erros
- [ ] Conseguindo lançar vendas

**Tudo verde? = Sistema 100% funcional!** 🎯

---

## 🆘 Troubleshooting

**"Erro ao executar SQL"**
- Copie TUDO o SQL, não parcial
- Cole no "New Query" fresco
- Clique Run

**"Erro ao conectar no dashboard"**
- Copie URL E Chave exatos (sem espaços extras)
- Teste em Configuração → "Testar Conexão"

**"Tabelas não aparecem"**
- Refresh a página (F5)
- Clique em Table Editor novamente

**"Users não aparecem no dropdown"**
- Verifique se executou SQL de criação de users
- Crie usuários via CLI
- Aguarde 2 segundos e recarregue dashboard
