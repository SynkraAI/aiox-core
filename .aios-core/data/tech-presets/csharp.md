# C# Tech Preset

> Preset de arquitetura para backend em C#/.NET com foco em clean architecture, confiabilidade e produtividade enterprise.

---

## Metadata

```yaml
preset:
  id: csharp
  name: 'C# ASP.NET Core Preset'
  version: 1.0.0
  description: 'Arquitetura para APIs em .NET 9+ com camadas claras, EF Core e testes automatizados'
  technologies:
    - C# 13
    - .NET 9
    - ASP.NET Core
    - Entity Framework Core
    - FluentValidation
    - xUnit
    - Testcontainers
  suitable_for:
    - 'APIs enterprise'
    - 'Sistemas internos corporativos'
    - 'Backends com integracao Microsoft stack'
  not_suitable_for:
    - 'Aplicacoes front-end puras'
    - 'Projetos scripts de baixa complexidade'
```

---

## Design Patterns (The Essential 5)

### Pattern 1: Contract Interface Pattern

**Purpose:** Definir contratos por contexto para reduzir acoplamento entre camadas.

**Execution Score:** 10/10 | **Anti-Bug Score:** 9/10

```csharp
// Application/Orders/Ports/IOrderRepository.cs
namespace App.Application.Orders.Ports;

public interface IOrderRepository
{
    Task SaveAsync(Order order, CancellationToken ct);
    Task<Order?> FindByIdAsync(Guid id, CancellationToken ct);
}
```

**Bugs Eliminated:**

- Dependencia direta do EF em use case
- Quebra em cascata ao trocar persistencia

**Why It Works:**

- Contrato estavel e mockavel
- Facilita testes isolados

---

### Pattern 2: Use Case Handler Pattern

**Purpose:** Isolar regra de negocio em handlers orientados a comando.

**Execution Score:** 10/10 | **Anti-Bug Score:** 9/10

```csharp
// Application/Orders/PlaceOrder/PlaceOrderHandler.cs
public sealed class PlaceOrderHandler
{
    private readonly IOrderRepository _repository;
    private readonly IPaymentGateway _payment;

    public PlaceOrderHandler(IOrderRepository repository, IPaymentGateway payment)
    {
        _repository = repository;
        _payment = payment;
    }

    public async Task<Guid> HandleAsync(PlaceOrderCommand command, CancellationToken ct)
    {
        var order = Order.Create(command.CustomerId, command.Items);
        await _payment.ChargeAsync(order.Id, order.Total, ct);
        await _repository.SaveAsync(order, ct);
        return order.Id;
    }
}
```

**Bugs Eliminated:**

- Logica em controller
- Fluxos sem ordem transacional clara

**Why It Works:**

- Fluxo unico por caso de uso
- Facil de observar, testar e evoluir

---

### Pattern 3: Repository Adapter Pattern

**Purpose:** Encapsular EF Core e mapeamentos fora da camada de aplicacao.

**Execution Score:** 9/10 | **Anti-Bug Score:** 9/10

```csharp
// Infrastructure/Persistence/EfOrderRepository.cs
public sealed class EfOrderRepository : IOrderRepository
{
    private readonly AppDbContext _db;

    public EfOrderRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task SaveAsync(Order order, CancellationToken ct)
    {
        _db.Orders.Add(OrderEntity.FromDomain(order));
        await _db.SaveChangesAsync(ct);
    }

    public async Task<Order?> FindByIdAsync(Guid id, CancellationToken ct)
    {
        var entity = await _db.Orders.FindAsync([id], ct);
        return entity?.ToDomain();
    }
}
```

**Bugs Eliminated:**

- ORM vazando para dominio
- Regras de persistencia espalhadas

**Why It Works:**

- Infra fica concentrada
- Permite testes de integracao dedicados

---

### Pattern 4: Domain Event + Outbox Pattern

**Purpose:** Garantir consistencia entre transacao local e integracoes externas.

**Execution Score:** 8/10 | **Anti-Bug Score:** 9/10

