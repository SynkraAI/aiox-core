<!--
  Tradução: PT-BR
  Original: /docs/guides/build-recovery-guide.md
  Última sincronização: 2026-01-29
-->

# Guia de Recuperação de Build

> **Story:** 8.4 - Recuperação e Retomada de Build
> **Epic:** Epic 8 - Motor de Build Autônomo

---

## Visão Geral

O sistema de Recuperação de Build permite que builds autônomos retomem de checkpoints após falhas ou interrupções. Em vez de recomeçar do zero, os builds continuam do último ponto bem-sucedido.

---

## Funcionalidades Principais

| Funcionalidade              | Descrição                                     |
| --------------------------- | --------------------------------------------- |
| **Checkpoints**             | Salvos automaticamente após cada subtask      |
| **Retomada**                | Continuar do último checkpoint                |
| **Monitoramento de Status** | Progresso do build em tempo real              |
| **Detecção de Abandono**    | Alertas para builds parados (>1 hora)         |
| **Notificações de Falha**   | Alertas quando travado ou máximo de iterações |
| **Log de Tentativas**       | Histórico completo para debugging             |

---

## Comandos

### Verificar Status do Build

```bash
# Build único
*build-status story-8.4

# Todos os builds ativos
*build-status --all
```

### Retomar Build com Falha

```bash
*build-resume story-8.4
```

### Ver Log de Tentativas

```bash
*build-log story-8.4

# Filtrar por subtask
*build-log story-8.4 --subtask 2.1

# Limitar saída
*build-log story-8.4 --limit 20
```

### Limpar Builds Abandonados

```bash
*build-cleanup story-8.4

# Forçar limpeza (mesmo builds ativos)
*build-cleanup story-8.4 --force
```

---

## Schema de Estado do Build

O estado do build é armazenado em `plan/build-state.json`:

```json
{
  "storyId": "story-8.4",
  "status": "in_progress",
  "startedAt": "2026-01-29T10:00:00Z",
  "lastCheckpoint": "2026-01-29T11:30:00Z",
  "currentPhase": "phase-2",
  "currentSubtask": "2.3",
  "completedSubtasks": ["1.1", "1.2", "2.1", "2.2"],
  "checkpoints": [...],
  "metrics": {
    "totalSubtasks": 10,
    "completedSubtasks": 4,
    "totalAttempts": 6,
    "totalFailures": 2
  }
}
```

---

## Valores de Status

| Status        | Descrição                     |
| ------------- | ----------------------------- |
| `pending`     | Build criado mas não iniciado |
| `in_progress` | Build em execução atualmente  |
| `paused`      | Build pausado manualmente     |
| `abandoned`   | Sem atividade por >1 hora     |
| `failed`      | Build falhou (pode retomar)   |
| `completed`   | Build finalizado com sucesso  |

---

## Sistema de Checkpoints

Checkpoints são salvos automaticamente após a conclusão de cada subtask:

```
plan/
├── build-state.json        # Arquivo principal de estado
├── build-attempts.log      # Log de tentativas
└── checkpoints/            # Snapshots de checkpoint
    ├── cp-lxyz123-abc.json
    ├── cp-lxyz124-def.json
    └── ...
```

Cada checkpoint contém:

- Timestamp
- ID da Subtask
- Commit Git (se disponível)
- Arquivos modificados
- Duração e contagem de tentativas

---

## Integração com Epic 5

A Recuperação de Build integra com o Sistema de Recuperação (Epic 5):

| Componente            | Uso                              |
| --------------------- | -------------------------------- |
| `stuck-detector.js`   | Detecta falhas circulares        |
| `recovery-tracker.js` | Rastreia histórico de tentativas |

Quando builds travam (3+ falhas consecutivas), o sistema:

1. Gera sugestões baseadas em padrões de erro
2. Cria notificação para revisão humana
3. Marca subtask como "travada"

---

## Detecção de Build Abandonado

Builds são marcados como abandonados se:

- Status é `in_progress`
- Nenhum checkpoint por >1 hora (configurável)

Para detectar e tratar:

```bash
# Verificar se abandonado
*build-status story-8.4  # Mostra aviso se abandonado

# Limpeza
*build-cleanup story-8.4
```

---

## Uso Programático

```javascript
const { BuildStateManager, BuildStatus } = require('.aios-core/core/execution/build-state-manager');

// Criar gerenciador
const manager = new BuildStateManager('story-8.4', {
  planDir: './plan',
});

// Criar ou carregar estado
const state = manager.loadOrCreateState({ totalSubtasks: 10 });

// Iniciar subtask
manager.startSubtask('1.1', { phase: 'phase-1' });

// Completar subtask (checkpoint automático)
manager.completeSubtask('1.1', {
  duration: 5000,
  filesModified: ['src/file.js'],
});

// Registrar falha
const result = manager.recordFailure('1.2', {
  error: 'Erro TypeScript',
  attempt: 1,
});

// Verificar se travado
if (result.isStuck) {
  console.log('Sugestões:', result.suggestions);
}

// Retomar build
const context = manager.resumeBuild();

// Obter status
const status = manager.getStatus();
console.log(`Progresso: ${status.progress.percentage}%`);
```

---

## Configuração

A configuração padrão pode ser sobrescrita:

```javascript
const manager = new BuildStateManager('story-8.4', {
  config: {
    maxIterations: 10, // Máximo de tentativas por subtask
    globalTimeout: 1800000, // 30 minutos
    abandonedThreshold: 3600000, // 1 hora
    autoCheckpoint: true, // Salvar checkpoints automaticamente
  },
});
```

---

## Solução de Problemas

### "Nenhum estado de build encontrado"

Build ainda não iniciou. Execute `*build story-id` para iniciar.

### "Build já completado"

Não é possível retomar builds completados. Inicie um novo build se necessário.

### "Worktree ausente"

O worktree isolado foi deletado. Opções:

1. Recriar worktree e retomar
2. Começar do zero com novo build

### Build Travado

Se o build está travado (mesmo erro se repetindo):

1. Verifique sugestões nas notificações
2. Revise o log de tentativas: `*build-log story-id`
3. Tente abordagem diferente ou escale

---

## Melhores Práticas

1. **Verifique o status regularmente** durante builds longos
2. **Revise os logs** ao debugar falhas
3. **Limpe builds abandonados** para liberar recursos
4. **Use checkpoints** - não desabilite checkpoint automático
5. **Monitore notificações** para alertas de travamento

---

_Guia para Story 8.4 - Recuperação e Retomada de Build_
_Parte do Epic 8 - Motor de Build Autônomo_
