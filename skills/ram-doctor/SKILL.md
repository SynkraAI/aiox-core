---
name: ram-doctor
description: "Seu Mac está lento? Eu descubro por quê e limpo o que puder — sem derrubar nada importante."
  Diagnóstico e limpeza de memória RAM no macOS. Analisa uso de memória, categoriza
  processos (sistema vs usuário vs dev), recomenda o que fechar e executa cleanup
  com confirmação. Zero dependências — usa apenas comandos nativos do macOS.
description_pt-BR: >-
  Médico de RAM para macOS. Diagnostica lentidão, identifica processos pesados,
  separa o que é do sistema (intocável) do que é app/dev server (fechável),
  e limpa com sua aprovação. Sem instalar nada.
version: "1.0.0"
categories: [utility, system, macos, performance]
allowed-tools: Bash, Read, AskUserQuestion
risk: moderate
source: self
lazy_load: true
context_budget: 400

category: general
tags: [SKILL]
---

# RAM Doctor — Diagnóstico e Limpeza de Memória no macOS

> Seu Mac está lento? Eu descubro por quê e limpo o que puder — sem derrubar nada importante.

**Analogia:** Pensa num pronto-socorro. Você chega com o Mac "passando mal" e eu faço a triagem: meço a febre (RAM), verifico os sinais vitais (swap, load), identifico o que está causando o problema, e proponho o tratamento. Mas não opero sem sua autorização.

## Quando Usar

- Mac lento, fan girando sem parar, apps travando
- Quer saber o que está consumindo memória
- Dev servers órfãos rodando em background
- Múltiplas sessões do Claude Code acumuladas
- Swap alto depois de muitos dias sem reiniciar
- Antes de iniciar trabalho pesado (build, testes) e quer liberar recursos

## Quando NÃO Usar

- Lentidão causada por disco cheio (use `df -h` ou Mole)
- Problemas de rede ou internet lenta
- Mac com defeito de hardware
- Linux ou Windows (esta skill é macOS-only)

## Dependências

**ZERO.** Usa apenas comandos nativos do macOS:

| Comando | O que faz | Disponível em |
|---------|-----------|---------------|
| `vm_stat` | Estatísticas de memória virtual | Todos os macOS |
| `memory_pressure` | Percentual de memória livre | macOS 10.9+ |
| `sysctl` | Parâmetros do kernel | Todos os macOS |
| `top` (modo batch) | Snapshot de processos | Todos os macOS |
| `ps` | Lista de processos detalhada | Todos os macOS |
| `uptime` | Tempo ligado e load average | Todos os macOS |
| `kill` | Encerrar processos | Todos os macOS |

---

## Discovery Questions

Perguntas antes de executar. Usar AskUserQuestion. **Pular se o contexto já foi fornecido ou se o usuário pediu diagnóstico direto.**

1. **Quer diagnóstico completo ou só ver o que está consumindo RAM?** — (completo inclui recomendações e cleanup; rápido só mostra o estado)
2. **Tem algo rodando que NÃO pode ser fechado?** — (ex: "não fecha o Brave" ou "o Docker precisa ficar") *(opcional)*

---

## Workflow

### Phase 0: Preflight Check

Verificar que estamos no macOS:

```bash
uname -s
# Deve retornar "Darwin". Se não → VETO_NOT_MACOS.
```

**Veto conditions:**
- `uname -s` != "Darwin" → HALT: "Esta skill é exclusiva para macOS."

---

### Phase 1: Diagnóstico (automático, sem interação)

Executar TODOS os comandos abaixo em **paralelo** (Bash tool calls independentes):

#### 1.1 Métricas de Sistema

```bash
# Comando 1: RAM total + swap + pressure level
echo "=== RAM ===" && sysctl hw.memsize && echo "" && echo "=== SWAP ===" && sysctl vm.swapusage && echo "" && echo "=== PRESSURE LEVEL ===" && sysctl kern.memorystatus_vm_pressure_level 2>/dev/null || echo "N/A"
```

