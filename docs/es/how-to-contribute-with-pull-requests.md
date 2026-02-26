<!-- Traduccion: ES | Original: /docs/en/how-to-contribute-with-pull-requests.md | Sincronizacion: 2026-01-26 -->

# Como Contribuir con Pull Requests

> 🌐 [EN](../how-to-contribute-with-pull-requests.md) | [PT](../pt/how-to-contribute-with-pull-requests.md) | **ES**

---

**Nuevo en GitHub y en pull requests?** Esta guia te orientara a traves de los conceptos basicos paso a paso.

## Que es un Pull Request?

Un pull request (PR) es como propones cambios a un proyecto en GitHub. Piensalo como decir "Aqui hay algunos cambios que me gustaria hacer - por favor, revisa y considera agregarlos al proyecto principal."

## Antes de Comenzar

**Importante**: Por favor, manten tus contribuciones pequenas y enfocadas! Preferimos muchos cambios pequenos y claros en lugar de un unico cambio masivo.

**Obligatorio antes de enviar PRs:**

- **Para correcciones de bugs**: Crea un issue usando la [plantilla de reporte de bugs](https://github.com/SynkraAIinc/aios-core/issues/new?template=bug_report.md)
- **Para nuevas features**:
  1. Discute en Discord en el [canal #general-dev](https://discord.gg/gk8jAdXWmj)
  2. Crea un issue usando la [plantilla de solicitud de feature](https://github.com/SynkraAIinc/aios-core/issues/new?template=feature_request.md)
- **Para cambios grandes**: Siempre abre un issue primero para discutir la alineacion

## Guia Paso a Paso

### 1. Hacer Fork del Repositorio

1. Ve al [repositorio Synkra AIOS](https://github.com/SynkraAIinc/aios-core)
2. Haz clic en el boton "Fork" en la esquina superior derecha
3. Esto crea tu propia copia del proyecto

### 2. Clonar Tu Fork

```bash
# Reemplaza TU-USUARIO por tu nombre de usuario real de GitHub
git clone https://github.com/TU-USUARIO/aios-core.git
cd aios-core
```

### 3. Crear una Nueva Rama

**Nunca trabajes directamente en la rama `main`!** Siempre crea una nueva rama para tus cambios:

```bash
# Crear y cambiar a una nueva rama
git checkout -b fix/typo-in-readme
# o
git checkout -b feature/add-new-agent
```

**Consejos de nomenclatura de ramas:**

- `fix/descripcion` - para correcciones de bugs
- `feature/descripcion` - para nuevas funcionalidades
- `docs/descripcion` - para cambios en la documentacion

### 4. Hacer Tus Cambios

- Edita los archivos que deseas modificar
- Manten los cambios pequenos y enfocados en una sola cosa
- Prueba tus cambios si es posible

### 5. Hacer Commit de Tus Cambios

```bash
# Agregar tus cambios
git add .

# Commit con un mensaje claro
git commit -m "Corregir error de escritura en README.md"
```

**Buenos mensajes de commit:**

- "Corregir error de escritura en las instrucciones de instalacion"
- "Agregar ejemplo de uso de nuevo agente"
- "Actualizar enlace roto en la documentacion"

**Malos mensajes de commit:**

- "cosas"
- "cambios"
- "actualizar"

### 6. Hacer Push a Tu Fork

```bash
# Hacer push de tu rama a tu fork
git push origin fix/typo-in-readme
```

### 7. Crear el Pull Request

1. Ve a tu fork en GitHub
2. Veras un boton verde "Compare & pull request" - haz clic en el
3. Selecciona la rama de destino correcta:
   - **Rama `next`** para la mayoria de las contribuciones (features, docs, mejoras)
   - **Rama `main`** solo para correcciones criticas
4. Completa la descripcion del PR usando la plantilla en CONTRIBUTING.md:
   - **Que**: 1-2 oraciones describiendo que cambio
   - **Por Que**: 1-2 oraciones explicando el motivo
   - **Como**: 2-3 puntos sobre la implementacion
   - **Pruebas**: Como lo probaste
5. Referencia el numero del issue relacionado (ej: "Fixes #123")

### 8. Esperar Revision

- Un mantenedor revisara tu PR
- Pueden pedir cambios
- Se paciente y receptivo al feedback

## Que Hace un Buen Pull Request?

**Buenos PRs:**

- Cambian una cosa a la vez
- Tienen titulos claros y descriptivos
- Explican el que y por que en la descripcion
- Incluyen solo los archivos que necesitan cambiar

**Evita:**

- Cambiar el formato de archivos completos
- Multiples cambios no relacionados en un PR
- Copiar tu proyecto/repositorio completo en el PR
- Cambios sin explicacion

## Errores Comunes a Evitar

1. **No reformatees archivos completos** - cambia solo lo necesario
2. **No incluyas cambios no relacionados** - enfocate en una correccion/feature por PR
3. **No pegues codigo en issues** - crea un PR apropiado en su lugar
4. **No envies tu proyecto completo** - contribuye con mejoras especificas

## Necesitas Ayuda?

- Reporta bugs usando la [plantilla de reporte de bugs](https://github.com/SynkraAIinc/aios-core/issues/new?template=bug_report.md)
- Sugiere features usando la [plantilla de solicitud de feature](https://github.com/SynkraAIinc/aios-core/issues/new?template=feature_request.md)
- Lee las [Directrices de Contribucion](../../CONTRIBUTING.md) completas

## Ejemplo: Buenos PRs vs Malos

### Ejemplo de Buen PR

**Titulo**: "Corregir enlace roto hacia la guia de instalacion"
**Cambios**: Un archivo, una linea modificada
**Descripcion**: "El enlace en README.md estaba apuntando al archivo incorrecto. Actualizado para apuntar a la guia de instalacion correcta."

### Ejemplo de Mal PR

**Titulo**: "Actualizaciones"
**Cambios**: 50 archivos, codebase completo reformateado
**Descripcion**: "Hice algunas mejoras"

---

**Recuerda**: Estamos aqui para ayudar! No tengas miedo de hacer preguntas. Todo experto fue principiante alguna vez.
