Ao receber este comando, siga EXATAMENTE estes passos:

1. **Atualize o catálogo** rodando `node scripts/generate-catalog.js` via Bash

2. **Sincronize projetos com o bot** rodando:
   ```
   BOT_API_URL=http://178.156.242.82:3000 SYNC_API_KEY=bf3baae3852e6668855840f50164b383faf4aae4f018b47a69cf713d5316bb55 node scripts/generate-project-pulse.js
   ```

3. **Confirme ao usuário** com as contagens do catálogo + quantidade de projetos sincronizados (ex: "Catálogo atualizado — 50 squads, 35 skills, 7 tools, 12 agents. 21 projetos sincronizados com o bot."). NÃO liste nomes, NÃO leia o catalog.md. Apenas confirme e PARE.

4. **Aguarde instrução** — o usuário pode pedir para ativar qualquer squad, skill, tool ou agent listado. Para ativar:
   - **Squad:** Leia o arquivo `squads/{nome}/README.md` e siga as instruções
   - **Skill:** Leia o arquivo `skills/{nome}/SKILL.md` e siga as instruções
   - **Agent:** Leia o arquivo `.aios-core/development/agents/{nome}.md` e ative
   - **Task específica de squad:** Leia `squads/{nome}/tasks/{task}.md` e execute
