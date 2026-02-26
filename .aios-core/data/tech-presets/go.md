# Go Tech Preset

> Preset de arquitetura para servicos backend em Go com foco em simplicidade, observabilidade e seguranca operacional.

---

## Metadata

```yaml
preset:
  id: go
  name: 'Go Service Preset'
  version: 1.0.0
  description: 'Arquitetura para APIs e workers em Go 1.24+ com boundaries claros e alta testabilidade'
  technologies:
    - Go 1.24+
    - Chi ou Gin
    - sqlc ou pgx
    - Testify
    - Testcontainers
  suitable_for:
    - 'APIs REST de alta performance'
    - 'Microsservicos'
    - 'Workers concorrentes'
    - 'Servicos de integracao'
  not_suitable_for:
    - 'Aplicacoes front-end'
    - 'Apps mobile'
    - 'Sistemas com dependencia pesada em reflexao/dinamismo'
```

---

## Design Patterns (The Essential 5)

### Pattern 1: Port Interface Pattern

**Purpose:** Definir contratos explicitos para integrar casos de uso com infraestrutura.

**Execution Score:** 10/10 | **Anti-Bug Score:** 9/10

```go
// internal/orders/ports.go
package orders

import "context"

type Repository interface {
	Save(ctx context.Context, order Order) error
	FindByID(ctx context.Context, id string) (Order, error)
}

type PaymentGateway interface {
	Charge(ctx context.Context, input ChargeInput) (ChargeResult, error)
}
```

**Bugs Eliminated:**

- Acoplamento direto entre HTTP handler e banco
- Mudanca de provider quebrando toda a feature
- Contratos implicitos sem validacao

**Why It Works:**

- Interfaces pequenas forcam fronteiras limpas
- Mocks ficam triviais em testes

---

### Pattern 2: Application Service Pattern

**Purpose:** Centralizar regras de negocio em use cases sem dependencia de transporte.

**Execution Score:** 10/10 | **Anti-Bug Score:** 9/10

```go
// internal/orders/service.go
package orders

import "context"

type Service struct {
	repo Repository
	pay  PaymentGateway
}

func NewService(repo Repository, pay PaymentGateway) *Service {
	return &Service{repo: repo, pay: pay}
}

func (s *Service) PlaceOrder(ctx context.Context, cmd PlaceOrderCommand) (Order, error) {
	order, err := NewOrder(cmd.CustomerID, cmd.Items)
	if err != nil {
		return Order{}, err
	}

	if _, err := s.pay.Charge(ctx, ChargeInput{OrderID: order.ID(), Amount: order.Total()}); err != nil {
		return Order{}, err
	}

	if err := s.repo.Save(ctx, order); err != nil {
		return Order{}, err
	}

	return order, nil
}
```

**Bugs Eliminated:**

- Regra duplicada em handlers
- Side effects nao coordenados
- Fluxos parcialmente persistidos

**Why It Works:**

- Ordem de execucao fica explicita
- Regras sao testaveis sem HTTP/DB

---

### Pattern 3: Repository Pattern

**Purpose:** Isolar SQL e mapeamento de dados da regra de dominio.

**Execution Score:** 9/10 | **Anti-Bug Score:** 9/10

```go
// internal/orders/repository/postgres.go
package repository

import (
	"context"
	"database/sql"

	"myapp/internal/orders"
)

type PostgresRepository struct {
	db *sql.DB
}

func (r *PostgresRepository) Save(ctx context.Context, order orders.Order) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO orders (id, customer_id, total_cents) VALUES ($1, $2, $3)`,
		order.ID(), order.CustomerID(), order.Total().Cents(),
	)
	return err
}
```

**Bugs Eliminated:**

- SQL espalhado em varios pontos
- Inconsistencia de acesso a dados
- Dificuldade para trocar driver/ORM

**Why It Works:**

- Infra fica encapsulada
- Padrao previsivel para testes de integracao

---

### Pattern 4: Worker + Channel Pattern

**Purpose:** Coordenar concorrencia sem race conditions e sem goroutines vazando.

**Execution Score:** 9/10 | **Anti-Bug Score:** 8/10

```go
// internal/workers/dispatcher.go
package workers

