<!--
  Traduccion: ES
  Original: /docs/en/troubleshooting.md
  Ultima sincronizacion: 2026-01-26
-->

# Guia de Solucion de Problemas de Synkra AIOS

> 🌐 [EN](../troubleshooting.md) | [PT](../pt/troubleshooting.md) | **ES**

---

Esta guia completa te ayuda a diagnosticar y resolver problemas comunes con Synkra AIOS.

## Tabla de Contenidos

1. [Diagnosticos Rapidos](#diagnosticos-rapidos)
2. [Problemas de Instalacion](#problemas-de-instalacion)
3. [Problemas del Meta-Agente](#problemas-del-meta-agente)
4. [Problemas de la Capa de Memoria](#problemas-de-la-capa-de-memoria)
5. [Problemas de Rendimiento](#problemas-de-rendimiento)
6. [Problemas de API e Integracion](#problemas-de-api-e-integracion)
7. [Errores de Seguridad y Permisos](#errores-de-seguridad-y-permisos)
8. [Problemas Especificos de Plataforma](#problemas-especificos-de-plataforma)
9. [Solucion de Problemas Avanzada](#solucion-de-problemas-avanzada)
10. [Obtener Ayuda](#obtener-ayuda)

## Diagnosticos Rapidos

### Ejecutar el Doctor del Sistema

Siempre comienza con los diagnosticos integrados:

```bash
# Diagnostico basico
npx aios-core doctor

# Auto-corregir problemas comunes
npx aios-core doctor --fix

# Salida detallada
npx aios-core doctor --verbose

# Verificar componente especifico
npx aios-core doctor --component memory-layer
```

### Correcciones Rapidas Comunes

```bash
# Limpiar todos los caches
*memory clear-cache

# Reconstruir indice de memoria
*memory rebuild

# Restablecer configuracion
*config --reset

# Actualizar a la ultima version
npx aios-core update
```

## Problemas de Instalacion

### Problema: Comando NPX no encontrado

**Sintomas:**
```
bash: npx: command not found
```

**Solucion:**
```bash
# Verificar version de npm
npm --version

# Si npm < 5.2, instalar npx globalmente
npm install -g npx

# O usar npm directamente
npm exec aios-core init my-project
```

### Problema: Instalacion falla con errores de permisos

**Sintomas:**
```
Error: EACCES: permission denied
```

**Soluciones:**

**Opcion 1: Corregir permisos de npm (Recomendado)**
```bash
# Crear directorio npm
mkdir ~/.npm-global

# Configurar npm
npm config set prefix '~/.npm-global'

# Agregar al PATH (agregar a ~/.bashrc o ~/.zshrc)
export PATH=~/.npm-global/bin:$PATH

# Recargar shell
source ~/.bashrc
```

**Opcion 2: Usar directorio diferente**
```bash
# Instalar en directorio de usuario
cd ~
npx aios-core init my-project
```

### Problema: Error de version de Node.js

**Sintomas:**
```
Error: Node.js version 18.0.0 or higher required
```

**Solucion:**
```bash
# Verificar version actual
node --version

# Actualizar Node.js
# macOS (usando Homebrew)
brew upgrade node

# Windows (usando Chocolatey)
choco upgrade nodejs

# Linux (usando NodeSource)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# O usar nvm (Node Version Manager)
nvm install 18
nvm use 18
```

### Problema: Instalacion se cuelga o agota tiempo de espera

**Sintomas:**
- Instalacion atascada en "Installing dependencies..."
- Errores de tiempo de espera de red

**Soluciones:**

```bash
# Usar registro diferente
npm config set registry https://registry.npmjs.org/

# Limpiar cache de npm
npm cache clean --force

# Aumentar tiempo de espera
npm config set fetch-timeout 60000

# Omitir instalacion de dependencias
npx aios-core init my-project --skip-install

# Luego instalar manualmente
cd my-project
npm install --verbose
```

### Problema: Error de espacio en disco

**Sintomas:**
```
Error: ENOSPC: no space left on device
```

**Solucion:**
```bash
# Verificar espacio disponible
df -h

# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules antiguos
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Limpiar archivos temporales
# macOS/Linux
rm -rf /tmp/npm-*

# Windows
rmdir /s %TEMP%\npm-*
```

## Problemas del Meta-Agente

### Problema: El meta-agente no inicia

**Sintomas:**
```
Error: Failed to initialize meta-agent
```

**Soluciones:**

1. **Verificar configuracion:**
```bash
# Verificar que config existe
ls -la .aios/config.json

# Validar configuracion
npx aios-core doctor --component config

# Restablecer si esta corrupto
rm .aios/config.json
npx aios-core doctor --fix
```

2. **Verificar dependencias:**
```bash
# Reinstalar dependencias principales
npm install

# Verificar archivos de agentes
ls -la agents/
```

3. **Verificar entorno:**
```bash
# Verificar variables de entorno
cat .env

# Asegurar que API keys estan configuradas
echo "OPENAI_API_KEY=your-key" >> .env
```

### Problema: Comandos no reconocidos

**Sintomas:**
```
Unknown command: *create-agent
```

**Soluciones:**

1. **Verificar activacion del agente:**
```bash
# Listar agentes activos
*list-agents --active

# Activar meta-agente
*activate meta-agent

# Verificar disponibilidad de comandos
*help
```

2. **Verificar sintaxis de comandos:**
```bash
# Sintaxis correcta usa asterisco
*create-agent my-agent  # Correcto
create-agent my-agent   # Incorrecto
```

3. **Recargar agentes:**
```bash
# Recargar todos los agentes
*reload-agents

# O reiniciar meta-agente
exit
npx aios-core
```

### Problema: Creacion de agente falla

**Sintomas:**
```
Error: Failed to create agent
```

**Soluciones:**

1. **Verificar permisos:**
```bash
# Verificar permisos de escritura
ls -la agents/

# Corregir permisos
chmod 755 agents/
```

2. **Validar nombre del agente:**
```bash
# Nombres validos: minusculas, guiones
*create-agent my-agent      # Bueno
*create-agent MyAgent       # Malo (mayusculas)
*create-agent my_agent      # Malo (guion bajo)
*create-agent my-agent-2    # Bueno
```

3. **Verificar duplicados:**
```bash
# Listar agentes existentes
*list-agents

# Eliminar duplicado si existe
rm agents/duplicate-agent.yaml
```

## Problemas de la Capa de Memoria

### Problema: Busqueda de memoria no retorna resultados

**Sintomas:**
- Busqueda semantica no encuentra nada
- Reconocimiento de patrones falla

**Soluciones:**

1. **Reconstruir indice de memoria:**
```bash
# Limpiar y reconstruir
*memory clear-cache
*memory rebuild --verbose

# Esperar indexacion
# Verificar progreso
*memory status
```

2. **Verificar configuracion de memoria:**
```bash
# Verificar config
cat .aios/memory-config.json

# Restablecer a valores por defecto
*memory reset-config
```

3. **Verificar integridad del indice:**
```bash
# Ejecutar diagnosticos de memoria
*memory diagnose

# Reparar si es necesario
*memory repair
```

### Problema: Capa de memoria usando demasiada RAM

**Sintomas:**
- Alto uso de memoria
- Ralentizacion del sistema

**Soluciones:**

1. **Ajustar configuracion de memoria:**
```javascript
// Editar .aios/memory-config.json
{
  "maxDocuments": 5000,      // Reducir de 10000
  "chunkSize": 256,          // Reducir de 512
  "cacheSize": 100,          // Reducir de 1000
  "enableCompression": true  // Habilitar compresion
}
```

2. **Limpiar datos antiguos:**
```bash
# Eliminar entradas antiguas
*memory prune --older-than "30 days"

# Optimizar almacenamiento
*memory optimize
```

3. **Usar limites de memoria:**
```bash
# Establecer limite de memoria
export NODE_OPTIONS="--max-old-space-size=1024"

# Ejecutar con memoria limitada
npx aios-core
```

### Problema: Errores de LlamaIndex

**Sintomas:**
```
Error: LlamaIndex initialization failed
```

**Soluciones:**

1. **Verificar API keys:**
```bash
# Verificar clave de OpenAI para embeddings
echo $OPENAI_API_KEY

# Probar acceso a API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

2. **Usar embeddings locales:**
```javascript
// .aios/memory-config.json
{
  "embedModel": "local",
  "localModelPath": "./models/embeddings"
}
```

3. **Reinstalar LlamaIndex:**
```bash
npm uninstall llamaindex
npm install llamaindex@latest
```

## Problemas de Rendimiento

### Problema: Ejecucion lenta de comandos

**Sintomas:**
- Comandos toman > 5 segundos
- UI se siente lenta

**Soluciones:**

1. **Perfilar rendimiento:**
```bash
# Habilitar perfilado
*debug enable --profile

# Ejecutar comando lento
*analyze-framework

# Ver perfil
*debug show-profile
```

2. **Optimizar configuracion:**
```javascript
// .aios/config.json
{
  "performance": {
    "enableCache": true,
    "parallelOperations": 4,
    "lazyLoading": true,
    "indexUpdateFrequency": "hourly"
  }
}
```

3. **Limpiar recursos:**
```bash
# Limpiar caches
*cache clear --all

# Eliminar agentes no usados
*cleanup-agents

# Optimizar base de datos
*optimize-db
```

### Problema: Alto uso de CPU

**Sintomas:**
- Ruido del ventilador
- Lag del sistema
- CPU alto en administrador de tareas

**Soluciones:**

1. **Limitar operaciones concurrentes:**
```bash
# Establecer limites de operacion
*config --set performance.maxConcurrent 2
*config --set performance.cpuThreshold 80
```

2. **Deshabilitar funciones en tiempo real:**
```bash
# Deshabilitar indexacion en tiempo real
*config --set memory.realTimeIndex false

# Usar procesamiento por lotes
*config --set performance.batchMode true
```

3. **Verificar procesos fuera de control:**
```bash
# Listar todos los procesos
*debug processes

# Matar proceso atascado
*debug kill-process <pid>
```

## Problemas de API e Integracion

### Problema: API key no funciona

**Sintomas:**
```
Error: Invalid API key
Error: 401 Unauthorized
```

**Soluciones:**

1. **Verificar formato de API key:**
```bash
# OpenAI
echo $OPENAI_API_KEY
# Deberia comenzar con "sk-"

# Anthropic
echo $ANTHROPIC_API_KEY
# Deberia comenzar con "sk-ant-"
```

2. **Probar API directamente:**
```bash
# Probar OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Probar Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

3. **Verificar limites de tasa:**
```bash
# Ver uso actual
*api-status

# Cambiar a proveedor diferente
*config --set ai.provider anthropic
```

### Problema: Errores de conexion de red

**Sintomas:**
```
Error: ECONNREFUSED
Error: getaddrinfo ENOTFOUND
```

**Soluciones:**

1. **Verificar configuracion de proxy:**
```bash
# Proxy corporativo
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# Probar conexion
curl -I https://api.openai.com
```

2. **Usar modo offline:**
```bash
# Habilitar modo offline
*config --set offline true

# Usar modelos locales
*config --set ai.provider local
```

3. **Configurar tiempos de espera:**
```bash
# Aumentar tiempos de espera
*config --set network.timeout 30000
*config --set network.retries 3
```

## Errores de Seguridad y Permisos

### Problema: Errores de permiso denegado

**Sintomas:**
```
Error: EACCES: permission denied
Error: Cannot write to file
```

**Soluciones:**

1. **Corregir permisos de archivos:**
```bash
# Corregir permisos del proyecto
chmod -R 755 .
chmod 600 .env

# Corregir directorios especificos
chmod 755 agents/ tasks/ workflows/
```

2. **Verificar propiedad de archivos:**
```bash
# Ver propiedad
ls -la

# Corregir propiedad (Linux/macOS)
sudo chown -R $(whoami) .
```

3. **Ejecutar con usuario correcto:**
```bash
# No usar sudo para npm
npm install  # Correcto
sudo npm install  # Incorrecto
```

### Problema: Datos sensibles expuestos

**Sintomas:**
- API keys visibles en logs
- Credenciales en mensajes de error

**Soluciones:**

1. **Asegurar variables de entorno:**
```bash
# Verificar .gitignore
cat .gitignore | grep .env

# Agregar si falta
echo ".env" >> .gitignore
echo ".aios/logs/" >> .gitignore
```

2. **Habilitar modo seguro:**
```bash
# Habilitar funciones de seguridad
*config --set security.maskSensitive true
*config --set security.secureLogging true
```

3. **Rotar claves comprometidas:**
```bash
# Generar nuevas claves desde proveedores
# Actualizar archivo .env
# Limpiar logs
rm -rf .aios/logs/*
```

## Problemas Especificos de Plataforma

### Problemas de Windows

#### Problema: Errores de ruta demasiado larga
```
Error: ENAMETOOLONG
```

**Solucion:**
```powershell
# Habilitar rutas largas (Ejecutar como Administrador)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
  -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# O usar rutas mas cortas
cd C:\
npx aios-core init myapp
```

#### Problema: Scripts deshabilitados
```
Error: Scripts is disabled on this system
```

**Solucion:**
```powershell
# Ejecutar como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problemas de macOS

#### Problema: Herramientas de Linea de Comandos faltantes
```
Error: xcrun: error: invalid active developer path
```

**Solucion:**
```bash
# Instalar Herramientas de Linea de Comandos de Xcode
xcode-select --install
```

#### Problema: Gatekeeper bloquea ejecucion
```
Error: "aios-core" cannot be opened
```

**Solucion:**
```bash
# Permitir ejecucion
sudo spctl --master-disable

# O eliminar cuarentena
xattr -d com.apple.quarantine /usr/local/bin/aios-core
```

### Problemas de Linux

#### Problema: Dependencias faltantes
```
Error: libssl.so.1.1: cannot open shared object file
```

**Solucion:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install libssl-dev

# RHEL/CentOS
sudo yum install openssl-devel

# Arch
sudo pacman -S openssl
```

## Solucion de Problemas Avanzada

### Habilitar Modo Debug

```bash
# Salida completa de debug
export DEBUG=aios:*
npx aios-core

# Componentes especificos
export DEBUG=aios:memory,aios:agent
```

### Analizar Logs

```bash
# Ver logs recientes
tail -f .aios/logs/aios.log

# Buscar errores
grep -i error .aios/logs/*.log

# Ver logs estructurados
*logs --format json --level error
```

### Crear Reporte de Diagnostico

```bash
# Generar diagnostico completo
npx aios-core doctor --report diagnostic.json

# Incluir info del sistema
npx aios-core info --detailed >> diagnostic.json

# Crear paquete de soporte
tar -czf aios-support.tar.gz .aios/logs diagnostic.json
```

### Perfilado de Rendimiento

```javascript
// Habilitar perfilado en config
{
  "debug": {
    "profiling": true,
    "profileOutput": ".aios/profiles/"
  }
}
```

```bash
# Analizar perfil
*debug analyze-profile .aios/profiles/latest.cpuprofile
```

### Analisis de Volcado de Memoria

```bash
# Crear snapshot de heap
*debug heap-snapshot

# Analizar uso de memoria
*debug memory-report

# Encontrar fugas de memoria
*debug find-leaks
```

## Obtener Ayuda

### Antes de Pedir Ayuda

1. **Ejecutar diagnosticos:**
   ```bash
   npx aios-core doctor --verbose > diagnostic.log
   ```

2. **Recopilar informacion:**
   - Version de Node.js: `node --version`
   - Version de NPM: `npm --version`
   - SO y version: `uname -a` o `ver`
   - Version de AIOS: `npx aios-core version`

3. **Verificar issues existentes:**
   - [GitHub Issues](https://github.com/aios-core/aios-core/issues)
   - [Discussions](https://github.com/aios-core/aios-core/discussions)

### Soporte de la Comunidad

- **Discord**: [Unete a nuestro servidor](https://discord.gg/gk8jAdXWmj)
  - `#help` - Ayuda general
  - `#bugs` - Reportes de bugs
  - `#meta-agent` - Especifico del meta-agente

- **GitHub Discussions**: Preguntas tecnicas y solicitudes de funcionalidades

- **Stack Overflow**: Etiqueta preguntas con `aios-core`

### Reportando Bugs

Crea reportes de bugs detallados:

```markdown
## Entorno
- SO: macOS 13.0
- Node: 18.17.0
- AIOS: 1.0.0

## Pasos para Reproducir
1. Ejecutar `npx aios-core init test`
2. Seleccionar plantilla "enterprise"
3. Error ocurre durante instalacion

## Comportamiento Esperado
La instalacion se completa exitosamente

## Comportamiento Actual
Error: Cannot find module 'inquirer'

## Logs
[Adjuntar diagnostic.log]

## Contexto Adicional
Usando proxy corporativo
```

### Recuperacion de Emergencia

Si todo lo demas falla:

```bash
# Respaldar estado actual
cp -r .aios .aios.backup

# Restablecimiento completo
rm -rf .aios node_modules package-lock.json
npm cache clean --force

# Instalacion fresca
npm install
npx aios-core doctor --fix

# Restaurar datos si es necesario
cp .aios.backup/memory.db .aios/
```

---

**Recuerda**: La mayoria de los problemas pueden resolverse con:
1. `npx aios-core doctor --fix`
2. Limpiando caches
3. Actualizando a la ultima version
4. Verificando permisos

Cuando tengas dudas, la comunidad esta aqui para ayudar!
