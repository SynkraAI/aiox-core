<!--
  Tradução: PT-BR
  Original: /docs/en/performance-tuning-guide.md
  Última sincronização: 2026-01-26
-->

# Guia de Otimização de Performance do Synkra AIOX

> 🌐 [EN](../performance-tuning-guide.md) | **PT** | [ES](../es/performance-tuning-guide.md)

---

## Visao Geral

Este guia abrangente fornece estratégias, ferramentas e melhores práticas para otimizar a performance do Synkra AIOX em todos os componentes críticos.

## Metas de Performance

### Metas de Produção
- **Tempo de resposta do meta-agent**: < 500ms (p95)
- **Consultas da camada de memória**: < 200ms (p95)
- **Geração de componentes**: < 2 segundos
- **Assistente de instalação**: < 2 minutos no total
- **Uso de memória**: < 512MB sob carga normal
- **Uso de CPU**: < 60% carga sustentada

### Metas de Desenvolvimento
- **Inicialização do desenvolvimento local**: < 30 segundos
- **Hot reload**: < 3 segundos
- **Execução da suite de testes**: < 2 minutos

## Kit de Ferramentas para Otimização de Performance

### 1. Performance Profiler
```javascript
const { PerformanceProfiler } = require('./performance/profiler');

const profiler = new PerformanceProfiler({
  enabled: true,
  reportPath: '.aiox/reports/performance.json'
});

// Perfila qualquer operação
const result = await profiler.profileFunction(
  'operation-name',
  async () => {
    // Sua operação custosa
    return await expensiveOperation();
  },
  { category: 'meta-agent' }
);
```

### 2. Cache Manager
```javascript
const { getGlobalCacheManager } = require('./performance/cache-manager');

const cache = getGlobalCacheManager();

// Armazena resultados de funções em cache
const result = await cache.cacheFunction(
  'expensive-operation',
  [arg1, arg2],
  expensiveFunction,
  'memory-queries',
  { ttl: 30 * 60 * 1000 } // 30 minutos
);
```

### 3. Memory Query Optimizer
```javascript
const { getGlobalMemoryOptimizer } = require('./performance/memory-query-optimizer');

const optimizer = getGlobalMemoryOptimizer();

// Otimiza consultas vetoriais
const results = await optimizer.optimizeQuery(
  'vector-similarity',
  vectorQuery,
  { topK: 10, threshold: 0.7 },
  originalQueryFunction
);
```

### 4. Performance Monitor
```javascript
const { getGlobalPerformanceMonitor } = require('./performance/performance-monitor');

const monitor = getGlobalPerformanceMonitor();

// Monitora operação
const operationId = 'op-' + Date.now();
monitor.startOperation(operationId, 'meta-agent-task');
// ... executa operação
monitor.endOperation(operationId, true, { result: 'success' });
```

## Otimizações de Caminho Crítico

### 1. Operações do Meta-Agent

#### Criação de Componentes
```javascript
// ❌ Não otimizado
async function createComponent(template, context) {
  const rendered = await renderTemplate(template, context);
  const validated = await validateComponent(rendered);
  const written = await writeFiles(validated);
  return written;
}

// ✅ Otimizado
async function createComponent(template, context) {
  const cache = getGlobalCacheManager();

  // Armazena renderização de template em cache
  const rendered = await cache.cacheComponentTemplate(
    template.name,
    context,
    () => renderTemplate(template, context)
  );

  // Validação e escrita de arquivos em paralelo
  const [validated, _] = await Promise.all([
    validateComponent(rendered),
    cache.cacheFileOperation('template-stats', template.path,
      () => analyzeTemplate(template))
  ]);

  return await writeFiles(validated);
}
```