import "context"

type Job struct {
	ID string
}

func Run(ctx context.Context, jobs <-chan Job, handler func(context.Context, Job) error) {
	for {
		select {
		case <-ctx.Done():
			return
		case job, ok := <-jobs:
			if !ok {
				return
			}
			_ = handler(ctx, job)
		}
	}
}
```

**Bugs Eliminated:**

- Goroutine leak em shutdown
- Deadlocks por canais sem fechamento
- Travamento por falta de cancelamento

**Why It Works:**

- `context.Context` padroniza cancelamento
- Fluxo concorrente fica deterministico

---

### Pattern 5: Builder Pattern (Tests Only)

**Purpose:** Criar fixtures de teste legiveis para reduzir setup repetitivo.

**Execution Score:** 8/10 | **Anti-Bug Score:** 8/10

```go
// internal/orders/testbuilder/order_builder.go
package testbuilder

import "myapp/internal/orders"

type OrderBuilder struct {
	customerID string
	items      []orders.Item
}

func NewOrderBuilder() *OrderBuilder {
	return &OrderBuilder{customerID: "cust-1", items: []orders.Item{{SKU: "SKU-1", Qty: 1}}}
}

func (b *OrderBuilder) Build() orders.PlaceOrderCommand {
	return orders.PlaceOrderCommand{CustomerID: b.customerID, Items: b.items}
}
```

**Bugs Eliminated:**

- Fixtures inconsistentes entre testes
- Testes fragilizados por setup manual

**Why It Works:**

- Cenarios de teste ficam expressivos
- Facilita evolucao de campos obrigatorios

---

## Project Structure

```text
/cmd
  /api                    # Entrypoint HTTP
  /worker                 # Entrypoint de processamento
/internal
  /orders
    /domain               # Entidades e regras puras
    /app                  # Use cases / services
    /ports                # Interfaces de entrada/saida
    /infra                # Implementacoes concretas
    /http                 # Handlers, DTOs, middlewares
/pkg
  /observability          # Logger, metrics, tracing
/tests
  /integration            # Testes de DB, filas e APIs
  /e2e                    # Fluxos criticos
```

### Structure Rationale

- **/cmd:** Isola bootstrapping por processo
- **/internal:** Evita import acidental externo
- **/pkg:** Compartilha utilitarios estaveis

---

## Tech Stack

| Category | Technology | Version | Purpose |
| -------- | ---------- | ------- | ------- |
| Language | Go | 1.24+ | Runtime principal |
| HTTP | Chi | ^5 | Routing simples e rapido |
| Database | pgx/sqlc | latest | SQL typed e performatico |
| Validation | go-playground/validator | ^10 | Validacao estruturada |
| Logging | zap | ^1 | Logs estruturados |
| Config | koanf | ^2 | Config por env/file |
| Unit Test | testify | ^1 | Assertions e mocks |
| Integration Test | testcontainers-go | ^0.34 | Ambientes reais de teste |

### Required Dependencies

```bash
go get github.com/go-chi/chi/v5
go get github.com/jackc/pgx/v5
go get github.com/stretchr/testify
go get go.uber.org/zap
go get github.com/knadh/koanf/v2
go get github.com/go-playground/validator/v10

go get -t github.com/testcontainers/testcontainers-go
```

---

## Coding Standards

### Naming Conventions

| Element | Convention | Example |
| ------- | ---------- | ------- |
| Packages | lowercase | `orders` |
| Files | snake_case.go | `place_order_service.go` |
| Interfaces | Noun or -er | `Repository`, `Clock` |
| Structs | PascalCase | `OrderService` |
| Functions | PascalCase export, camelCase private | `NewService`, `parseInput` |
| Errors | `ErrX` vars | `ErrOrderNotFound` |

### Critical Rules

1. **Context First:** Toda funcao IO-bound recebe `context.Context` como primeiro parametro.
2. **Small Interfaces:** Interfaces com no maximo 3-5 metodos.
3. **Error Wrapping:** Sempre retornar erros com contexto (`fmt.Errorf("...: %w", err)`).
4. **No Global Mutable State:** Dependencias injetadas por construtor.
5. **Graceful Shutdown:** Servicos e workers devem respeitar cancelamento.

### Go Toolchain Baseline

```bash
gofmt ./...
go vet ./...
go test ./...
```

---

## Testing Strategy

### Test Pyramid

```text
         /\
        /E2E\           10% - Fluxos ponta a ponta criticos
       /------\
      /Integration\     30% - DB, mensageria, adapters
     /------------\
    /  Unit Tests  \    60% - Dominio e use cases
   /----------------\
