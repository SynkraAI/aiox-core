<!--
  Traducción: ES
  Original: /docs/en/performance-tuning-guide.md
  Última sincronización: 2026-01-26
-->

# Guía de Optimización de Rendimiento de Synkra AIOX

> 🌐 [EN](../performance-tuning-guide.md) | [PT](../pt/performance-tuning-guide.md) | **ES**

---

## Descripción General

Esta guía completa proporciona estrategias, herramientas y mejores prácticas para optimizar el rendimiento de Synkra AIOX en todos los componentes críticos.

## Objetivos de Rendimiento

### Objetivos de Producción
- **Tiempo de respuesta del meta-agent**: < 500ms (p95)
- **Consultas de capa de memoria**: < 200ms (p95)
- **Generación de componentes**: < 2 segundos
- **Asistente de instalación**: < 2 minutos en total
- **Uso de memoria**: < 512MB bajo carga normal
- **Uso de CPU**: < 60% carga sostenida

### Objetivos de Desarrollo
- **Inicio de desarrollo local**: < 30 segundos
- **Hot reload**: < 3 segundos
- **Ejecución de suite de pruebas**: < 2 minutos

## Kit de Herramientas de Optimización de Rendimiento

### 1. Perfilador de Rendimiento
```javascript
const { PerformanceProfiler } = require('./performance/profiler');

const profiler = new PerformanceProfiler({
  enabled: true,
  reportPath: '.aiox/reports/performance.json'
});

// Perfilar cualquier operación
const result = await profiler.profileFunction(
  'operation-name',
  async () => {
    // Tu operación costosa
    return await expensiveOperation();
  },
  { category: 'meta-agent' }
);
```

### 2. Gestor de Caché
```javascript
const { getGlobalCacheManager } = require('./performance/cache-manager');

const cache = getGlobalCacheManager();

// Cachear resultados de funciones
const result = await cache.cacheFunction(
  'expensive-operation',
  [arg1, arg2],
  expensiveFunction,
  'memory-queries',
  { ttl: 30 * 60 * 1000 } // 30 minutos
);
```

### 3. Optimizador de Consultas de Memoria
```javascript
const { getGlobalMemoryOptimizer } = require('./performance/memory-query-optimizer');

const optimizer = getGlobalMemoryOptimizer();

// Optimizar consultas vectoriales
const results = await optimizer.optimizeQuery(
  'vector-similarity',
  vectorQuery,
  { topK: 10, threshold: 0.7 },
  originalQueryFunction
);
```

### 4. Monitor de Rendimiento
```javascript
const { getGlobalPerformanceMonitor } = require('./performance/performance-monitor');

const monitor = getGlobalPerformanceMonitor();

// Monitorear operación
const operationId = 'op-' + Date.now();
monitor.startOperation(operationId, 'meta-agent-task');
// ... ejecutar operación
monitor.endOperation(operationId, true, { result: 'success' });
```

## Optimizaciones de Ruta Crítica

### 1. Operaciones del Meta-Agent

#### Creación de Componentes
```javascript
// ❌ Sin optimizar
async function createComponent(template, context) {
  const rendered = await renderTemplate(template, context);
  const validated = await validateComponent(rendered);
  const written = await writeFiles(validated);
  return written;
}

// ✅ Optimizado
async function createComponent(template, context) {
  const cache = getGlobalCacheManager();

  // Cachear renderizado de plantilla
  const rendered = await cache.cacheComponentTemplate(
    template.name,
    context,
    () => renderTemplate(template, context)
  );

  // Validación paralela y escritura de archivos
  const [validated, _] = await Promise.all([
    validateComponent(rendered),
    cache.cacheFileOperation('template-stats', template.path,
      () => analyzeTemplate(template))
  ]);

  return await writeFiles(validated);
}
```