#### Execução de Tasks
```javascript
// ✅ Execução de task otimizada com monitoramento
async function executeTask(task) {
  const monitor = getGlobalPerformanceMonitor();
  const operationId = `task-${task.id}-${Date.now()}`;

  monitor.startOperation(operationId, 'task-execution', {
    taskType: task.type,
    complexity: task.complexity
  });

  try {
    const result = await profiler.profileFunction(
      `task.${task.type}`,
      () => processTask(task),
      { taskId: task.id }
    );

    monitor.endOperation(operationId, true, {
      steps: result.steps,
      outputSize: result.output?.length
    });

    return result;
  } catch (error) {
    monitor.endOperation(operationId, false, { error: error.message });
    throw error;
  }
}
```

### 2. Otimizações da Camada de Memória

#### Otimização de Consultas Vetoriais
```javascript
// ✅ Consultas vetoriais otimizadas
async function optimizedVectorQuery(query, options = {}) {
  const optimizer = getGlobalMemoryOptimizer();

  return await optimizer.optimizeQuery(
    'vector-similarity',
    query,
    {
      topK: Math.min(options.topK || 10, 100), // Limita resultados
      threshold: options.threshold || 0.7,     // Filtra baixa similaridade
      ...options
    },
    async (query, params) => {
      // Pré-filtra se possível
      if (params.filters) {
        params.filters = optimizeFilters(params.filters);
      }

      // Executa consulta otimizada
      return await vectorIndex.query(query, params);
    }
  );
}
```

#### Gerenciamento de Índices
```javascript
// ✅ Construção inteligente de índices
class OptimizedMemoryIndex {
  constructor() {
    this.batchSize = 100;
    this.rebuildThreshold = 10000;
    this.operationCount = 0;
  }

  async addDocument(doc) {
    // Adiciona documentos em lote
    this.pendingDocs = this.pendingDocs || [];
    this.pendingDocs.push(doc);

    if (this.pendingDocs.length >= this.batchSize) {
      await this.flushBatch();
    }

    this.operationCount++;

    // Reconstrói índice se necessário
    if (this.operationCount >= this.rebuildThreshold) {
      await this.scheduleRebuild();
    }
  }

  async flushBatch() {
    if (this.pendingDocs?.length > 0) {
      await this.index.addDocuments(this.pendingDocs);
      this.pendingDocs = [];
    }
  }

  async scheduleRebuild() {
    // Reconstrói em segundo plano
    setImmediate(async () => {
      await this.rebuildIndex();
      this.operationCount = 0;
    });
  }
}
```

### 3. Operações de Sistema de Arquivos

#### Operações em Massa de Arquivos
```javascript
// ✅ Operações de arquivo otimizadas
const fs = require('fs-extra');
const path = require('path');

async function optimizedFileCopy(sourceDir, targetDir, options = {}) {
  const cache = getGlobalCacheManager();
  const profiler = new PerformanceProfiler();

  return await profiler.profileFunction(
    'file.bulk-copy',
    async () => {
      // Obtém lista de arquivos com cache
      const files = await cache.cacheFileOperation(
        'directory-scan',
        sourceDir,
        () => getAllFiles(sourceDir)
      );

      // Processa em lotes
      const batchSize = options.batchSize || 50;
      const batches = chunkArray(files, batchSize);

      for (const batch of batches) {
        await Promise.all(
          batch.map(async (file) => {
            const sourcePath = path.join(sourceDir, file);
            const targetPath = path.join(targetDir, file);

            // Pula se o destino for mais recente
            const shouldCopy = await cache.cacheFileOperation(
              'should-copy',
              `${sourcePath}:${targetPath}`,
              () => shouldCopyFile(sourcePath, targetPath)
            );

            if (shouldCopy) {
              await fs.copy(sourcePath, targetPath);
            }
          })
        );
      }
    },
    { sourceDir, targetDir, fileCount: files.length }
  );
}
```

### 4. Processo de Instalação