```bash
# Comando 2: Memory pressure percentual
memory_pressure 2>&1 | grep "System-wide"
```

```bash
# Comando 3: Load average + uptime
uptime
```

```bash
# Comando 4: vm_stat snapshot
vm_stat
```

#### 1.2 Classificar Estado

Com os dados coletados, calcular e classificar:

| Métrica | GREEN | YELLOW | RED | CRITICAL |
|---------|-------|--------|-----|----------|
| Memory free % | >50% | 30-50% | 15-30% | <15% |
| Swap usado | <2 GB | 2-8 GB | 8-15 GB | >15 GB |
| Load avg / cores | <1.0 | 1.0-3.0 | 3.0-8.0 | >8.0 |
| Uptime (dias) | <3 | 3-7 | 7-14 | >14 |

**Estado geral** = pior classificação entre as métricas.

#### 1.3 Apresentar Diagnóstico

Formato de saída:

```
## Diagnóstico do Sistema

| Métrica          | Valor         | Estado   |
|------------------|---------------|----------|
| RAM Total        | 16 GB         | —        |
| RAM Usada        | 15.2 GB       | RED      |
| RAM Livre        | 144 MB        | RED      |
| Swap Usado       | 19.2 GB       | CRITICAL |
| Memory Pressure  | 29% livre     | YELLOW   |
| Load Average     | 70 / 10 cores | CRITICAL |
| Uptime           | 7 dias        | YELLOW   |

**Estado Geral: CRITICAL**
Seu Mac está como um ônibus lotado na hora do rush — todo mundo espremido
e ninguém consegue se mexer. Precisa liberar espaço.
```

**Analogias por estado (usar a apropriada):**
- **GREEN:** "Tudo tranquilo. Seu Mac está como uma autoestrada de madrugada — via livre."
- **YELLOW:** "Atenção. Está como um restaurante no horário de almoço — cheio mas funcionando."
- **RED:** "Problemático. Seu Mac está como um elevador lotado — funciona, mas ninguém respira."
- **CRITICAL:** "Emergência. Está como um ônibus lotado na hora do rush — espremido e travando."

**Completion criteria:** Diagnóstico apresentado com tabela e classificação.

---

### Phase 2: Inventário de Processos

#### 2.1 Coletar Top 30 Processos por Memória

```bash
# Top 30 com PID, comando, memória e CPU
top -l 1 -o mem -n 30 -stats pid,command,mem,cpu | tail -31
```

#### 2.2 Identificar Detalhes dos Processos Pesados

Para cada processo com >200MB, coletar detalhes:

```bash
# Owner e linha de comando completa dos top processos
ps -eo pid,user,rss,comm -r | head -30 | awk '{printf "%-8s %-12s %6.0f MB  %s\n", $1, $2, $3/1024, $4}'
```

Para processos node pesados, identificar o que estão rodando:

```bash
# Detalhes de processos Node.js
ps -eo pid,rss,args | grep -E "[n]ode" | sort -k2 -rn | head -15 | awk '{printf "PID %-7s %6.0f MB  %s %s %s %s\n", $1, $2/1024, $3, $4, $5, $6}'
```

#### 2.3 Categorizar Cada Processo

Aplicar as regras de categorização **nesta ordem de prioridade**:

