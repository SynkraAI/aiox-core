# repurpose-content

> Transformar 1 peça de conteúdo em múltiplos formatos via Content Matrix de Vanessa Lau — maximizar alcance sem criar do zero

---

## Task Definition

```yaml
task_name: "repurpose-content"
status: active
responsible_executor: vanessa-lau
execution_type: agent
squad: presenca-digital
version: 1.0.0
```

---

## Input

- Peça original de conteúdo (texto, vídeo, podcast, post, artigo)
- Brand Voice Guidelines
- Plataformas-alvo para redistribuição
- `content-pillars.json` (para confirmar alinhamento de pilar)

## Output

- Mapa de redistribuição: peça original → derivados por plataforma
- Cada derivado com texto/roteiro adaptado completo
- Tabela de cobertura mostrando peça original vs. formatos gerados

## Action Items

1. Analisar a peça original: identificar ideia central, dados, exemplos, histórias e CTAs
2. Aplicar o **Content Matrix**: mapear todos os formatos deriváveis da peça
3. Para cada plataforma-alvo, selecionar o formato mais adequado:
   - LinkedIn: post de texto longo ou carrossel
   - Instagram: carrossel, reel, quote ou caption
   - YouTube: vídeo completo ou short
   - X (Twitter): thread ou post único
   - E-mail: newsletter ou sequência de nutrição
   - Blog: artigo SEO com estrutura expandida
4. Adaptar o conteúdo para cada formato:
   - Ajustar tamanho e densidade
   - Reformatar hook e CTA para cada plataforma
   - Manter a ideia central sem distorcer
5. Gerar texto/roteiro completo para cada derivado
6. Criar tabela de cobertura com status de cada formato
7. Validar que todos os derivados mantêm alinhamento com Brand Voice Guidelines

## Acceptance Criteria

- [ ] Peça original analisada e ideia central identificada
- [ ] Mínimo 4 formatos derivados de plataformas diferentes
- [ ] Cada derivado tem texto/roteiro completo (não apenas esqueleto)
- [ ] Hook e CTA adaptados para cada plataforma (não copy-paste)
- [ ] Tabela de cobertura gerada
- [ ] Nenhum derivado distorce a ideia central da peça original
- [ ] Tom alinhado com Brand Voice Guidelines em todos os derivados

## Veto Conditions

- Derivados que são meros copy-pastes sem adaptação para a plataforma
- Ideia central distorcida ou alterada nos derivados
- Menos de 4 formatos derivados (sub-aproveitamento da peça)
- Tom inconsistente entre derivados e a peça original

## Output Example

```
PEÇA ORIGINAL: Artigo de blog "Como criar 1 semana de conteúdo em 2 horas"
IDEIA CENTRAL: Sistema de batch content em sessão única semanal

CONTENT MATRIX — DERIVADOS:

[LinkedIn — Post de texto]
Hook: "Paro de criar conteúdo toda semana. Crio uma vez só."
[texto completo de 1.200 chars]
Status: ✓ gerado

[Instagram — Carrossel 8 slides]
Slide 1: "1 sessão de 2 horas. 1 semana de conteúdo. Aqui está o método."
[roteiro completo dos slides]
Status: ✓ gerado

[YouTube Short — 45 segundos]
Hook: "Eu produzo conteúdo para a semana toda em uma tarde. Vou mostrar como."
[roteiro completo com timecodes]
Status: ✓ gerado

[X — Thread de 6 tweets]
Tweet 1: "Parei de criar conteúdo diariamente. Faço tudo em uma sessão semanal."
[thread completa]
Status: ✓ gerado

TABELA DE COBERTURA:
| Formato       | Plataforma | Status   |
|---------------|------------|----------|
| Post longo    | LinkedIn   | Gerado   |
| Carrossel     | Instagram  | Gerado   |
| Short 45s     | YouTube    | Gerado   |
| Thread        | X          | Gerado   |
| Newsletter    | E-mail     | Pendente |
```