```

### What to Test

#### Always Test (Critical)

- [ ] Regras de dominio
- [ ] Validacoes de entrada
- [ ] Fluxos com erro de infraestrutura

#### Consider Testing

- [ ] Handlers HTTP com httptest
- [ ] Timeouts e cancelamento

#### Never Test

- [ ] Biblioteca third-party interna
- [ ] Código trivial de mapeamento sem regra

### Coverage Goals

```text
- Domain/use cases: 90%+
- Handlers/adapters: 70%+
- Overall: 75%+
```

### Test Template

```go
func TestPlaceOrder_Success(t *testing.T) {
	t.Parallel()

	repo := new(mocks.Repository)
	pay := new(mocks.PaymentGateway)
	svc := orders.NewService(repo, pay)

	cmd := testbuilder.NewOrderBuilder().Build()
	pay.On("Charge", mock.Anything, mock.Anything).Return(orders.ChargeResult{Approved: true}, nil)
	repo.On("Save", mock.Anything, mock.Anything).Return(nil)

	_, err := svc.PlaceOrder(context.Background(), cmd)
	require.NoError(t, err)
}
```

---

## Token Economy Strategies

### Strategy 1: Reference by Package

Use prompts como: `Siga o padrao de internal/orders/app/place_order.go`.

### Strategy 2: Tests as Spec

Defina primeiro os testes de use case e mande implementar ate passarem.

### Strategy 3: Reuse DTO Contracts

Passe exemplos reais de request/response ao inves de prosa longa.

---

## Bug Prevention Stack

| Layer | Catches | Implementation |
| ----- | ------- | -------------- |
| Compiler + Vet | 45% | `go build`, `go vet` |
| Domain Validation | 30% | Construtores e invariantes |
| Integration Tests | 20% | DB real com testcontainers |
| E2E Smoke | 5% | Fluxos criticos |

---

## Patterns to AVOID

### God Handler

Misturar parse, regra e persistencia no mesmo handler.

### Shared Mutable Globals

Mapas globais sem lock ou dependency injection.

### Unbounded Goroutines

Spawns sem controle de lifecycle ou cancelamento.

---

## File Templates

### Port Template

```go
package payments

import "context"

type Gateway interface {
	Charge(ctx context.Context, input ChargeInput) (ChargeResult, error)
}
```

### Service Template

```go
package orders

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service { return &Service{repo: repo} }
```

### Handler Template

```go
func (h *Handler) PlaceOrder(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_ = ctx
	// parse input, call service, map output
}
```

---

## Integration with AIOS

### Recommended Workflow

1. `@architect *create-doc architecture` com referencia ao preset `go`
2. `@dev` implementa features por pacote (`domain/app/infra/http`)
3. `@qa` valida regras de dominio e testes de integracao

### AIOS Commands

```bash
@dev "Follow the go preset patterns for this service"
@qa "Validate coverage and integration boundaries using go preset"
```

---

## Checklist for New Features

```markdown
- [ ] Definir portas (interfaces) antes de adapters
- [ ] Criar use case independente de transporte
- [ ] Implementar repository com testes de integracao
- [ ] Garantir contexto e cancelamento
- [ ] Cobrir cenarios felizes e erros principais
- [ ] Registrar logs estruturados com correlation id
```

---

## Changelog

| Date       | Version | Changes |
| ---------- | ------- | ------- |
| 2026-02-19 | 1.0.0   | Initial Go preset |

---

_AIOS Tech Preset - Synkra AIOS Framework_