```
REGRA 1 — SYSTEM (NEVER KILL)
  Condição: owner == "root" OR owner starts with "_"
  Exemplos: kernel_task, launchd, WindowServer, mds_stores, coreaudiod
  Ação: Marcar como 🔒 SYSTEM — nunca sugerir fechar
  Exceção visual: se RSS > 1.5 GB, marcar como ⚠️ SYSTEM_HEAVY
    → Não matar, mas sugerir "reiniciar o Mac resolve isso"

REGRA 2 — CURRENT SESSION (PROTECTED)
  Condição: PID está na árvore do processo atual ($$, $PPID, ou ancestrais)
  Detecção: comparar com PID da sessão Claude Code ativa
  Ação: Marcar como 🛡️ PROTECTED — é a sessão atual, jamais tocar

REGRA 3 — CLAUDE CODE SESSIONS
  Condição: comm matches regex /^\d+\.\d+\.\d+$/ OR comm == "cmux" OR comm == "claude"
  Ação: Marcar como 🤖 CLAUDE_SESSION
  Recomendação: "Sessão antiga do Claude Code — pode fechar"
  IMPORTANTE: Excluir sessão protegida pela Regra 2

REGRA 4 — DEV SERVERS
  Condição: args matches /(vite|next-server|next dev|webpack|metro|expo|esbuild|nodemon|ts-node|tsx)/
  Ação: Marcar como 🔧 DEV_SERVER
  Recomendação: "Dev server — pode fechar se não está trabalhando nesse projeto"
  Detalhe: Extrair nome do projeto do path (ex: "MiroFish frontend")

REGRA 5 — CONTAINERS / VMs
  Condição: comm matches /(docker|com\.docker|com\.apple\.Virtualization|qemu|lima|colima)/
  Ação: Marcar como 📦 CONTAINER
  Recomendação: "Docker/VM — fechar libera bastante RAM"

REGRA 6 — KNOWN APPS
  Condição: comm matches app conhecidos (tabela abaixo)
  Ação: Marcar como 📱 APP
  Recomendação: Específica por app (ver tabela)

REGRA 7 — UNKNOWN USER PROCESS
  Condição: owner == username AND não caiu em nenhuma regra acima
  Ação: Marcar como ❓ UNKNOWN
  Recomendação: "Processo do usuário desconhecido — investigar antes de fechar"

REGRA 8 — APPLE USERSPACE SERVICE
  Condição: comm starts with "com.apple." AND owner != root
  Ação: Marcar como 🍎 APPLE_SERVICE
  Recomendação: "Serviço Apple no userspace — geralmente seguro ignorar"
```

#### Tabela de Apps Conhecidos

| Pattern (comm ou args) | Nome Amigável | Recomendação |
|----------------------|---------------|--------------|
| `Brave Browser`, `Google Chrome`, `Safari`, `Firefox`, `Arc` | Browser | "Fechar abas libera memória. Fechar o app libera tudo." |
| `Obsidian` | Obsidian | "App de notas — fecha se não está usando agora" |
| `Slack` | Slack | "Mensageiro — fecha se não está em conversa ativa" |
| `Discord` | Discord | "Chat — fecha se não precisa agora" |
| `Spotify`, `Music` | Player de música | "Player — fecha se não está ouvindo" |
| `Figma`, `Sketch` | Design tool | "Ferramenta de design — consome bastante RAM" |
| `Cursor`, `Code`, `code-insiders` | IDE | "Editor de código — fecha projetos que não está usando" |
| `Stream Deck` | Stream Deck | "Controle de atalhos — opcional" |
| `Dropbox` | Dropbox | "Sincronização — consome RAM constante" |
| `Zoom`, `FaceTime`, `Teams` | Videoconferência | "App de reunião — fecha se não tem call agora" |
| `Finder` | Finder | "Explorador de arquivos — se >500MB, janelas demais abertas" |
| `Electron`, `Antigravity` | App Electron | "App baseado em Electron — naturalmente pesado" |
| `language_server_` | Language Server | "LSP de IDE — fecha com a IDE" |
| `Postman` | Postman | "Testador de API — fecha se não está usando" |

#### 2.4 Apresentar Inventário

Formato de saída — agrupar por categoria e ordenar por RAM dentro de cada grupo:

```
## Inventário de Processos (Top 20 por RAM)

### 🔒 SYSTEM (intocável)
| PID   | Processo      | RAM    | Nota                    |
|-------|---------------|--------|-------------------------|
| 405   | WindowServer  | 2.0 GB | Renderização de tela    |
| 402   | com.apple.cmio| 2.0 GB | ⚠️ HEAVY — restart resolve |

### 🤖 CLAUDE CODE (X sessões, Y GB total)
| PID   | Versão | RAM   | Status    |
|-------|--------|-------|-----------|
| 87456 | 2.1.83 | 732 MB| Antiga    |
| 32525 | 2.1.83 | 892 MB| Antiga    |
| 92997 | 2.1.81 | 570 MB| 🛡️ ATUAL |

### 🔧 DEV SERVERS (X processos, Y GB total)
| PID   | Projeto            | RAM    |
|-------|--------------------|--------|
| 60845 | next-server        | 1.6 GB |
| 62302 | MiroFish (vite)    | 1.3 GB |

### 📦 CONTAINERS (X processos, Y GB total)
| PID   | Tipo    | RAM    |
|-------|---------|--------|
| 30995 | Docker  | 1.6 GB |

### 📱 APPS (X processos, Y GB total)
| PID   | App          | RAM    | Recomendação         |
|-------|--------------|--------|----------------------|
| 46422 | Obsidian     | 1.2 GB | Fecha se não usa     |
| 49132 | Brave        | 641 MB | Fechar abas/app      |

### 💡 Resumo de Liberação Potencial
| Categoria     | Processos | RAM Total | Ação           |
|---------------|-----------|-----------|----------------|
| Claude Code   | 13        | ~6.8 GB   | Fechar antigas |
| Dev Servers   | 2         | ~2.9 GB   | Fechar ociosos |
| Containers    | 1         | ~1.6 GB   | Fechar Docker  |
| Apps          | 3         | ~2.0 GB   | Sua escolha    |
| **TOTAL LIBERÁVEL** | **19** | **~13.3 GB** | |
```

**Completion criteria:** Inventário categorizado apresentado com resumo de liberação.

---

### Phase 3: Recomendações

Gerar recomendações **ordenadas por impacto** (mais RAM liberada primeiro):

```
## Recomendações (ordenadas por impacto)

1. **Fechar sessões antigas do Claude Code** (~6.8 GB)
   → 13 sessões ociosas. Manter apenas a atual.

2. **Fechar dev servers ociosos** (~2.9 GB)
   → next-server e Vite MiroFish. Fechar se não está trabalhando neles.

3. **Fechar Docker** (~1.6 GB)
   → Nenhum container ativo necessário.

4. **Fechar apps opcionais** (~2.0 GB)
   → Obsidian (1.2 GB), Brave (641 MB). Sua escolha.

5. **Reiniciar o Mac** (recomendado se uptime > 7 dias)
   → Limpa swap acumulado e memory leaks do sistema (cmio com 2 GB).

**RAM liberável estimada: ~13.3 GB de 16 GB**
```

**REGRAS PARA RECOMENDAÇÕES:**
- NUNCA recomendar fechar processos SYSTEM
- NUNCA fechar a sessão atual do Claude Code (PROTECTED)
- SEMPRE agrupar sessões Claude Code como uma ação só
- SEMPRE mostrar quanto de RAM cada ação libera
- Se uptime > 7 dias E swap > 10 GB → recomendar restart como opção final
- Se estado = GREEN → "Tudo OK! Nenhuma ação necessária."

**Completion criteria:** Lista de recomendações apresentada, aguardando escolha do usuário.

---

### Phase 4: Ação (com confirmação OBRIGATÓRIA)

#### 4.1 Perguntar ao Usuário

Usar **AskUserQuestion** para confirmar:

```
Quais ações quer executar?

1. Fechar sessões antigas do Claude Code (~6.8 GB)
2. Fechar dev servers (~2.9 GB)
3. Fechar Docker (~1.6 GB)
4. Fechar Obsidian (~1.2 GB)
5. Todas as acima
6. Nenhuma — só queria o diagnóstico

Ou especifique: "1 e 3" / "todas menos 4" / etc.
```

