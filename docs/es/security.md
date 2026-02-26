# Política de Seguridad

> 🇧🇷 [Versão em Português](SECURITY-PT.md)

## Versiones Soportadas

Lanzamos parches para vulnerabilidades de seguridad en las siguientes versiones:

| Versión | Soportada          |
| ------- | ------------------ |
| 2.1.x   | :white_check_mark: |
| < 2.1   | :x:                |

## Reportar una Vulnerabilidad

Tomamos la seguridad en serio en SynkraAI. Si descubres una vulnerabilidad de seguridad en AIOS, por favor repórtala de manera responsable.

### Cómo Reportar

**NO** crees un issue público en GitHub para vulnerabilidades de seguridad.

En su lugar, por favor reporta vulnerabilidades de seguridad a través de uno de estos canales:

1. **GitHub Security Advisories** (Preferido)
   - Ve a [Security Advisories](https://github.com/SynkraAI/aios-core/security/advisories)
   - Haz clic en "Report a vulnerability"
   - Completa el formulario con los detalles

2. **GitHub Issues (Privado)**
   - Abre un [security advisory privado](https://github.com/SynkraAI/aios-core/security/advisories)
   - Usa el asunto: `[SECURITY] Descripción breve`

### Qué Incluir

Por favor incluye lo siguiente en tu reporte:

- **Descripción**: Una descripción clara de la vulnerabilidad
- **Impacto**: ¿Qué podría lograr un atacante con esta vulnerabilidad?
- **Pasos para Reproducir**: Pasos detallados para reproducir el problema
- **Versiones Afectadas**: ¿Qué versiones están afectadas?
- **Posible Solución**: Si tienes sugerencias sobre cómo solucionar el problema
- **Tu Información**: Nombre/alias para reconocimiento (opcional)

### Qué Esperar

1. **Confirmación**: Confirmaremos la recepción dentro de 48 horas
2. **Evaluación Inicial**: Proporcionaremos una evaluación inicial dentro de 5 días hábiles
3. **Actualizaciones**: Te mantendremos informado de nuestro progreso
4. **Resolución**: Nuestro objetivo es resolver problemas críticos dentro de 30 días
5. **Divulgación**: Coordinaremos el momento de divulgación contigo

### Puerto Seguro

Consideramos que la investigación de seguridad realizada de acuerdo con esta política es:

- Autorizada en relación con cualquier ley anti-hacking aplicable
- Autorizada en relación con cualquier ley anti-elusión relevante
- Exenta de restricciones en nuestros Términos de Servicio que interfieran con la realización de investigaciones de seguridad

No emprenderemos acciones civiles ni iniciaremos una denuncia ante las fuerzas del orden por violaciones accidentales y de buena fe de esta política.

## Mejores Prácticas de Seguridad

Al usar AIOS Framework, recomendamos:

### Variables de Entorno

- Nunca hagas commit de archivos `.env` al control de versiones
- Usa `.env.example` como plantilla sin valores reales
- Rota las claves API y secretos regularmente

### Seguridad del Servidor MCP

- Solo habilita servidores MCP de fuentes confiables
- Revisa el código del servidor MCP antes de habilitarlo
- Usa entornos de ejecución en sandbox cuando estén disponibles
- Limita los permisos del servidor MCP al mínimo requerido

### Seguridad del Agente AI

- Ten precaución con comandos de agentes que ejecuten operaciones del sistema
- Revisa el código generado antes de la ejecución en producción
- Usa controles de acceso apropiados para operaciones sensibles

### Gestión de Dependencias

- Mantén las dependencias actualizadas
- Ejecuta `npm audit` regularmente
- Revisa los cambios de dependencias en pull requests

## Consideraciones de Seguridad Conocidas

### Arquitectura del Framework

AIOS Framework ejecuta código y comandos generados por AI. Los usuarios deben:

- Entender que los agentes AI pueden ejecutar código arbitrario
- Usar sandboxing apropiado para entornos no confiables
- Revisar la salida generada por AI antes del despliegue en producción

### Manejo de Datos

- AIOS puede procesar datos sensibles a través de proveedores de AI
- Revisa las políticas de manejo de datos de tu proveedor de AI
- Considera la clasificación de datos al usar características de AI

## Actualizaciones de Seguridad

Las actualizaciones de seguridad se anuncian a través de:

- [GitHub Security Advisories](https://github.com/SynkraAI/aios-core/security/advisories)
- [CHANGELOG.md](./CHANGELOG.md)
- GitHub Releases

## Reconocimientos

Agradecemos a los siguientes investigadores por divulgar de manera responsable problemas de seguridad:

*Aún no hay reportes - ¡sé el primero!*

---

*Esta política de seguridad es efectiva desde diciembre de 2024.*
*Última actualización: 2025-12-11*
