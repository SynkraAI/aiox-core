<!--
  Traducción: ES
  Original: /docs/en/versioning-and-releases.md
  Última sincronización: 2026-01-26
-->

# Cómo Publicar una Nueva Versión

> 🌐 [EN](../versioning-and-releases.md) | [PT](../pt/versioning-and-releases.md) | **ES**

---

## Publicaciones Automatizadas (Recomendado)

La forma más fácil de publicar nuevas versiones es a través de **publicaciones semánticas automáticas**. Solo haga commit con el formato de mensaje correcto y haga push, y todo lo demás sucede automáticamente.

### Formato de Mensaje de Commit

Use estos prefijos para controlar qué tipo de publicación ocurre:

```bash
fix: resolve CLI argument parsing bug      # → publicación patch (4.1.0 → 4.1.1)
feat: add new agent orchestration mode     # → publicación minor (4.1.0 → 4.2.0)
feat!: redesign CLI interface              # → publicación major (4.1.0 → 5.0.0)
```

### Qué Sucede Automáticamente

Cuando hace push de commits con `fix:` o `feat:`, GitHub Actions:

1. ✅ Analiza sus mensajes de commit
2. ✅ Incrementa la versión en `package.json`
3. ✅ Genera changelog
4. ✅ Crea tag de git
5. ✅ **Publica a NPM automáticamente**
6. ✅ Crea release de GitHub con notas

### Su Flujo de Trabajo Simple

```bash
# Haga sus cambios
git add .
git commit -m "feat: add team collaboration mode"
git push

# ¡Eso es todo! La publicación sucede automáticamente
# Los usuarios ahora pueden ejecutar: npx aios-core (y obtener la nueva versión)
```

### Commits Que NO Disparan Publicaciones

Estos tipos de commit no crearán publicaciones (úselos para mantenimiento):

```bash
chore: update dependencies     # Sin publicación
docs: fix typo in readme      # Sin publicación
style: format code            # Sin publicación
test: add unit tests          # Sin publicación
```

### Pruebe Su Configuración

```bash
npm run release:test    # Seguro de ejecutar localmente - prueba la configuración
```

---

## Métodos de Publicación Manual (Solo Excepciones)

⚠️ Solo use estos métodos si necesita saltarse el sistema automático

### Incremento de Versión Manual Rápido

```bash
npm run version:patch   # 4.1.0 → 4.1.1 (correcciones de errores)
npm run version:minor   # 4.1.0 → 4.2.0 (nuevas características)
npm run version:major   # 4.1.0 → 5.0.0 (cambios que rompen compatibilidad)

# Luego publique manualmente:
npm publish
git push && git push --tags
```

### Disparador Manual de GitHub Actions

También puede disparar publicaciones manualmente a través de workflow dispatch de GitHub Actions si es necesario.

---

## Solución de Problemas

### Publicación No Disparada

Si su merge a `main` no disparó una publicación:

1. **Verifique los mensajes de commit** - Solo los prefijos `fix:` y `feat:` disparan publicaciones
2. **Verifique que CI pasó** - La publicación solo se ejecuta si lint, typecheck y test pasan
3. **Revise los logs del workflow** - Vaya a Actions → Semantic Release para ver detalles

### Publicación Fallida

Problemas comunes y soluciones:

| Error | Solución |
|-------|----------|
| `ENOGHTOKEN` | Falta o expiró el secret GITHUB_TOKEN |
| `ENOPKGAUTH` | Falta o es inválido el secret NPM_TOKEN |
| `ENOTINHISTORY` | La rama no tiene historial apropiado (use `fetch-depth: 0`) |
| `EINVALIDNPMTOKEN` | Regenere el token de NPM con permisos de publicación |

### Omitir una Publicación

Para hacer merge sin disparar una publicación, use una de estas opciones:

```bash
# Método 1: Use prefijo que no dispara publicación
git commit -m "chore: update dependencies"

# Método 2: Agregue [skip ci] al mensaje de commit
git commit -m "feat: new feature [skip ci]"
```

### Forzar una Publicación Manual

Si la publicación automática falla, puede publicar manualmente:

```bash
npm run version:patch   # o minor/major
git push && git push --tags
npm publish
```

---

## Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `.releaserc.json` | Configuración de semantic release |
| `.github/workflows/semantic-release.yml` | Workflow de GitHub Actions |
| `package.json` | Fuente de versión, scripts de npm |

---

*Última actualización: Story 6.17 - Automatización de Semantic Release*
