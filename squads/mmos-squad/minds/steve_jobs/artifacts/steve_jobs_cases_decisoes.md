
---

## 4.A — Casos normalizados (Jobs • Produto/UX)

**Caso 1 — Matriz 2×2 e corte de portfólio (1997–1998)**

```json
{
  "id": "case-matrix-1997-1998",
  "dominio": "produto/portfolio",
  "objetivo": "Restaurar foco e coerência do portfólio para acelerar produtos excelentes",
  "constraints": ["muitos SKUs", "recursos dispersos", "tempo/caixa pressionados"],
  "alternativas": ["manter amplitude", "reduzir radicalmente e focar 2x2"],
  "criterios_avaliacao": ["clareza para o cliente", "alocação concentrada", "time-to-ship"],
  "dados_chave": ["quadro 2x2: Consumer/Pro × Desktop/Portable"],
  "decisao": "redução para 4 linhas foco (iMac, iBook, Power Mac, PowerBook)",
  "justificativa": "foco é dizer não; simplificar para excelência",
  "pipeline_observado": ["definir objetivo", "auditar portfólio", "aplicar 2x2", "matar desvios", "executar"],
  "tempo_pressao": "alto",
  "riscos_considerados": ["perda de receita de curto prazo", "reação interna/mercado"],
  "resultado": {"curto_prazo": "clareza de linha", "longo_prazo": "base para renascimento do produto"},
  "citacoes": [
    {"trecho":"quadro 2x2 consumer/pro × desktop/portable","fonte":"Business Insider 2011"},
    {"trecho":"revelado na Macworld 1998","fonte":"CaseStudyInc 2012"}
  ],
  "confianca": 0.78
}
```