#### Instalação de Dependências
```javascript
// ✅ Instalação de dependências otimizada
async function optimizedDependencyInstall(packages) {
  const cache = getGlobalCacheManager();

  // Verifica quais pacotes já estão instalados
  const installedPackages = await cache.cacheFunction(
    'check-installed-packages',
    [packages],
    () => checkInstalledPackages(packages),
    'dependencies'
  );

  const packagesToInstall = packages.filter(pkg =>
    !installedPackages.includes(pkg)
  );

  if (packagesToInstall.length === 0) {
    return { skipped: packages.length, installed: 0 };
  }

  // Instala em lotes paralelos
  const batchSize = 5; // Evita sobrecarregar o npm
  const batches = chunkArray(packagesToInstall, batchSize);

  for (const batch of batches) {
    await Promise.all(
      batch.map(pkg =>
        cache.cacheDependencyInstall(pkg, () => installPackage(pkg))
      )
    );
  }

  return { skipped: packages.length - packagesToInstall.length,
           installed: packagesToInstall.length };
}
```

## Estratégias de Cache

### 1. Cache da Camada de Memória
```javascript
// Armazena resultados de consulta por tipo
const cacheStrategies = {
  'vector-queries': {
    ttl: 30 * 60 * 1000,  // 30 minutos
    maxSize: 100,         // 100 entradas
    priority: 'high'
  },
  'semantic-search': {
    ttl: 15 * 60 * 1000,  // 15 minutos
    maxSize: 200,
    priority: 'medium'
  },
  'document-retrieval': {
    ttl: 60 * 60 * 1000,  // 1 hora
    maxSize: 50,
    priority: 'high'
  }
};
```

### 2. Cache de Templates
```javascript
// Armazena templates renderizados em cache
async function getCachedTemplate(templateName, context) {
  const cache = getGlobalCacheManager();
  const contextHash = hashObject(context);

  return await cache.get(
    `template:${templateName}:${contextHash}`,
    'component-templates'
  );
}
```

### 3. Cache de Operações de Arquivo
```javascript
// Armazena metadados e resultados de arquivos em cache
async function getCachedFileStats(filePath) {
  const cache = getGlobalCacheManager();
  const stats = await fs.stat(filePath);

  return await cache.cacheFileOperation(
    'file-stats',
    filePath,
    () => analyzeFile(filePath)
  );
}
```

## Monitoramento e Alertas

### 1. Métricas de Performance
```javascript
// Configura monitoramento com limites personalizados
const monitor = new PerformanceMonitor({
  enabled: true,
  monitoringInterval: 5000, // 5 segundos
  thresholds: {
    cpuUsage: 70,           // 70% CPU
    memoryUsage: 80,        // 80% memória
    responseTime: 500,      // 500ms resposta
    errorRate: 2            // 2% taxa de erro
  }
});

// Escuta alertas
monitor.on('alert', (alert) => {
  console.warn(`Alerta de Performance: ${alert.message}`);
  // Envia para sistema de monitoramento
  sendToMonitoring(alert);
});
```

### 2. Métricas Personalizadas
```javascript
// Registra métricas de performance personalizadas
monitor.recordMetric('component.generation.time', duration);
monitor.recordMetric('memory.query.latency', queryTime);
monitor.recordMetric('cache.hit.rate', hitRate);
```

### 3. Relatórios de Performance
```javascript
// Gera e salva relatórios de performance
async function generatePerformanceReport() {
  const report = monitor.getReport(24 * 60 * 60 * 1000); // Últimas 24 horas
  await monitor.saveReport(report, 'daily-performance-report.json');

  // Verifica regressões de performance
  const recommendations = report.recommendations;
  if (recommendations.length > 0) {
    console.log('Recomendações de Performance:');
    recommendations.forEach(rec => {
      console.log(`- [${rec.priority}] ${rec.recommendation}`);
    });
  }
}
```

## Depurando Problemas de Performance

