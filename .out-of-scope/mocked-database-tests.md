# Mocked database em integration tests

**Status:** REJECTED (regra global)
**Decided:** Pre-existing rule (memory `feedback_*`)
**Decided by:** User (após incident em produção)
**Project:** Global (qualquer projeto AIOS)

## What was proposed
Usar mocks de database em integration tests (ao invés de hit em real DB ephemeral).

## Why it was rejected
**Incidente prior:** mock + prod divergiram silenciosamente, migration quebrou em produção, tests passaram local.

Padrão que mata:
- Mock representa schema "como o dev acha que é"
- Real DB tem constraint / trigger / RLS policy / index ausente
- Mock-test passa, prod falha
- Detecção tardia = downtime

## Trigger to revisit
Não revisitar. **Regra permanente:**
- Integration tests **DEVEM** hit real database (ephemeral container OK, in-memory clone OK, mock NÃO)
- Unit tests podem mockar DB calls (escopo: business logic, não schema validation)

## Related
- Memory keys: `feedback_*` (regra global)
- Cross: aplicável a Bretda (Vercel + Postgres), Tocks (Sales AI + Supabase), qualquer Supabase/Neon project
- Affected agents: @data-engineer, @qa, @dev
