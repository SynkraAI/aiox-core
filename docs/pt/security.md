# Política de Segurança

> 🇺🇸 [English Version](SECURITY.md)

## Versões Suportadas

Lançamos patches para vulnerabilidades de segurança nas seguintes versões:

| Versão | Suportada          |
| ------ | ------------------ |
| 2.1.x  | :white_check_mark: |
| < 2.1  | :x:                |

## Reportando uma Vulnerabilidade

Levamos a segurança a sério na SynkraAI. Se você descobrir uma vulnerabilidade de segurança no AIOS, por favor reporte de forma responsável.

### Como Reportar

**NÃO** crie uma issue pública no GitHub para vulnerabilidades de segurança.

Em vez disso, reporte vulnerabilidades de segurança através de um destes canais:

1. **GitHub Security Advisories** (Preferido)
   - Vá para [Security Advisories](https://github.com/SynkraAI/aios-core/security/advisories)
   - Clique em "Report a vulnerability"
   - Preencha o formulário com detalhes

2. **GitHub Issues (Privado)**
   - Abra um [security advisory privado](https://github.com/SynkraAI/aios-core/security/advisories)
   - Use a linha de assunto: `[SECURITY] Breve descrição`

### O Que Incluir

Por favor, inclua o seguinte em seu relatório:

- **Descrição**: Uma descrição clara da vulnerabilidade
- **Impacto**: O que um atacante poderia conseguir com esta vulnerabilidade?
- **Passos para Reproduzir**: Passos detalhados para reproduzir o problema
- **Versões Afetadas**: Quais versões são afetadas?
- **Possível Correção**: Se você tiver sugestões de como corrigir o problema
- **Suas Informações**: Nome/identificador para reconhecimento (opcional)

### O Que Esperar

1. **Confirmação**: Confirmaremos o recebimento em até 48 horas
2. **Avaliação Inicial**: Forneceremos uma avaliação inicial em até 5 dias úteis
3. **Atualizações**: Manteremos você informado sobre nosso progresso
4. **Resolução**: Visamos resolver problemas críticos em até 30 dias
5. **Divulgação**: Coordenaremos o timing da divulgação com você

### Safe Harbor

Consideramos pesquisa de segurança conduzida de acordo com esta política como:

- Autorizada em relação a quaisquer leis anti-hacking aplicáveis
- Autorizada em relação a quaisquer leis anti-circumvenção relevantes
- Isenta de restrições em nossos Termos de Serviço que interfeririam na condução de pesquisa de segurança

Não perseguiremos ação civil nem iniciaremos reclamação às autoridades para violações acidentais e de boa fé desta política.

## Melhores Práticas de Segurança

Ao usar o AIOS Framework, recomendamos:

### Variáveis de Ambiente

- Nunca commite arquivos `.env` para controle de versão
- Use `.env.example` como template sem valores reais
- Rotacione chaves de API e segredos regularmente

### Segurança de Servidores MCP

- Habilite apenas servidores MCP de fontes confiáveis
- Revise o código do servidor MCP antes de habilitar
- Use ambientes de execução em sandbox quando disponíveis
- Limite permissões do servidor MCP ao mínimo necessário

### Segurança de Agentes IA

- Tenha cuidado com comandos de agentes que executam operações de sistema
- Revise código gerado antes de executar em produção
- Use controles de acesso apropriados para operações sensíveis

### Gerenciamento de Dependências

- Mantenha dependências atualizadas
- Execute `npm audit` regularmente
- Revise mudanças de dependências em pull requests

## Considerações de Segurança Conhecidas

### Arquitetura do Framework

O AIOS Framework executa código e comandos gerados por IA. Usuários devem:

- Entender que agentes IA podem executar código arbitrário
- Usar sandboxing apropriado para ambientes não confiáveis
- Revisar saídas geradas por IA antes de deploy em produção

### Tratamento de Dados

- AIOS pode processar dados sensíveis através de provedores de IA
- Revise as políticas de tratamento de dados do seu provedor de IA
- Considere a classificação de dados ao usar recursos de IA

## Atualizações de Segurança

Atualizações de segurança são anunciadas através de:

- [GitHub Security Advisories](https://github.com/SynkraAI/aios-core/security/advisories)
- [CHANGELOG.md](./CHANGELOG.md)
- GitHub Releases

## Reconhecimentos

Agradecemos aos seguintes pesquisadores por divulgar responsavelmente problemas de segurança:

*Nenhum relatório ainda - seja o primeiro!*

---

*Esta política de segurança está em vigor desde dezembro de 2024.*
*Última atualização: 2025-12-15*