### 1. Perfilando Operações
```javascript
// Perfila operações lentas
const profiler = new PerformanceProfiler({ verbose: true });

const results = await profiler.profileFunction(
  'slow-operation',
  async () => {
    // Sua operação lenta aqui
    return await slowOperation();
  }
);

console.log(`Operação levou ${results.duration}ms`);
console.log(`Delta de memória: ${results.memoryDelta.heapUsed} bytes`);
```

### 2. Análise de Memória
```javascript
// Analisa padrões de uso de memória
const memStats = process.memoryUsage();
console.log('Uso de Memória:');
console.log(`RSS: ${(memStats.rss / 1024 / 1024).toFixed(2)} MB`);
console.log(`Heap Usado: ${(memStats.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`Heap Total: ${(memStats.heapTotal / 1024 / 1024).toFixed(2)} MB`);
```

### 3. Perfilamento de CPU
```javascript
// Perfila operações intensivas de CPU
const { performance } = require('perf_hooks');

const start = performance.now();
// Operação intensiva de CPU
const result = await cpuIntensiveOperation();
const end = performance.now();

console.log(`Tempo de CPU: ${end - start}ms`);
```

## Ajuste de Configuração

### 1. Limites de Memória
```javascript
// Otimiza limites de memória baseado no sistema
const totalMemory = os.totalmem();
const recommendedLimits = {
  cacheSize: Math.min(totalMemory * 0.1, 100 * 1024 * 1024), // 10% ou 100MB
  maxOperations: Math.floor(totalMemory / (50 * 1024 * 1024)), // 50MB por operação
  indexSize: Math.min(totalMemory * 0.05, 50 * 1024 * 1024)   // 5% ou 50MB
};
```

### 2. Limites de Concorrência
```javascript
// Define concorrência ideal baseada em núcleos de CPU
const cpuCount = os.cpus().length;
const optimalConcurrency = {
  fileOperations: Math.max(2, cpuCount / 2),
  networkRequests: Math.max(4, cpuCount),
  backgroundTasks: Math.max(1, cpuCount / 4)
};
```

### 3. Configuração de Cache
```javascript
// Configura cache baseado em padrões de uso
const cacheConfig = {
  memory: {
    maxSize: process.env.NODE_ENV === 'production'
      ? 100 * 1024 * 1024   // 100MB em produção
      : 50 * 1024 * 1024,   // 50MB em desenvolvimento
    ttl: 30 * 60 * 1000     // 30 minutos
  },
  disk: {
    maxSize: 500 * 1024 * 1024, // 500MB
    ttl: 24 * 60 * 60 * 1000    // 24 horas
  }
};
```

## Checklist de Performance

### Pré-deploy
- [ ] Executar análise de caminho crítico
- [ ] Executar benchmarks de performance
- [ ] Verificar uso de memória sob carga
- [ ] Verificar taxas de acerto de cache > 70%
- [ ] Testar com volume de dados de produção
- [ ] Validar taxas de erro < 1%

### Pós-deploy
- [ ] Monitorar tempos de resposta
- [ ] Acompanhar crescimento de memória
- [ ] Observar efetividade do cache
- [ ] Verificar taxas de erro
- [ ] Revisar alertas de performance
- [ ] Gerar relatórios semanais

### Prioridades de Otimização
1. **Alto Impacto, Baixo Esforço**
   - Habilitar cache para operações frequentes
   - Otimizar consultas de banco de dados
   - Implementar pool de conexões

2. **Alto Impacto, Alto Esforço**
   - Implementar estratégias avançadas de cache
   - Otimizar algoritmos críticos
   - Adicionar monitoramento de performance

3. **Baixo Impacto, Baixo Esforço**
   - Corrigir vazamentos de memória menores
   - Otimizar logging
   - Limpar recursos não utilizados

## Anti-padrões Comuns de Performance

### Evite Estes Padrões

```javascript
// NÃO FAÇA: Operações síncronas em loops
for (const file of files) {
  await processFile(file); // Processa um de cada vez
}

// NÃO FAÇA: Sem cache para operações custosas
async function getExpensiveData() {
  return await expensiveCalculation(); // Sempre recalcula
}

// NÃO FAÇA: Vazamentos de memória com event listeners
setInterval(() => {
  // Operação pesada sem limpeza
}, 1000);
```

### Use Estes Padrões

```javascript
// FAÇA: Processamento paralelo com limites
const results = await Promise.all(
  files.map(file => processFile(file))
);

// FAÇA: Cache para operações custosas
const cache = getGlobalCacheManager();
async function getExpensiveData() {
  return await cache.cacheFunction(
    'expensive-calculation',
    [],
    expensiveCalculation,
    'computation',
    { ttl: 60 * 60 * 1000 }
  );
}

// FAÇA: Limpeza adequada
const intervalId = setInterval(() => {
  // Operação com limpeza
}, 1000);

process.on('exit', () => {
  clearInterval(intervalId);
});
```

## Testes de Performance

### 1. Teste de Carga
```javascript
// Teste de carga simples
async function loadTest(operation, concurrency = 10, duration = 60000) {
  const startTime = Date.now();
  const results = [];

  while (Date.now() - startTime < duration) {
    const batch = Array(concurrency).fill().map(() =>
      measureOperation(operation)
    );

    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }

  return analyzeResults(results);
}
```

### 2. Comparações de Benchmark
```javascript
// Compara impacto de otimização
async function benchmarkOptimization(originalFn, optimizedFn, iterations = 100) {
  const originalResults = [];
  const optimizedResults = [];

  for (let i = 0; i < iterations; i++) {
    originalResults.push(await measureOperation(originalFn));
    optimizedResults.push(await measureOperation(optimizedFn));
  }

  return {
    original: analyzeResults(originalResults),
    optimized: analyzeResults(optimizedResults),
    improvement: calculateImprovement(originalResults, optimizedResults)
  };
}
```

## Ferramentas e Scripts

### Script de Análise de Performance
```bash
#!/bin/bash
# performance-check.sh

echo "Executando Análise de Performance..."

# Executa análise de caminho crítico
node performance/run-critical-path-analysis.js

# Gera relatório de performance
node -e "
const { getGlobalPerformanceMonitor } = require('./performance/performance-monitor');
const monitor = getGlobalPerformanceMonitor();
monitor.saveReport().then(path => console.log('Relatório salvo em:', path));
"

# Verifica uso de memória
node -e "
console.log('Uso de Memória:', process.memoryUsage());
console.log('Memória do Sistema:', require('os').totalmem(), 'bytes');
"

echo "Análise de performance concluída!"
```

### Script de Análise de Cache
```javascript
// analyze-cache.js
const { getGlobalCacheManager } = require('./performance/cache-manager');

async function analyzeCachePerformance() {
  const cache = getGlobalCacheManager();
  const stats = cache.getStats();

  console.log('Performance do Cache:');
  console.log(`Taxa de Acerto: ${stats.hitRate.toFixed(2)}%`);
  console.log(`Uso de Memória: ${stats.memoryUsageMB} MB`);
  console.log(`Uso de Disco: ${stats.diskUsageMB} MB`);

  if (stats.hitRate < 50) {
    console.warn('Aviso: Baixa taxa de acerto do cache detectada!');
  }

  if (parseFloat(stats.memoryUsageMB) > 100) {
    console.warn('Aviso: Alto uso de cache em memória!');
  }
}

analyzeCachePerformance();
```

## Recursos Adicionais

- [Melhores Práticas de Performance do Node.js](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Gerenciamento de Memória no Node.js](https://nodejs.org/en/docs/guides/diagnostics/memory/)
- [Ferramentas de Monitoramento de Performance](https://nodejs.org/en/docs/guides/diagnostics/)
- [Dicas de Performance V8](https://v8.dev/docs/memory)

---

**Lembre-se**: Otimização de performance é um processo iterativo. Sempre meça antes e depois das mudanças, e foque nas operações que têm maior impacto na experiência do usuário.