**Veto conditions:**
- Usuário escolhe "6" ou "nenhuma" → STOP, agradecer e encerrar
- Usuário pede pra fechar processo SYSTEM → BLOCK: "Não posso fechar [processo] — é do sistema. Matar isso derrubaria [consequência]."

#### 4.2 Executar Cleanup

Para cada categoria aprovada pelo usuário:

**Claude Code sessions:**
```bash
# Listar PIDs das sessões antigas (excluir PID atual e seus pais)
# Usar kill -TERM (graceful) primeiro
kill -TERM <PID1> <PID2> <PID3> ...
```

**Dev servers:**
```bash
kill -TERM <PID>
# Se não morrer em 3 segundos:
kill -9 <PID>
```

**Apps (via osascript quando possível para saída limpa):**
```bash
osascript -e 'quit app "NomeDoApp"'
# Fallback se não funcionar:
kill -TERM <PID>
```

**Docker:**
```bash
# Parar via app é mais limpo que kill
osascript -e 'quit app "Docker"'
# Fallback:
kill -TERM <PID>
```

**REGRAS DE EXECUÇÃO:**
- SEMPRE usar `kill -TERM` antes de `kill -9`
- SEMPRE tentar `osascript -e 'quit app "X"'` para apps GUI
- NUNCA usar `kill -9` como primeira opção
- NUNCA matar processos sem confirmação explícita
- Executar kills em **paralelo** (Bash tool calls independentes) quando possível

#### 4.3 Verificar Resultado

Aguardar 3 segundos e executar novo diagnóstico resumido:

```bash
# Snapshot pós-cleanup
echo "=== Memória ===" && top -l 1 -n 1 -stats command,mem | head -12 | grep -E "PhysMem|VM" && echo "" && echo "=== Swap ===" && sysctl vm.swapusage && echo "" && echo "=== Load ===" && uptime && echo "" && echo "=== Pressure ===" && memory_pressure 2>&1 | grep "System-wide"
```

#### 4.4 Apresentar Antes/Depois

```
## Resultado do Cleanup

| Métrica         | Antes    | Depois   | Melhoria |
|-----------------|----------|----------|----------|
| RAM Livre       | 144 MB   | 3.2 GB   | +3.1 GB  |
| Swap Usado      | 19.2 GB  | 15.1 GB  | -4.1 GB  |
| Load Average    | 70       | 12       | -83%     |
| Memory Pressure | 29%      | 52%      | +23%     |
| Processos       | 821      | 790      | -31      |

✅ Cleanup concluído! Liberamos ~X GB de RAM.

💡 Dica: com 7 dias de uptime e swap ainda alto (15 GB),
   um restart limparia o restante.
```

**Completion criteria:** Tabela antes/depois apresentada com métricas concretas.

---

## Veto Conditions

| ID | Trigger | Ação |
|----|---------|------|
| VETO_NOT_MACOS | `uname -s` != "Darwin" | HALT — "Esta skill é exclusiva para macOS." |
| VETO_KILL_SYSTEM | Usuário pede para fechar processo com owner root/_ | BLOCK — "Não posso fechar [processo]. É como desligar o motor do carro andando." |
| VETO_KILL_CURRENT | Tentativa de matar sessão Claude Code atual | BLOCK — "Essa é a sessão que estamos usando agora!" |
| VETO_GREEN_STATE | Estado = GREEN e usuário pede cleanup | INFO — "Tudo OK! Seu Mac está saudável. Nenhuma ação necessária." |
| VETO_NO_CONFIRM | Tentativa de matar sem confirmação do usuário | BLOCK — "Preciso da sua confirmação antes de fechar qualquer coisa." |

---