#### Ejecución de Tareas
```javascript
// ✅ Ejecución de tareas optimizada con monitoreo
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

### 2. Optimizaciones de Capa de Memoria

#### Optimización de Consultas Vectoriales
```javascript
// ✅ Consultas vectoriales optimizadas
async function optimizedVectorQuery(query, options = {}) {
  const optimizer = getGlobalMemoryOptimizer();

  return await optimizer.optimizeQuery(
    'vector-similarity',
    query,
    {
      topK: Math.min(options.topK || 10, 100), // Limitar resultados
      threshold: options.threshold || 0.7,     // Filtrar baja similitud
      ...options
    },
    async (query, params) => {
      // Pre-filtrar si es posible
      if (params.filters) {
        params.filters = optimizeFilters(params.filters);
      }

      // Ejecutar consulta optimizada
      return await vectorIndex.query(query, params);
    }
  );
}
```

#### Gestión de Índices
```javascript
// ✅ Construcción inteligente de índices
class OptimizedMemoryIndex {
  constructor() {
    this.batchSize = 100;
    this.rebuildThreshold = 10000;
    this.operationCount = 0;
  }

  async addDocument(doc) {
    // Agrupar adiciones de documentos en lotes
    this.pendingDocs = this.pendingDocs || [];
    this.pendingDocs.push(doc);

    if (this.pendingDocs.length >= this.batchSize) {
      await this.flushBatch();
    }

    this.operationCount++;

    // Reconstruir índice si es necesario
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
    // Reconstruir en segundo plano
    setImmediate(async () => {
      await this.rebuildIndex();
      this.operationCount = 0;
    });
  }
}
```

### 3. Operaciones del Sistema de Archivos

#### Operaciones de Archivos en Lote
```javascript
// ✅ Operaciones de archivos optimizadas
const fs = require('fs-extra');
const path = require('path');