```csharp
public sealed record OrderPlacedEvent(Guid OrderId, Guid CustomerId);
```

```csharp
public interface IOutboxWriter
{
    Task EnqueueAsync<TEvent>(TEvent @event, CancellationToken ct);
}
```

**Bugs Eliminated:**

- Eventos perdidos apos commit
- Integracoes inconsistentes

**Why It Works:**

- Publicacao resiliente via outbox
- Separacao entre transacao de negocio e entrega de evento

---

### Pattern 5: Test Builder Pattern

**Purpose:** Reduzir ruido em testes unitarios e de integracao.

**Execution Score:** 8/10 | **Anti-Bug Score:** 8/10

```csharp
public sealed class PlaceOrderCommandBuilder
{
    private Guid _customerId = Guid.NewGuid();
    private List<ItemInput> _items = [new("SKU-1", 1)];

    public PlaceOrderCommand Build() => new(_customerId, _items);
}
```

**Bugs Eliminated:**

- Setup repetitivo e propenso a erro
- Testes menos legiveis

**Why It Works:**

- Setup centralizado
- Cenarios com intencao explicita

---

## Project Structure

```text
/src
  /App.Api                    # ASP.NET endpoints
  /App.Application            # Use cases, contracts, validators
  /App.Domain                 # Entidades, value objects, regras
  /App.Infrastructure         # EF Core, gateways, mensageria
/tests
  /App.UnitTests
  /App.IntegrationTests
  /App.E2ETests
```

### Structure Rationale

- **Domain isolated:** Sem dependencia de frameworks
- **Application orchestrates:** Casos de uso e contratos
- **Infrastructure plugged-in:** Detalhes tecnicos substituiveis

---

## Tech Stack

| Category | Technology | Version | Purpose |
| -------- | ---------- | ------- | ------- |
| Runtime | .NET | 9+ | Plataforma principal |
| Language | C# | 13 | Linguagem base |
| API | ASP.NET Core | 9+ | Endpoints HTTP |
| Persistence | EF Core | 9+ | ORM e migrations |
| Validation | FluentValidation | latest | Validacao de comandos |
| Mapping | Mapster | latest | Mapping controlado |
| Unit Test | xUnit | latest | Testes unitarios |
| Assertion | FluentAssertions | latest | Assertivas legiveis |
| Integration | Testcontainers | latest | Infra real em testes |

### Required Dependencies

```bash
dotnet add src/App.Api package Microsoft.AspNetCore.OpenApi
dotnet add src/App.Application package FluentValidation
dotnet add src/App.Infrastructure package Microsoft.EntityFrameworkCore
dotnet add src/App.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL

dotnet add tests/App.UnitTests package xunit
dotnet add tests/App.UnitTests package FluentAssertions
dotnet add tests/App.IntegrationTests package DotNet.Testcontainers
```

---

## Coding Standards

### Naming Conventions

| Element | Convention | Example |
| ------- | ---------- | ------- |
| Projects | `App.<Layer>` | `App.Application` |
| Classes | PascalCase | `PlaceOrderHandler` |
| Interfaces | Prefix `I` | `IOrderRepository` |
| Methods | PascalCase + Async | `HandleAsync` |
| Files | Match class name | `PlaceOrderHandler.cs` |
| Constants | UPPER_SNAKE_CASE | `MAX_BATCH_SIZE` |

### Critical Rules

1. **CancellationToken Mandatory:** Todo IO async recebe `CancellationToken`.
2. **No Business Logic in Controllers:** Apenas parse e delegacao.
3. **One DbContext per bounded context:** Evitar mega-context.
4. **Validation Before Use Case:** Rejeitar input invalido cedo.
5. **Exception Mapping:** Erros de dominio mapeados para HTTP padrao.

### .NET Quality Baseline

```bash
dotnet format
dotnet build
dotnet test
```

---

## Testing Strategy

### Test Pyramid

