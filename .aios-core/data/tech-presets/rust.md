# Rust Tech Preset

> Preset de arquitetura para servicos Rust com foco em seguranca de memoria, previsibilidade de concorrencia e latencia baixa.

---

## Metadata

```yaml
preset:
  id: rust
  name: 'Rust Service Preset'
  version: 1.0.0
  description: 'Arquitetura para APIs e workers em Rust 1.77+ com contratos por traits, errors tipados e testes confiaveis'
  technologies:
    - Rust 1.77+
    - Axum
    - Tokio
    - SQLx
    - Serde
    - thiserror
    - rstest
  suitable_for:
    - 'Servicos de alta confiabilidade'
    - 'Sistemas IO-bound e concorrentes'
    - 'APIs com requisitos de performance'
  not_suitable_for:
    - 'Projetos com equipe sem familiaridade minima com ownership'
    - 'Front-end web tradicional'
```

---

## Design Patterns (The Essential 5)

### Pattern 1: Trait Contract Pattern

**Purpose:** Definir fronteiras estaveis entre dominio e infraestrutura.

**Execution Score:** 10/10 | **Anti-Bug Score:** 10/10

```rust
// src/orders/ports.rs
use async_trait::async_trait;

#[async_trait]
pub trait OrderRepository: Send + Sync {
    async fn save(&self, order: Order) -> Result<(), AppError>;
    async fn find_by_id(&self, id: &str) -> Result<Option<Order>, AppError>;
}
```

**Bugs Eliminated:**

- Acoplamento com driver de banco
- Mudancas de infra quebrando use cases

**Why It Works:**

- Traits tornam contratos explicitos e mockaveis
- Ownership evita estados invalidos compartilhados

---

### Pattern 2: Use Case Service Pattern

**Purpose:** Centralizar regras de negocio em funcoes puras + dependencias injetadas.

**Execution Score:** 9/10 | **Anti-Bug Score:** 9/10

```rust
// src/orders/service.rs
pub struct OrderService<R, P> {
    repo: R,
    payment: P,
}

impl<R, P> OrderService<R, P>
where
    R: OrderRepository,
    P: PaymentGateway,
{
    pub async fn place_order(&self, cmd: PlaceOrderCommand) -> Result<Order, AppError> {
        let order = Order::new(cmd.customer_id, cmd.items)?;
        self.payment.charge(order.id(), order.total()).await?;
        self.repo.save(order.clone()).await?;
        Ok(order)
    }
}
```

**Bugs Eliminated:**

- Regra duplicada em handlers
- Sequencia de passos inconsistente

**Why It Works:**

- Fluxo explicito com `Result`
- Estado imutavel por padrao

---

### Pattern 3: Error Enum Pattern

**Purpose:** Padronizar erros de dominio e infraestrutura sem strings soltas.

**Execution Score:** 9/10 | **Anti-Bug Score:** 9/10

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("validation error: {0}")]
    Validation(String),
    #[error("not found")]
    NotFound,
    #[error("infra error: {0}")]
    Infra(String),
}
```

**Bugs Eliminated:**

- Tratamento inconsistente de falhas
- Perda de contexto de erro

**Why It Works:**

- Match exhaustivo previne casos nao tratados
- Conversoes ficam declarativas

---

### Pattern 4: Tokio Task Supervisor Pattern

**Purpose:** Executar jobs concorrentes com shutdown limpo e controle de falhas.

**Execution Score:** 8/10 | **Anti-Bug Score:** 8/10

```rust
use tokio::select;
use tokio_util::sync::CancellationToken;

pub async fn run_worker(stop: CancellationToken) {
    loop {
        select! {
            _ = stop.cancelled() => break,
            _ = process_next_job() => {}
        }
    }
}
```

**Bugs Eliminated:**

- Tasks orfas em deploy/shutdown
- Loop infinito sem cancelamento

**Why It Works:**

- Cancel token explicito
- Convergencia previsivel em encerramento

---

### Pattern 5: Builder Pattern (Tests Only)

**Purpose:** Construir cenarios de teste sem repeticao extensa.

**Execution Score:** 8/10 | **Anti-Bug Score:** 8/10

```rust
pub struct PlaceOrderBuilder {
    customer_id: String,
    items: Vec<ItemInput>,
}

impl PlaceOrderBuilder {
    pub fn new() -> Self {
        Self {
            customer_id: "cust-1".to_string(),
            items: vec![ItemInput::new("SKU-1", 1)],
        }
    }

    pub fn build(self) -> PlaceOrderCommand {
        PlaceOrderCommand {
            customer_id: self.customer_id,
            items: self.items,
        }
    }
}
```

**Bugs Eliminated:**

- Setup repetitivo
- Testes menos legiveis

**Why It Works:**

- Cenarios ficam declarativos
- Evolucao de command centralizada

---

## Project Structure

```text
/src
  /bin                      # Entrypoints (api, worker)
  /orders
    mod.rs
    /domain                 # Entidades e invariantes
    /application            # Use cases e comandos
    /ports                  # Traits de entrada/saida
    /infrastructure         # SQLx adapters, gateways
    /http                   # Axum handlers, DTOs
  /shared
    /errors                 # AppError
    /observability          # tracing, metrics
/tests
  /integration              # DB real / infra local
  /e2e                      # Fluxos ponta a ponta