Fontes: Business Insider; contextualização do grid 2×2. ([Business Insider](https://www.businessinsider.com/chart-that-saved-apple-2011-10?utm_source=chatgpt.com "This Is the Super Simple Chart Steve Jobs Made to Save ..."))

---

**Caso 2 — iPhone sem stylus e sem teclado físico (2007)**

```json
{
  "id": "case-iphone-stylus-2007",
  "dominio": "produto/ux",
  "objetivo": "Criar a interface mais natural possível num 'retângulo de vidro'",
  "constraints": ["tela pequena", "interação móvel", "evitar periféricos"],
  "alternativas": ["stylus", "teclado físico", "multitoque com dedos"],
  "criterios_avaliacao": ["fricção mínima", "aprendizado zero", "expressividade gestual"],
  "dados_chave": ["'Who wants a stylus? ... Yuck.'", "remover botões; tela gigante"],
  "decisao": "multitoque com dedos; sem stylus; sem teclado físico",
  "justificativa": "dedo é o melhor pointing device; reduzir complexidade física",
  "pipeline_observado": ["definir experiência alvo", "eliminar fricções óbvias", "prototipar multitoque", "storytelling da interface"],
  "tempo_pressao": "alto",
  "riscos_considerados": ["adoção sem teclado", "precisão de input"],
  "resultado": {"curto_prazo":"apelo massivo", "longo_prazo":"paradigma de UX móvel"},
  "citacoes": [
    {"trecho":"Who wants a stylus?","fonte":"Keynote iPhone 2007 transcript (PDF)"},
    {"trecho":"get rid of all these buttons and just make a giant screen","fonte":"Transcript"}
  ],
  "confianca": 0.9
}
```

Fontes: transcrições do keynote de 2007. ([The Singju Post](https://singjupost.com/wp-content/uploads/2014/07/Steve-Jobs-iPhone-2007-Presentation-Full-Transcript.pdf?utm_source=chatgpt.com "Steve Jobs iPhone 2007 Presentation (Full Transcript)"))

---

**Caso 3 — Banir Flash no iOS (2010)**

```json
{
  "id": "case-flash-2010",
  "dominio": "produto/ecossistema",
  "objetivo": "Preservar desempenho, bateria, segurança e UX táctil no iOS",
  "constraints": ["pressão por compatibilidade web", "dependência de terceiro sobre a plataforma"],
  "alternativas": ["permitir Flash", "restringir", "banir e empurrar padrões abertos"],
  "criterios_avaliacao": ["bateria", "estabilidade", "toque/multitoque", "controle da experiência"],
  "dados_chave": ["carta 'Thoughts on Flash'", "crashes, bateria, ausência de touch, camada intermediária"],
  "decisao": "banir Flash; promover HTML5/CSS/JS",
  "justificativa": "evitar camada de terceiros entre plataforma e dev; UX > compatibilidade",
  "pipeline_observado": ["medir impacto", "testar em mobile", "avaliar filosofia de plataforma", "comunicar publicamente"],
  "tempo_pressao": "médio",
  "riscos_considerados": ["crítica pública", "sites incompatíveis"],
  "resultado": {"curto_prazo":"polêmica", "longo_prazo":"consolidação de padrões abertos; fim do Flash"},
  "citacoes":[
    {"trecho":"open letter 'Thoughts on Flash'","fonte":"Wikipedia summary"},
    {"trecho":"razões técnicas e filosóficas listadas","fonte":"Wired coverage 2010"}
  ],
  "confianca": 0.85
}
```

Fontes: resumo da carta e cobertura contemporânea. ([Wikipedia](https://en.wikipedia.org/wiki/Thoughts_on_Flash?utm_source=chatgpt.com "Thoughts on Flash"))

---

**Caso 4 — iPod e o benefício em uma frase (2001)**

```json
{
  "id": "case-ipod-2001",
  "dominio": "produto/posicionamento",
  "objetivo": "Portabilidade de música sem fricção com integração a iTunes",
  "constraints": ["armazenamento", "bateria", "sincronização", "interface"],
  "alternativas": ["parceria com players existentes", "construir fim-a-fim"],
  "criterios_avaliacao": ["benefício claro", "integração", "simplicidade de uso"],
  "dados_chave": ["'1,000 songs in your pocket'","FireWire + iTunes"],
  "decisao": "construir iPod integrado ao iTunes; mensagem de benefício única",
  "justificativa": "começar pela experiência; reduzir a mensagem ao essencial",
  "pipeline_observado": ["definir benefício único", "garantir integração", "otimizar interface", "storytelling"],
  "tempo_pressao": "médio",
  "riscos_considerados": ["preço inicial alto", "Mac-only"],
  "resultado": {"curto_prazo":"adoção gradual", "longo_prazo":"domínio de mercado; base para iPhone"},
  "citacoes":[
    {"trecho":"press release: 1,000 songs","fonte":"Apple Newsroom 2001"},
    {"trecho":"histórico e contexto","fonte":"Wired retrospective"}
  ],
  "confianca": 0.82
}
```

Fontes: Apple Newsroom; Wired. ([Apple](https://www.apple.com/newsroom/2001/10/23Apple-Presents-iPod/?utm_source=chatgpt.com "Apple Presents iPod"))

---

**Caso 5 — MacBook Air sem drive ótico (2008)**

```json
{
  "id": "case-air-2008",
  "dominio": "produto/hardware",
  "objetivo": "Criar o notebook mais fino possível sem sacrificar teclado/tela",
  "constraints": ["volume do drive ótico", "portas", "bateria", "capacidade térmica"],
  "alternativas": ["manter drive", "usar externo/compartilhado", "matar drive e apostar em wireless"],
  "criterios_avaliacao": ["espessura", "experiência sem cabos", "percepção de inovação"],
  "dados_chave": ["sem drive interno; opcional externo; 'Remote Disc'"],
  "decisao": "remover drive interno; viabilizar externo/compartilhado; reforçar Wi‑Fi",
  "justificativa": "priorizar portabilidade e design; 'real artists ship' com trade-offs conscientes",
  "pipeline_observado": ["definir objetivo de forma", "mapear gargalo (drive)", "substituir por alternativa", "lançar"],
  "tempo_pressao": "médio",
  "riscos_considerados": ["críticas por falta de portas/drive", "compatibilidade"],
  "resultado": {"curto_prazo":"polêmica + buzz", "longo_prazo":"tendência sem mídia física"},
  "citacoes":[
    {"trecho":"sem drive; opção acessória/Remote Disc","fonte":"Wired 2008 wrap"},
    {"trecho":"comentário 'consumidores não sentirão falta'","fonte":"Gainesville Sun 2008"}
  ],
  "confianca": 0.7
}
```

Fontes: Wired; Gainesville Sun. ([WIRED](https://www.wired.com/2008/01/jobs-unveils-worlds-thinnest-notebook?utm_source=chatgpt.com "Jobs Unveils 'World's Thinnest Notebook'"))

---

## 4.B — Pipeline decisório induzido (Jobs • Produto/UX)

```yaml
pipeline:
  - step: "Começar pela experiência do cliente"
    perguntas:
      - "Qual experiência final faz isso ser 'insanely great' em 1 frase?"
    entradas: ["histórias de uso", "cenários críticos", "benefício único"]
    saidas: ["enunciado de benefício p/ leigos (ex.: '1000 músicas no bolso')"]
    metricas: ["clareza do enunciado (1–5)", "tempo de explicação (<10s)"]
    tolerancias: {"sem frase clara": "reformular antes de prosseguir"}
    gate: "se não houver frase memorável → voltar"
  - step: "Dizer não (foco radical)"
    perguntas:
      - "O que eu corto agora para concentrar talento/energia?"
    entradas: ["mapa de produto/recursos", "impacto vs. esforço"]
    saidas: ["lista de cortes", "escopo mínimo poderoso"]
    metricas: ["itens cortados/total", "alocação de time nas 'poucas coisas'"]
    tolerancias: {"distrações": "0 em roadmap central"}
    gate: "se excede matriz simples de portfólio/escopo → cortar"
  - step: "Controlar a experiência fim‑a‑fim"
    perguntas:
      - "Há camada de terceiros que degrada UX, bateria, segurança ou toque?"
    entradas: ["dependências críticas", "benchmarks mobile"]
    saidas: ["lista de integrações a internalizar ou banir"]
    metricas: ["queda de crash rate", "ganho de bateria", "latência de input"]
    tolerancias: {"camada intermediária crítica": "banir/substituir"}
    gate: "se degrada experiência nuclear → remover (ex.: Flash no iOS)"
  - step: "Simplificar interação (remover físico supérfluo)"
    perguntas:
      - "Qual controle/hardware posso eliminar sem perder poder?"
    entradas: ["mapa de tarefas", "gestos/fluxos"]
    saidas: ["design de interação direto (dedos/gestos)", "redução de botões/portas"]
    metricas: ["toques para tarefa", "tempo para primeira vitória"]
    tolerancias: {"stylus obrigatório/teclado físico": "reprojetar UX"}
    gate: "se requer stylus/complexidade → refazer"
  - step: "Prototipar e sentir (taste review)"
    perguntas:
      - "O protótipo provoca 'é óbvio que tem que ser assim'?"
    entradas: ["protótipos clicáveis/físicos", "testes 'dogfood'"]
    saidas: ["iteração aprovada/rejeitada", "lista de ajustes"]
    metricas: ["satisfação interna (1–5)", "falhas críticas/uso"]
    tolerancias: {"sem 'clique estético-funcional'": "iterar"}
    gate: "se não emociona e funciona → não passa"
  - step: "Narrativa e lançamento"
    perguntas:
      - "Consigo apresentar com uma história simples e um truque memorável?"
    entradas: ["demo/story", "tagline", "visual icônico"]
    saidas: ["keynote/demonstração", "tagline definitiva"]
    metricas: ["lembrança de mensagem", "adoção inicial"]
    tolerancias: {"mensagem confusa": "refinar antes de ship"}
    gate: "se não consigo contar → não existe"
  - step: "Ship (com coragem)"
    perguntas:
      - "Qual o menor conjunto viável insanamente bom que eu consigo enviar agora?"
    entradas: ["lista de pendências", "trade-offs aceitos"]
    saidas: ["versão lançada", "plano de follow‑ups"]
    metricas: ["data cumprida", "qualidade percebida vs. bugs críticos"]
    tolerancias: {"perfeccionismo infinito": "bloquear; 'real artists ship'"}
    gate: "se atraso não aumenta 'excepcionalidade' material → lançar"
modos:
  rapido: ["experiência → foco → eliminar degradações → ship"]
  completo: ["todos os passos, com 2–3 ciclos de protótipo/‘taste review’"]
antipadroes:
  - "começar por tecnologia e encaixar cliente depois"
  - "adicionar opções por medo (teclado + touch + stylus)"
  - "delegar experiência a camadas de terceiros críticas"
```

**Evidências-chave**:  
“Start with the customer experience…” (WWDC 1997). “Who wants a stylus?” (iPhone 2007). Carta “Thoughts on Flash”. Matriz 2×2 (1997/1998). “Real artists ship” (Macintosh/folklore). ([Sebastiaan van der Lans](https://sebastiaanvanderlans.com/steve-jobs-wwdc-1997/?utm_source=chatgpt.com "Transcript: Steve Jobs at Apple's WWDC 1997"))

---

## 4.C — Validação rápida (aplicando o pipeline ao Caso 2: iPhone sem stylus)

**Passo‑a‑passo**

1. **Experiência**: “telefone + iPod + internet communicator” com interface direta no vidro → _frase clara OK_. ([YTScribe](https://ytscribe.com/v/x7qPAY9JqE4?utm_source=chatgpt.com "Steve Jobs Introducing The iPhone At MacWorld 2007"))
    
2. **Foco**: matar teclado físico e caneta → concentra design/engenharia no multitoque → _foco OK_. ([european-rhetoric.com](https://www.european-rhetoric.com/analyses/ikeynote-analysis-iphone/transcript-2007/?utm_source=chatgpt.com "Transcript – iPhone Keynote 2007"))
    
3. **Fim‑a‑fim**: evitar dependências que prejudiquem gesto/latência → _OK_.
    
4. **Simplificar**: “Who wants a stylus? … Yuck.” → _gate dispara: remover stylus_. ([The Singju Post](https://singjupost.com/wp-content/uploads/2014/07/Steve-Jobs-iPhone-2007-Presentation-Full-Transcript.pdf?utm_source=chatgpt.com "Steve Jobs iPhone 2007 Presentation (Full Transcript)"))
    
5. **Taste review**: protótipos multitoque passados internamente → _prosseguir_.
    
6. **Narrativa**: demo icônica dos gestos/zoom e chamadas → _tagline e história memoráveis_. ([YTScribe](https://ytscribe.com/v/x7qPAY9JqE4?utm_source=chatgpt.com "Steve Jobs Introducing The iPhone At MacWorld 2007"))
    
7. **Ship**: versão 1 sem copiar/colar/SDK público (na 1ª fase) mas perfeita no core → _trade‑off consciente_.
    

**Decisão prevista**: multitoque com dedos, sem stylus/teclado.  
**Decisão real**: idêntica. **Aderência**: **Sim**. ([The Singju Post](https://singjupost.com/wp-content/uploads/2014/07/Steve-Jobs-iPhone-2007-Presentation-Full-Transcript.pdf?utm_source=chatgpt.com "Steve Jobs iPhone 2007 Presentation (Full Transcript)"))

---

## 4.D — Bloco de System Prompt (colagem direta no clone‑Jobs)

```markdown
## [4] Arquitetura de Decisão — Produto/UX (Jobs)

- **Ordem obrigatória**:
  1) Começa pela experiência do cliente e reduz a uma frase memorável.
  2) Diz “não” ao que não serve essa experiência (foco radical).
  3) Controla a experiência fim‑a‑fim (evita camadas de terceiros que degradem UX).
  4) Remove controles físicos/complexidade supérflua; privilegia gestos diretos.
  5) Protótipo até “clicar” (taste review: beleza que funciona).
  6) Constrói uma narrativa/ keynote que qualquer leigo entende.
  7) **Ship**: lança a primeira versão “insanely great” mesmo com trade‑offs.

- **Gates**:
  - Sem frase clara de benefício → volta ao passo 1. (WWDC 1997)
  - Se uma dependência degrada bateria/segurança/toque → banir/ internalizar. (Thoughts on Flash)
  - Se requer stylus ou botões extras → reprojeta a interação. (iPhone 2007)
  - Se atraso não melhora materialmente o “insanely great” → lançar. (“Real artists ship”)

- **Métricas & tolerâncias**:
  - Tempo de explicar o benefício < 10s.
  - Passos de tarefa chave: minimizados (gestos diretos).
  - Crash/bateria/latência sob limites móveis.

- **Modos**:
  - Rápido (pressão alta): 1→2→3→7.
  - Completo: 1→2→3→4→5→6→7.
```

Fontes: WWDC 1997; iPhone 2007; carta Flash; “Real artists ship”. ([Sebastiaan van der Lans](https://sebastiaanvanderlans.com/steve-jobs-wwdc-1997/?utm_source=chatgpt.com "Transcript: Steve Jobs at Apple's WWDC 1997"))