async function optimizedFileCopy(sourceDir, targetDir, options = {}) {
  const cache = getGlobalCacheManager();
  const profiler = new PerformanceProfiler();

  return await profiler.profileFunction(
    'file.bulk-copy',
    async () => {
      // Obtener lista de archivos con caché
      const files = await cache.cacheFileOperation(
        'directory-scan',
        sourceDir,
        () => getAllFiles(sourceDir)
      );

      // Procesar en lotes
      const batchSize = options.batchSize || 50;
      const batches = chunkArray(files, batchSize);

      for (const batch of batches) {
        await Promise.all(
          batch.map(async (file) => {
            const sourcePath = path.join(sourceDir, file);
            const targetPath = path.join(targetDir, file);

            // Omitir si el destino es más reciente
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

### 4. Proceso de Instalación

#### Instalación de Dependencias
```javascript
// ✅ Instalación de dependencias optimizada
async function optimizedDependencyInstall(packages) {
  const cache = getGlobalCacheManager();

  // Verificar qué paquetes ya están instalados
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

  // Instalar en lotes paralelos
  const batchSize = 5; // Evitar sobrecargar npm
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

## Estrategias de Caché

### 1. Caché de Capa de Memoria
```javascript
// Cachear resultados de consulta por tipo
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

### 2. Caché de Plantillas
```javascript
// Cachear plantillas renderizadas
async function getCachedTemplate(templateName, context) {
  const cache = getGlobalCacheManager();
  const contextHash = hashObject(context);

  return await cache.get(
    `template:${templateName}:${contextHash}`,
    'component-templates'
  );
}
```

### 3. Caché de Operaciones de Archivos
```javascript
// Cachear metadatos y resultados de archivos
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

## Monitoreo y Alertas

### 1. Métricas de Rendimiento
```javascript
// Configurar monitoreo con umbrales personalizados
const monitor = new PerformanceMonitor({
  enabled: true,
  monitoringInterval: 5000, // 5 segundos
  thresholds: {
    cpuUsage: 70,           // 70% CPU
    memoryUsage: 80,        // 80% memoria
    responseTime: 500,      // 500ms respuesta
    errorRate: 2            // 2% tasa de error
  }
});

// Escuchar alertas
monitor.on('alert', (alert) => {
  console.warn(`Alerta de Rendimiento: ${alert.message}`);
  // Enviar al sistema de monitoreo
  sendToMonitoring(alert);
});
```

### 2. Métricas Personalizadas
```javascript
// Registrar métricas de rendimiento personalizadas
monitor.recordMetric('component.generation.time', duration);
monitor.recordMetric('memory.query.latency', queryTime);
monitor.recordMetric('cache.hit.rate', hitRate);
```

### 3. Informes de Rendimiento
```javascript
// Generar y guardar informes de rendimiento
async function generatePerformanceReport() {
  const report = monitor.getReport(24 * 60 * 60 * 1000); // Últimas 24 horas
  await monitor.saveReport(report, 'daily-performance-report.json');

  // Verificar regresiones de rendimiento
  const recommendations = report.recommendations;
  if (recommendations.length > 0) {
    console.log('Recomendaciones de Rendimiento:');
    recommendations.forEach(rec => {
      console.log(`- [${rec.priority}] ${rec.recommendation}`);
    });
  }
}
```

## Depuración de Problemas de Rendimiento

### 1. Perfilado de Operaciones
```javascript
// Perfilar operaciones lentas
const profiler = new PerformanceProfiler({ verbose: true });

const results = await profiler.profileFunction(
  'slow-operation',
  async () => {
    // Tu operación lenta aquí
    return await slowOperation();
  }
);

console.log(`La operación tomó ${results.duration}ms`);
console.log(`Delta de memoria: ${results.memoryDelta.heapUsed} bytes`);
```

### 2. Análisis de Memoria
```javascript
// Analizar patrones de uso de memoria
const memStats = process.memoryUsage();
console.log('Uso de Memoria:');
console.log(`RSS: ${(memStats.rss / 1024 / 1024).toFixed(2)} MB`);
console.log(`Heap Usado: ${(memStats.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`Heap Total: ${(memStats.heapTotal / 1024 / 1024).toFixed(2)} MB`);
```

### 3. Perfilado de CPU
```javascript
// Perfilar operaciones intensivas de CPU
const { performance } = require('perf_hooks');

const start = performance.now();
// Operación intensiva de CPU
const result = await cpuIntensiveOperation();
const end = performance.now();

console.log(`Tiempo de CPU: ${end - start}ms`);
```

## Ajuste de Configuración

### 1. Límites de Memoria
```javascript
// Optimizar límites de memoria basados en el sistema
const totalMemory = os.totalmem();
const recommendedLimits = {
  cacheSize: Math.min(totalMemory * 0.1, 100 * 1024 * 1024), // 10% o 100MB
  maxOperations: Math.floor(totalMemory / (50 * 1024 * 1024)), // 50MB por op
  indexSize: Math.min(totalMemory * 0.05, 50 * 1024 * 1024)   // 5% o 50MB
};
```

### 2. Límites de Concurrencia
```javascript
// Establecer concurrencia óptima basada en núcleos de CPU
const cpuCount = os.cpus().length;
const optimalConcurrency = {
  fileOperations: Math.max(2, cpuCount / 2),
  networkRequests: Math.max(4, cpuCount),
  backgroundTasks: Math.max(1, cpuCount / 4)
};
```

### 3. Configuración de Caché
```javascript
// Configurar caché basado en patrones de uso
const cacheConfig = {
  memory: {
    maxSize: process.env.NODE_ENV === 'production'
      ? 100 * 1024 * 1024   // 100MB en producción
      : 50 * 1024 * 1024,   // 50MB en desarrollo
    ttl: 30 * 60 * 1000     // 30 minutos
  },
  disk: {
    maxSize: 500 * 1024 * 1024, // 500MB
    ttl: 24 * 60 * 60 * 1000    // 24 horas
  }
};
```

## Lista de Verificación de Rendimiento

### Pre-despliegue
- [ ] Ejecutar análisis de ruta crítica
- [ ] Ejecutar benchmarks de rendimiento
- [ ] Verificar uso de memoria bajo carga
- [ ] Verificar tasas de acierto de caché > 70%
- [ ] Probar con volumen de datos de producción
- [ ] Validar tasas de error < 1%

### Post-despliegue
- [ ] Monitorear tiempos de respuesta
- [ ] Rastrear crecimiento de memoria
- [ ] Observar efectividad del caché
- [ ] Verificar tasas de error
- [ ] Revisar alertas de rendimiento
- [ ] Generar informes semanales

### Prioridades de Optimización
1. **Alto Impacto, Bajo Esfuerzo**
   - Habilitar caché para operaciones frecuentes
   - Optimizar consultas de base de datos
   - Implementar pooling de conexiones

2. **Alto Impacto, Alto Esfuerzo**
   - Implementar estrategias avanzadas de caché
   - Optimizar algoritmos críticos
   - Agregar monitoreo de rendimiento

3. **Bajo Impacto, Bajo Esfuerzo**
   - Corregir fugas de memoria menores
   - Optimizar registro
   - Limpiar recursos no utilizados

## Antipatrones Comunes de Rendimiento

### ❌ Evitar Estos Patrones

```javascript
// NO HACER: Operaciones síncronas en bucles
for (const file of files) {
  await processFile(file); // Procesa uno a la vez
}

// NO HACER: Sin caché para operaciones costosas
async function getExpensiveData() {
  return await expensiveCalculation(); // Siempre recalcula
}

// NO HACER: Fugas de memoria con event listeners
setInterval(() => {
  // Operación pesada sin limpieza
}, 1000);
```

### ✅ Usar Estos Patrones en Su Lugar

```javascript
// HACER: Procesamiento paralelo con límites
const results = await Promise.all(
  files.map(file => processFile(file))
);

// HACER: Cachear operaciones costosas
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

// HACER: Limpieza adecuada
const intervalId = setInterval(() => {
  // Operación con limpieza
}, 1000);

process.on('exit', () => {
  clearInterval(intervalId);
});
```

## Pruebas de Rendimiento

### 1. Pruebas de Carga
```javascript
// Prueba de carga simple
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

### 2. Comparaciones de Benchmark
```javascript
// Comparar impacto de optimización
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

## Herramientas y Scripts

### Script de Análisis de Rendimiento
```bash
#!/bin/bash
# performance-check.sh

echo "Ejecutando Análisis de Rendimiento..."

# Ejecutar análisis de ruta crítica
node performance/run-critical-path-analysis.js

# Generar informe de rendimiento
node -e "
const { getGlobalPerformanceMonitor } = require('./performance/performance-monitor');
const monitor = getGlobalPerformanceMonitor();
monitor.saveReport().then(path => console.log('Informe guardado en:', path));
"

# Verificar uso de memoria
node -e "
console.log('Uso de Memoria:', process.memoryUsage());
console.log('Memoria del Sistema:', require('os').totalmem(), 'bytes');
"

echo "Análisis de rendimiento completado!"
```

### Script de Análisis de Caché
```javascript
// analyze-cache.js
const { getGlobalCacheManager } = require('./performance/cache-manager');

async function analyzeCachePerformance() {
  const cache = getGlobalCacheManager();
  const stats = cache.getStats();

  console.log('Rendimiento del Caché:');
  console.log(`Tasa de Acierto: ${stats.hitRate.toFixed(2)}%`);
  console.log(`Uso de Memoria: ${stats.memoryUsageMB} MB`);
  console.log(`Uso de Disco: ${stats.diskUsageMB} MB`);

  if (stats.hitRate < 50) {
    console.warn('Baja tasa de acierto de caché detectada!');
  }

  if (parseFloat(stats.memoryUsageMB) > 100) {
    console.warn('Alto uso de caché de memoria!');
  }
}

analyzeCachePerformance();
```

## Recursos Adicionales

- [Mejores Prácticas de Rendimiento de Node.js](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Gestión de Memoria en Node.js](https://nodejs.org/en/docs/guides/diagnostics/memory/)
- [Herramientas de Monitoreo de Rendimiento](https://nodejs.org/en/docs/guides/diagnostics/)
- [Consejos de Rendimiento de V8](https://v8.dev/docs/memory)

---

**Recuerde**: La optimización de rendimiento es un proceso iterativo. Siempre mida antes y después de los cambios, y enfóquese en las operaciones que tienen el mayor impacto en la experiencia del usuario.
