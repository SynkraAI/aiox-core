<!--
  Traducción: ES
  Original: /docs/en/uninstallation.md
  Última sincronización: 2026-01-26
-->

# Guía de Desinstalación

> 🌐 [EN](../uninstallation.md) | [PT](../pt/uninstallation.md) | **ES**

---

Esta guía proporciona instrucciones completas para desinstalar Synkra AIOX de su sistema.

## Tabla de Contenidos

1. [Antes de Desinstalar](#antes-de-desinstalar)
2. [Desinstalación Rápida](#desinstalación-rápida)
3. [Desinstalación Completa](#desinstalación-completa)
4. [Desinstalación Selectiva](#desinstalación-selectiva)
5. [Preservación de Datos](#preservación-de-datos)
6. [Eliminación Limpia del Sistema](#eliminación-limpia-del-sistema)
7. [Resolución de Problemas de Desinstalación](#resolución-de-problemas-de-desinstalación)
8. [Limpieza Post-Desinstalación](#limpieza-post-desinstalación)
9. [Reinstalación](#reinstalación)

## Antes de Desinstalar

### Consideraciones Importantes

⚠️ **Advertencia**: Desinstalar Synkra AIOX:

- Eliminará todos los archivos del framework
- Borrará configuraciones de agentes (a menos que se preserven)
- Limpiará datos de la capa de memoria (a menos que se respalden)
- Eliminará todos los flujos de trabajo personalizados
- Borrará logs y archivos temporales

### Checklist Pre-Desinstalación

- [ ] Respaldar datos importantes
- [ ] Exportar agentes y flujos de trabajo personalizados
- [ ] Guardar claves API y configuraciones
- [ ] Documentar modificaciones personalizadas
- [ ] Detener todos los procesos en ejecución
- [ ] Informar a los miembros del equipo

### Respalde Sus Datos

```bash
# Crear respaldo completo
npx aiox-core backup --complete

# O respaldar manualmente directorios importantes
tar -czf aiox-backup-$(date +%Y%m%d).tar.gz \
  .aiox/ \
  agents/ \
  workflows/ \
  tasks/ \
  --exclude=.aiox/logs \
  --exclude=.aiox/cache
```

## Desinstalación Rápida

### Usando el Desinstalador Incorporado

La forma más rápida de desinstalar Synkra AIOX:

```bash
# Desinstalación básica (preserva datos de usuario)
npx aiox-core uninstall

# Desinstalación completa (elimina todo)
npx aiox-core uninstall --complete

# Desinstalación con preservación de datos
npx aiox-core uninstall --keep-data
```

### Desinstalación Interactiva

Para desinstalación guiada:

```bash
npx aiox-core uninstall --interactive
```

Esto le preguntará:

- Qué mantener/eliminar
- Opciones de respaldo
- Confirmación para cada paso

## Desinstalación Completa

### Paso 1: Detener Todos los Servicios

```bash
# Detener todos los agentes en ejecución
*deactivate --all

# Detener todos los flujos de trabajo
*stop-workflow --all

# Apagar meta-agent
*shutdown
```

### Paso 2: Exportar Datos Importantes

```bash
# Exportar configuraciones
*export config --destination backup/config.json

# Exportar agentes
*export agents --destination backup/agents/

# Exportar flujos de trabajo
*export workflows --destination backup/workflows/

# Exportar datos de memoria
*export memory --destination backup/memory.zip
```

### Paso 3: Ejecutar el Desinstalador

```bash
# Eliminación completa
npx aiox-core uninstall --complete --no-backup
```

### Paso 4: Eliminar Instalación Global

```bash
# Eliminar paquete npm global
npm uninstall -g aiox-core

# Eliminar cache de npx
npm cache clean --force
```

### Paso 5: Limpiar Archivos del Sistema

#### Windows

```powershell
# Eliminar archivos de AppData
Remove-Item -Recurse -Force "$env:APPDATA\aiox-core"

# Eliminar archivos temporales
Remove-Item -Recurse -Force "$env:TEMP\aiox-*"

# Eliminar entradas del registro (si las hay)
Remove-Item -Path "HKCU:\Software\Synkra AIOX" -Recurse
```

#### macOS/Linux

```bash
# Eliminar archivos de configuración
rm -rf ~/.aiox
rm -rf ~/.config/aiox-core

# Eliminar cache
rm -rf ~/.cache/aiox-core

# Eliminar archivos temporales
rm -rf /tmp/aiox-*
```

## Desinstalación Selectiva

### Eliminar Componentes Específicos

```bash
# Eliminar solo agentes
npx aiox-core uninstall agents

# Eliminar solo flujos de trabajo
npx aiox-core uninstall workflows

# Eliminar capa de memoria
npx aiox-core uninstall memory-layer

# Eliminar agente específico
*uninstall agent-name
```

### Mantener Core, Eliminar Extensiones

```bash
# Eliminar todos los plugins
*plugin remove --all

# Eliminar Squads
rm -rf Squads/

# Eliminar plantillas personalizadas
rm -rf templates/custom/
```

## Preservación de Datos

### Qué Mantener

Antes de desinstalar, identifique lo que desea preservar:

1. **Agentes Personalizados**

   ```bash
   # Copiar agentes personalizados
   cp -r agents/custom/ ~/aiox-backup/agents/
   ```

2. **Flujos de Trabajo y Tareas**

   ```bash
   # Copiar flujos de trabajo
   cp -r workflows/ ~/aiox-backup/workflows/
   cp -r tasks/ ~/aiox-backup/tasks/
   ```

3. **Datos de Memoria**

   ```bash
   # Exportar base de datos de memoria
   *memory export --format sqlite \
     --destination ~/aiox-backup/memory.db
   ```

4. **Configuraciones**

   ```bash
   # Copiar todos los archivos de configuración
   cp .aiox/config.json ~/aiox-backup/
   cp .env ~/aiox-backup/
   ```

5. **Código Personalizado**
   ```bash
   # Encontrar y respaldar archivos personalizados
   find . -name "*.custom.*" -exec cp {} ~/aiox-backup/custom/ \;
   ```

### Script de Preservación

Crear `preserve-data.sh`:

```bash
#!/bin/bash
BACKUP_DIR="$HOME/aiox-backup-$(date +%Y%m%d-%H%M%S)"

echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Función de respaldo
backup_if_exists() {
    if [ -e "$1" ]; then
        echo "Backing up $1..."
        cp -r "$1" "$BACKUP_DIR/"
    fi
}

# Respaldar todos los datos importantes
backup_if_exists ".aiox"
backup_if_exists "agents"
backup_if_exists "workflows"
backup_if_exists "tasks"
backup_if_exists "templates"
backup_if_exists ".env"
backup_if_exists "package.json"

echo "Backup completed at: $BACKUP_DIR"
```

## Eliminación Limpia del Sistema

### Script de Limpieza Completa

Crear `clean-uninstall.sh`:

```bash
#!/bin/bash
echo "Synkra AIOX Complete Uninstall"
echo "================================="

# Confirmación
read -p "This will remove ALL Synkra AIOX data. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Detener todos los procesos
echo "Stopping all processes..."
pkill -f "aiox-core" || true
pkill -f "aiox-developer" || true

# Eliminar archivos del proyecto
echo "Removing project files..."
rm -rf .aiox/
rm -rf agents/
rm -rf workflows/
rm -rf tasks/
rm -rf templates/
rm -rf Squads/
rm -rf node_modules/aiox-core/

# Eliminar archivos globales
echo "Removing global files..."
npm uninstall -g aiox-core

# Eliminar datos de usuario
echo "Removing user data..."
rm -rf ~/.aiox
rm -rf ~/.config/aiox-core
rm -rf ~/.cache/aiox-core

# Limpiar cache de npm
echo "Cleaning npm cache..."
npm cache clean --force

# Eliminar de package.json
echo "Updating package.json..."
npm uninstall aiox-core/core
npm uninstall aiox-core/memory
npm uninstall aiox-core/meta-agent

echo "Uninstall complete!"
```

### Limpieza del Registro (Windows)

```powershell
# Script PowerShell para limpieza de Windows
Write-Host "Cleaning Synkra AIOX from Windows Registry..."

# Eliminar del PATH
$path = [Environment]::GetEnvironmentVariable("PATH", "User")
$newPath = ($path.Split(';') | Where-Object { $_ -notmatch 'aiox-core' }) -join ';'
[Environment]::SetEnvironmentVariable("PATH", $newPath, "User")

# Eliminar claves del registro
Remove-ItemProperty -Path "HKCU:\Environment" -Name "AIOX_*" -ErrorAction SilentlyContinue

# Eliminar asociaciones de archivos
Remove-Item -Path "HKCU:\Software\Classes\.aiox" -Recurse -ErrorAction SilentlyContinue

Write-Host "Registry cleanup complete!"
```

## Resolución de Problemas de Desinstalación

### Problemas Comunes

#### 1. Permiso Denegado

```bash
# Linux/macOS
sudo npx aiox-core uninstall --complete

# Windows (Ejecutar como Administrador)
npx aiox-core uninstall --complete
```

#### 2. Proceso Todavía en Ejecución

```bash
# Forzar detención de todos los procesos
# Linux/macOS
killall -9 node
killall -9 aiox-core

# Windows
taskkill /F /IM node.exe
taskkill /F /IM aiox-core.exe
```

#### 3. Archivos Bloqueados

```bash
# Encontrar procesos usando archivos
# Linux/macOS
lsof | grep aiox

# Windows (PowerShell)
Get-Process | Where-Object {$_.Path -like "*aiox*"}
```

#### 4. Eliminación Incompleta

```bash
# Limpieza manual
find . -name "*aiox*" -type d -exec rm -rf {} +
find . -name "*.aiox*" -type f -delete
```

### Desinstalación Forzada

Si la desinstalación normal falla:

```bash
#!/bin/bash
# force-uninstall.sh
echo "Force uninstalling Synkra AIOX..."

# Matar todos los procesos relacionados
pkill -9 -f aiox || true

# Eliminar todos los archivos
rm -rf .aiox* aiox* *aiox*
rm -rf agents workflows tasks templates
rm -rf node_modules/aiox-core
rm -rf ~/.aiox* ~/.config/aiox* ~/.cache/aiox*

# Limpiar npm
npm cache clean --force
npm uninstall -g aiox-core

echo "Force uninstall complete!"
```

## Limpieza Post-Desinstalación

### 1. Verificar Eliminación

```bash
# Buscar archivos restantes
find . -name "*aiox*" 2>/dev/null
find ~ -name "*aiox*" 2>/dev/null

# Verificar paquetes npm
npm list -g | grep aiox
npm list | grep aiox

# Verificar procesos en ejecución
ps aux | grep aiox
```

### 2. Limpiar Variables de Entorno

```bash
# Eliminar de .bashrc/.zshrc
sed -i '/AIOX_/d' ~/.bashrc
sed -i '/aiox-core/d' ~/.bashrc

# Eliminar de archivos .env
find . -name ".env*" -exec sed -i '/AIOX_/d' {} \;
```

### 3. Actualizar Archivos del Proyecto

```javascript
// Eliminar de los scripts de package.json
{
  "scripts": {
    // Eliminar estas entradas
    "aiox": "aiox-core",
    "meta-agent": "aiox-core meta-agent"
  }
}
```

### 4. Limpiar Repositorio Git

```bash
# Eliminar hooks de git específicos de AIOX
rm -f .git/hooks/*aiox*

# Actualizar .gitignore
sed -i '/.aiox/d' .gitignore
sed -i '/aiox-/d' .gitignore

# Commit de eliminación
git add -A
git commit -m "Remove Synkra AIOX"
```

## Reinstalación

### Después de Desinstalación Completa

Si desea reinstalar Synkra AIOX:

1. **Esperar la limpieza**

   ```bash
   # Asegurar que todos los procesos se detuvieron
   sleep 5
   ```

2. **Limpiar cache de npm**

   ```bash
   npm cache clean --force
   ```

3. **Instalación fresca**
   ```bash
   npx aiox-core@latest init my-project
   ```

### Restaurar desde Respaldo

```bash
# Restaurar datos guardados
cd my-project

# Restaurar configuraciones
cp ~/aiox-backup/config.json .aiox/

# Restaurar agentes
cp -r ~/aiox-backup/agents/* ./agents/

# Importar memoria
*memory import ~/aiox-backup/memory.zip

# Verificar restauración
*doctor --verify-restore
```

## Checklist de Verificación de Desinstalación

- [ ] Todos los procesos AIOX detenidos
- [ ] Archivos del proyecto eliminados
- [ ] Paquete npm global desinstalado
- [ ] Archivos de configuración de usuario eliminados
- [ ] Directorios de cache limpiados
- [ ] Variables de entorno eliminadas
- [ ] Entradas del registro limpiadas (Windows)
- [ ] Repositorio Git actualizado
- [ ] No se encontraron archivos AIOX restantes
- [ ] PATH del sistema actualizado

## Obtener Ayuda

Si encuentra problemas durante la desinstalación:

1. **Consultar Documentación**
   - [FAQ](https://github.com/SynkraAI/aiox-core/wiki/faq#uninstall)
   - [Solución de Problemas](https://github.com/SynkraAI/aiox-core/wiki/troubleshooting)

2. **Soporte de la Comunidad**
   - Discord: #uninstall-help
   - GitHub Issues: Etiquetar con "uninstall"

3. **Soporte de Emergencia**
   ```bash
   # Generar reporte de desinstalación
   npx aiox-core diagnose --uninstall > uninstall-report.log
   ```

---

**Recuerde**: Siempre respalde sus datos antes de desinstalar. El proceso de desinstalación es irreversible, y la recuperación de datos puede no ser posible sin respaldos adecuados.