```text
         /\
        /E2E\           10% - Fluxos HTTP completos
       /------\
      /Integration\     30% - EF, migrations, adapters
     /------------\
    /  Unit Tests  \    60% - Dominio e handlers
   /----------------\
```

### What to Test

#### Always Test (Critical)

- [ ] Regras de dominio
- [ ] Handlers de comando e query
- [ ] Validadores de entrada

#### Consider Testing

- [ ] Policies/autorizacao
- [ ] Serializacao de contratos externos

#### Never Test

- [ ] Framework internals
- [ ] Getters/setters sem regra

### Coverage Goals

```text
- Domain/Application: 90%+
- Infrastructure: 70%+
- Overall: 75%+
```

### Test Template

```csharp
public class PlaceOrderHandlerTests
{
    [Fact]
    public async Task Should_Place_Order_When_Command_Is_Valid()
    {
        var repo = Substitute.For<IOrderRepository>();
        var pay = Substitute.For<IPaymentGateway>();
        var sut = new PlaceOrderHandler(repo, pay);

        var command = new PlaceOrderCommandBuilder().Build();

        var id = await sut.HandleAsync(command, CancellationToken.None);

        id.Should().NotBe(Guid.Empty);
        await repo.Received().SaveAsync(Arg.Any<Order>(), Arg.Any<CancellationToken>());
    }
}
```

---

## Token Economy Strategies

### Strategy 1: Command + Handler Focus

Prompts devem referenciar `Command`, `Handler`, `Validator` da feature alvo.

### Strategy 2: Reuse Existing Layer Skeleton

Copiar pasta de uma feature de referencia reduz contexto de geracao.

### Strategy 3: Infrastructure as Secondary Step

Primeiro dominio/aplicacao, depois adapter EF/HTTP.

---

## Bug Prevention Stack

| Layer | Catches | Implementation |
| ----- | ------- | -------------- |
| Compiler + nullable refs | 35% | NRT habilitado |
| Validation + handlers | 35% | FluentValidation + use case boundaries |
| Integration tests | 25% | EF + Testcontainers |
| E2E smoke | 5% | Endpoints criticos |

---

## Patterns to AVOID

### Fat Service with Mixed Responsibilities

Classe unica para validacao, regra, persistencia e integracao externa.

### Static Service Locator

Resolver dependencias manualmente em runtime sem DI container.

### Async Without CancellationToken

Chamadas longas sem cancelamento causam travas e leaks.

---

## File Templates

### Contract Template

```csharp
public interface IEmailGateway
{
    Task SendAsync(EmailMessage message, CancellationToken ct);
}
```

### Handler Template

```csharp
public sealed class UseCaseHandler
{
    public async Task<Result> HandleAsync(Command command, CancellationToken ct)
    {
        return await Task.FromResult(Result.Success());
    }
}
```

### Endpoint Template

```csharp
app.MapPost("/orders", async (PlaceOrderRequest request, PlaceOrderHandler handler, CancellationToken ct) =>
{
    var result = await handler.HandleAsync(request.ToCommand(), ct);
    return Results.Accepted($"/orders/{result.Id}");
});
```

---

## Integration with AIOS

### Recommended Workflow

1. `@architect` define fronteiras por camada usando preset `csharp`
2. `@dev` implementa handlers e adapters por feature
3. `@qa` valida integridade async e cobertura de regras de negocio

### AIOS Commands

```bash
@dev "Follow the csharp preset patterns for this service"
@qa "Validate async boundaries, validation, and persistence behavior"
```

---

## Checklist for New Features

```markdown
- [ ] Definir command/query e contracts
- [ ] Implementar handler com CancellationToken
- [ ] Criar validator para entrada
- [ ] Implementar adapter EF Core com migration
- [ ] Cobrir testes unitarios e de integracao
- [ ] Mapear erros para respostas HTTP consistentes
```

---

## Changelog

| Date       | Version | Changes |
| ---------- | ------- | ------- |
| 2026-02-19 | 1.0.0   | Initial C# preset |

---

_AIOS Tech Preset - Synkra AIOS Framework_