## Troubleshooting

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| Processo não morre com TERM | App travado ou ignorando SIGTERM | Usar `kill -9 PID` (force kill) |
| Swap continua alto após cleanup | Swap demora a liberar | Normal — o sistema reabsorve gradualmente. Restart resolve imediatamente. |
| Load average alto mas RAM OK | Problema de CPU, não RAM | Fora do escopo — verificar CPU com `top` |
| `memory_pressure` não encontrado | macOS muito antigo (<10.9) | Usar apenas vm_stat para diagnóstico |
| App fecha mas reabre sozinho | Gerenciado por launchd | Usar `launchctl unload <plist>` para desabilitar |
| Docker não fecha via osascript | Docker Desktop travado | `kill -9` no processo Docker |
| cm_io usando >2GB | Memory leak do serviço de câmera | Só resolve com restart do Mac |

---

## Referências Técnicas

### Como o macOS gerencia memória

```
RAM Física (ex: 16 GB)
├── Wired (kernel + drivers — intocável, como o motor do carro)
├── Active (apps em uso — como passageiros sentados)
├── Inactive (usado recentemente — como assentos "reservados")
├── Compressed (comprimido na RAM — como bagagem no porta-malas)
├── Free (disponível — assentos vazios)
└── Purgeable (cache descartável — como revista no bolso do assento)

Quando RAM esgota:
1. Compressor comprime páginas inativas (rápido, como comprimir mala)
2. Se compressor enche → swap para SSD (lento, como guardar mala no bagageiro externo)
3. Se swap enche → sistema fica lento (como trânsito parado)
```

### APIs nativas usadas

| API | O que retorna | Performance |
|-----|---------------|-------------|
| `sysctl hw.memsize` | RAM total em bytes | ~1µs |
| `sysctl vm.swapusage` | Swap total/usado/livre | ~1µs |
| `sysctl kern.memorystatus_vm_pressure_level` | 1=NORMAL, 2=WARN, 4=CRITICAL | ~1µs |
| `vm_stat` | Páginas por estado (free, active, inactive, wired, compressor) | ~1ms |
| `memory_pressure` | % de memória livre do sistema | ~100ms |
| `top -l 1` | Snapshot de processos (não interativo) | ~2s |
| `ps -eo pid,user,rss,comm -r` | Lista de processos por RSS | ~50ms |

### Page size no Apple Silicon

- Apple Silicon (M1-M5): **16384 bytes** (16 KB) por página
- Intel Mac: **4096 bytes** (4 KB) por página
- vm_stat reporta em páginas — multiplicar pelo page size para obter bytes
- O page size é informado na primeira linha do vm_stat

---

## Quick Reference — Comandos Úteis

```bash
# Diagnóstico rápido em uma linha
echo "RAM: $(memory_pressure 2>&1 | grep 'System-wide' | awk '{print $5}') livre | Swap: $(sysctl -n vm.swapusage | awk '{print $6}') usado | Load: $(uptime | awk -F'averages: ' '{print $2}' | awk -F',' '{print $1}')"

# Top 10 processos por memória
top -l 1 -o mem -n 10 -stats pid,command,mem | tail -11

# Encontrar dev servers Node.js
ps -eo pid,rss,args | grep -E "[n]ode.*(vite|next|webpack|metro)" | sort -k2 -rn

# Encontrar sessões Claude Code
ps -eo pid,rss,comm | grep -E "[0-9]+\.[0-9]+\.[0-9]+|cmux|claude" | sort -k2 -rn

# Memory pressure como número
memory_pressure 2>&1 | grep 'System-wide' | awk '{print $5}' | tr -d '%'

# Verificar owner de um processo (sistema ou usuário?)
ps -p <PID> -o user= | grep -qE "^(root|_)" && echo "SYSTEM" || echo "USER"

# Matar processo gracefully (com fallback)
kill -TERM <PID> && sleep 2 && kill -0 <PID> 2>/dev/null && kill -9 <PID>

# Fechar app GUI limpo
osascript -e 'quit app "NomeDoApp"'
```