```

### Structure Rationale

- **Bounded modules:** Cada contexto com fronteiras fortes
- **Traits first:** Contratos antes de adapter
- **Infra at edge:** Framework e DB fora do core

---

## Tech Stack

| Category | Technology | Version | Purpose |
| -------- | ---------- | ------- | ------- |
| Language | Rust | 1.77+ | Runtime principal |
| Web | Axum | ^0.8 | API HTTP assíncrona |
| Async Runtime | Tokio | ^1.44 | Concurrency runtime |
| DB | SQLx | ^0.8 | Queries tipadas async |
| Serialization | Serde | ^1.0 | JSON parsing/encoding |
| Errors | thiserror/anyhow | latest | Erros tipados + contexto |
| Logging | tracing | ^0.1 | Telemetria estruturada |
| Unit Test | rstest | latest | Parametrizacao de testes |
| Integration Test | testcontainers | latest | Dependencias reais |

### Required Dependencies

```bash
cargo add axum tokio --features full
cargo add serde --features derive
cargo add sqlx --features runtime-tokio-rustls,postgres,macros
cargo add thiserror anyhow
cargo add tracing tracing-subscriber
cargo add async-trait

cargo add --dev rstest
cargo add --dev testcontainers
```

---

## Coding Standards

### Naming Conventions

| Element | Convention | Example |
| ------- | ---------- | ------- |
| Modules | snake_case | `order_service` |
| Structs/Enums | PascalCase | `OrderService`, `AppError` |
| Traits | PascalCase noun | `OrderRepository` |
| Functions | snake_case | `place_order` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Tests | `should_*` | `should_reject_empty_items` |

### Critical Rules

1. **No `unwrap()` in Production Paths:** Use `?` e tratamento explicito.
2. **Error Boundaries:** Converter erros de infra para `AppError` na borda.
3. **Ownership Clarity:** Evitar clones desnecessarios, preferir borrowing.
4. **Async Discipline:** Evitar blocking calls no runtime tokio.
5. **Public API Minimal:** Exportar apenas o necessario via `mod.rs`.

### Rust Quality Baseline

```bash
cargo fmt --all
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all
```

---

## Testing Strategy

### Test Pyramid

```text
         /\
        /E2E\           10% - Endpoints e fluxos criticos
       /------\
      /Integration\     30% - DB/gateway adapters
     /------------\
    /  Unit Tests  \    60% - Dominio e use cases
   /----------------\
```

### What to Test

#### Always Test (Critical)

- [ ] Invariantes de dominio
- [ ] Conversoes de erro
- [ ] Casos de uso principais e falhas

#### Consider Testing

- [ ] Handlers Axum com req/res reais
- [ ] Timeouts e cancelamento em workers

#### Never Test

- [ ] Implementacao interna de crates terceiros
- [ ] Codigo gerado sem regra adicional

### Coverage Goals

```text
- Domain/Application: 90%+
- Infrastructure adapters: 70%+
- Overall: 75%+
```

### Test Template

```rust
#[tokio::test]
async fn should_place_order_successfully() {
    let repo = InMemoryRepo::default();
    let gateway = FakePaymentGateway::approved();
    let service = OrderService::new(repo, gateway);

    let cmd = PlaceOrderBuilder::new().build();
    let result = service.place_order(cmd).await;

    assert!(result.is_ok());
}
```

---

## Token Economy Strategies

### Strategy 1: Pass Trait + Test First

Pedir implementacao com base em trait e teste alvo reduz contexto.

### Strategy 2: Reuse Module Skeleton

Criar um modulo referencia e copiar padrao para features novas.

### Strategy 3: Keep Lifetimes Hidden Where Possible

Usar tipos owns em boundaries publicos para prompts mais objetivos.

---

## Bug Prevention Stack

| Layer | Catches | Implementation |
| ----- | ------- | -------------- |
| Compiler ownership model | 40% | Borrow checker |
| Clippy + lint rigor | 25% | `-D warnings` |
| Unit/integration tests | 30% | cargo test + testcontainers |
| E2E smoke | 5% | Fluxos criticos |

---

## Patterns to AVOID

### `unwrap()` Everywhere

Panic inesperado em runtime de producao.

### Huge Trait with Many Responsibilities

Interfaces grandes dificultam mock e evolucao.

### Shared Mutable State Without Sync Primitive

Uso de `static mut` ou estados globais sem `Mutex/RwLock`.

---

## File Templates

### Port Template

```rust
#[async_trait::async_trait]
pub trait NotificationPort {
    async fn send(&self, payload: Notification) -> Result<(), AppError>;
}
```

### Service Template

```rust
pub struct UseCaseService<R> {
    repo: R,
}

impl<R: RepositoryPort> UseCaseService<R> {
    pub async fn execute(&self, cmd: Command) -> Result<Response, AppError> {
        Ok(Response::default())
    }
}
```

### Handler Template

```rust
pub async fn create_order(
    State(service): State<AppState>,
    Json(request): Json<CreateOrderRequest>,
) -> Result<Json<CreateOrderResponse>, AppError> {
    let _ = service;
    let _ = request;
    Ok(Json(CreateOrderResponse::default()))
}
```

---

## Integration with AIOS

### Recommended Workflow

1. `@architect` define modules e boundaries pelo preset `rust`
2. `@dev` implementa use cases com traits e erros tipados
3. `@qa` valida cobertura de invariantes e resiliencia async

### AIOS Commands

```bash
@dev "Follow the rust preset patterns for this service"
@qa "Validate clippy discipline, error mapping, and integration boundaries"
```

---

## Checklist for New Features

```markdown
- [ ] Definir trait ports e command/response
- [ ] Implementar use case sem acoplamento de infra
- [ ] Criar adapter SQLx/HTTP separado
- [ ] Padronizar AppError e mapear para HTTP
- [ ] Cobrir casos felizes e falhas criticas
- [ ] Rodar fmt, clippy e testes
```

---

## Changelog

| Date       | Version | Changes |
| ---------- | ------- | ------- |
| 2026-02-19 | 1.0.0   | Initial Rust preset |

---

_AIOS Tech Preset - Synkra AIOS Framework_
