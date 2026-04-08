---
name: avalonia-viewmodels-zafiro
description: "Padrões de referência para criar ViewModels robustos, Wizards multi-step e navegação modular em aplicações Avalonia, usando o toolkit Zafiro e o frame"
  Optimal ViewModel and Wizard creation patterns for Avalonia using Zafiro and
  ReactiveUI. Covers reactive properties, enhanced commands, multi-step wizards,
  section-based navigation, and dependency injection via CompositionRoot.
risk: safe
source: self

version: 1.0.0
category: design
tags: [SKILL]
---

# Avalonia ViewModels com Zafiro & ReactiveUI

Padrões de referência para criar ViewModels robustos, Wizards multi-step e navegação modular em aplicações Avalonia, usando o toolkit **Zafiro** e o framework reativo **ReactiveUI**.

Pense no Zafiro como um "kit de ferramentas premium" em cima do Avalonia — ele resolve problemas recorrentes (comandos, wizards, navegação, DI) para que você foque na lógica de negócio, não na infraestrutura.

## When to Use This Skill

- Criando ViewModels reativos em aplicações Avalonia
- Implementando fluxos multi-step (wizards) com `SlimWizard` / `WizardBuilder`
- Configurando navegação por seções (`[Section]`, `INavigator`)
- Registrando dependências via `CompositionRoot` com Zafiro
- Usando `IEnhancedCommand` para comandos com metadados
- Mapeando ViewModels a Views com `DataTypeViewLocator`

## Do Not Use This Skill When

- O projeto usa **WPF** — padrões de MVVM são similares mas as APIs diferem
- O projeto usa **.NET MAUI** ou **Xamarin** — toolkit completamente diferente
- O framework de UI não é Avalonia (Blazor, WinUI, etc.)
- O projeto não usa Zafiro — se usa ReactiveUI puro sem Zafiro, os padrões de command e wizard não se aplicam
- Precisa apenas de estilização/temas Avalonia sem lógica de ViewModel

## Discovery Questions

Perguntas para fazer antes de executar. Use AskUserQuestion tool. Pule se o usuário já forneceu esse contexto.

1. **Qual versão do Avalonia o projeto usa atualmente?** — (Zafiro requer Avalonia 11+; versões anteriores têm APIs diferentes)
2. **O projeto já usa Zafiro e ReactiveUI ou está adotando agora?** — (se já usa, seguir os padrões existentes do CompositionRoot; se não, precisa configurar do zero)
3. **Qual o tipo de aplicação (desktop, mobile, kiosk)?** — (impacta decisões de navegação e lifecycle dos ViewModels)
4. **Precisa de wizard multi-step com validação entre etapas?** — (se sim, usar SlimWizard; se não, ViewModel direto basta)
5. **O estado é global (compartilhado entre seções) ou local (por tela)?** — (define se usar Singleton ou Transient no DI, e como estruturar o fluxo de dados)

## Prerequisites

| Dependência | NuGet Package | Versão Mínima |
|-------------|---------------|---------------|
| Avalonia | `Avalonia` | 11.0+ |
| ReactiveUI | `ReactiveUI` + `Avalonia.ReactiveUI` | 20.0+ |
| ReactiveUI Source Generators | `ReactiveUI.SourceGenerators` | 2.0+ |
| Zafiro Core | `Zafiro` | Latest |
| Zafiro Avalonia | `Zafiro.Avalonia` | Latest |

## Instructions

1. Verificar se o projeto já tem `CompositionRoot` configurado
2. Identificar o tipo de componente (ViewModel simples, Wizard, Section)
3. Aplicar o padrão correto da seção "Core Patterns" abaixo
4. Registrar no DI com o escopo adequado (Transient, Scoped, Singleton)
5. Mapear View ↔ ViewModel via `DataTypeViewLocator`
6. Testar o fluxo reativo (propriedades, comandos, navegação)

## Safety

- Sempre usar `CompositeDisposable` para gerenciar subscriptions — vazamento de memória é o bug mais comum em apps reativas
- Nunca criar comandos sem tratamento de erro (`HandleErrorsWith`)
- Testar navegação de wizard com back/forward antes de integrar

---

## Core Patterns

### 1. ViewModel Base — Reactive Properties

O alicerce de tudo. Use `ReactiveObject` como classe base e o atributo `[Reactive]` (do source generator) para propriedades.

```csharp
using ReactiveUI;
using ReactiveUI.SourceGenerators;

public partial class CustomerViewModel : ReactiveObject
{
    [Reactive] private string firstName;
    [Reactive] private string lastName;
    [Reactive] private bool isBusy;
}
```

O source generator cria automaticamente as propriedades públicas com `RaisePropertyChanged`. Sem boilerplate.

### 2. Reactive Observation & Computed Properties

Use `WhenAnyValue` para reagir a mudanças — é como um "sensor" que dispara sempre que o valor muda.

```csharp
public partial class CustomerViewModel : ReactiveObject
{
    [Reactive] private string firstName;
    [Reactive] private string lastName;

    // Computed property: reacts to FirstName and LastName changes
    [ObservableAsProperty] private string fullName;

    public CustomerViewModel()
    {
        this.WhenAnyValue(x => x.FirstName, x => x.LastName)
            .Select(tuple => $"{tuple.Item1} {tuple.Item2}".Trim())
            .ToPropertyEx(this, x => x.FullName);
    }
}
```

### 3. Enhanced Commands

Zafiro estende os comandos do ReactiveUI com `IEnhancedCommand`, adicionando metadados (`Name`, `Text`) e integração com notificações.

```csharp
using Zafiro.Commands;

public class OrderViewModel : ReactiveObject, IDisposable
{
    private readonly CompositeDisposable disposable = new();

    public IEnhancedCommand PlaceOrder { get; }
    public IEnhancedCommand Cancel { get; }

    public OrderViewModel(IUIServices uiServices)
    {
        var canPlace = this.WhenAnyValue(x => x.IsValid);

        PlaceOrder = ReactiveCommand
            .CreateFromTask(OnPlaceOrder, canPlace)
            .Enhance(text: "Place Order", name: "PlaceOrderCommand");

        Cancel = ReactiveCommand
            .Create(OnCancel)
            .Enhance(text: "Cancel", name: "CancelCommand");

        // Route errors to notification service
        PlaceOrder
            .HandleErrorsWith(uiServices.NotificationService, "Order Failed")
            .DisposeWith(disposable);
    }

    private async Task OnPlaceOrder()
    {
        // Business logic here
    }

    private void OnCancel()
    {
        // Cancel logic
    }

    public void Dispose() => disposable.Dispose();
}
```

### 4. Wizard Navigation com SlimWizard

Para fluxos multi-step, use `WizardBuilder` — cada step é um ViewModel, e a navegação é declarativa.

Pense no wizard como uma "linha de montagem": cada estação (step) faz uma coisa, valida, e passa o resultado para a próxima.

```csharp
using Zafiro.Avalonia.Wizard;

public class CreateProjectFlow
{
    public SlimWizard<ProjectResult> Build(ProjectData data)
    {
        return WizardBuilder
            .StartWith(() => new ProjectNameStepViewModel(data))
                .NextUnit()
                .WhenValid()
            .Then(prev => new ProjectConfigStepViewModel(prev))
                .NextCommand(vm => vm.ValidateCommand)
            .Then(config => new ProjectReviewStepViewModel(config))
                .Next((_, result) => result, "Create Project")
            .WithCompletionFinalStep();
    }
}
```

#### Regras de Navegação

| Método | Quando Avança | Uso Típico |
|--------|---------------|------------|
| `NextUnit()` | Quando um sinal simples é emitido | Steps informativos |
| `NextCommand(vm => vm.Cmd)` | Quando um comando específico executa com sucesso | Steps com ação explícita |
| `WhenValid()` | Quando a validação do ViewModel passa | Steps com formulários |
| `Always()` | Sempre permitido | Steps opcionais |

#### Finalizando o Wizard

| Método | Comportamento |
|--------|---------------|
| `WithCompletionFinalStep()` | Finaliza quando o último step completa |
| `WithCommitFinalStep()` | Executa uma ação final (salvar, deploy) antes de fechar |

#### Executando o Wizard

```csharp
public async Task StartProjectCreation(INavigator navigator)
{
    var wizard = new CreateProjectFlow().Build(initialData);
    var result = await wizard.Navigate(navigator);

    if (result is not null)
    {
        // Project created successfully
        await ProcessResult(result);
    }
}
```

> O `SlimWizard` gerencia o comando "Back" automaticamente — não precisa implementar navegação reversa manualmente.

### 5. Dependency Injection com CompositionRoot

O `CompositionRoot` é o ponto central de configuração — como a "caixa de fusíveis" da aplicação. Tudo se conecta aqui.

```csharp
public static class CompositionRoot
{
    public static IShellViewModel CreateMainViewModel(Control topLevelView)
    {
        var services = new ServiceCollection();

        services
            .AddViewModels()
            .AddUIServices(topLevelView)
            .AddNavigationServices();

        var serviceProvider = services.BuildServiceProvider();
        return serviceProvider.GetRequiredService<IShellViewModel>();
    }
}
```

#### Registrando ViewModels

Escolha o escopo correto:

```csharp
public static IServiceCollection AddViewModels(this IServiceCollection services)
{
    return services
        // Singleton: shared state across the entire app
        .AddSingleton<IShellViewModel, ShellViewModel>()
        // Transient: new instance every time (stateless or short-lived)
        .AddTransient<IHomeSectionViewModel, HomeSectionViewModel>()
        .AddTransient<ISettingsSectionViewModel, SettingsSectionViewModel>()
        // Scoped: one instance per navigation scope
        .AddScoped<IProjectViewModel, ProjectViewModel>();
}
```

| Escopo | Quando Usar | Exemplo |
|--------|-------------|---------|
| Singleton | Estado global, shell principal | `ShellViewModel` |
| Transient | Telas sem estado persistente | `DetailsViewModel` |
| Scoped | Estado por sessão/fluxo | `ProjectViewModel` |

### 6. Section-Based Navigation

Seções são módulos da UI (abas, itens de sidebar) registrados automaticamente via atributo `[Section]`.

```csharp
using Zafiro.Avalonia.Sections;

[Section("Wallet", icon: "fa-wallet")]
public class WalletSectionViewModel : ReactiveObject, IWalletSectionViewModel
{
    // Section implementation
}

[Section("Browse", icon: "fa-compass")]
public class BrowseSectionViewModel : ReactiveObject, IBrowseSectionViewModel
{
    // Section implementation
}
```

#### Registro Automático no CompositionRoot

```csharp
services.AddAnnotatedSections(logger);
services.AddSectionsFromAttributes(logger);
```

#### Navegação entre Seções

```csharp
// Switch to a section programmatically
shellViewModel.SetSection("Browse");

// Navigate within a section using INavigator
await navigator.Navigate(() => new ItemDetailViewModel(itemId));
```

> O parâmetro `icon` aceita ícones FontAwesome (ex.: `fa-home`, `fa-wallet`) quando configurado com `ProjektankerIconControlProvider`.

### 7. View-ViewModel Mapping

Zafiro usa `DataTypeViewLocator` para mapear automaticamente ViewModels às suas Views pelo tipo.

#### Configuração em App.axaml

```xml
<Application.DataTemplates>
    <DataTypeViewLocator />
    <DataTemplateInclude Source="avares://Zafiro.Avalonia/DataTemplates.axaml" />
</Application.DataTemplates>
```

Isso elimina a necessidade de registrar manualmente cada par View ↔ ViewModel. O locator resolve pela convenção de nomes ou registros explícitos do source generator.

---

## Anti-Patterns (Evitar)

| Anti-Pattern | Por Que É Ruim | Faça Isso |
|-------------|----------------|-----------|
| Propriedades sem `[Reactive]` com `RaisePropertyChanged` manual | Boilerplate desnecessário, propenso a erros | Use `[Reactive]` do source generator |
| Subscriptions sem `DisposeWith` | Vazamento de memória — a subscription vive para sempre | Sempre usar `CompositeDisposable` + `DisposeWith` |
| `ReactiveCommand` sem `HandleErrorsWith` | Exceções não tratadas crasham o app | Sempre rotear erros para `NotificationService` |
| Navegação de wizard com lógica manual de back/forward | Complexidade desnecessária, bugs sutis | Usar `SlimWizard` que gerencia back automaticamente |
| Registrar tudo como Singleton no DI | ViewModels acumulam estado stale | Use Transient para telas stateless |
| Criar Views no code-behind com `new ViewModel()` | Bypassa o DI, impossível testar | Resolver via `ServiceProvider` ou injeção de construtor |
| Usar `ICommand` do System.Windows.Input | Perde metadados e integração Zafiro | Use `IEnhancedCommand` |
| Ignorar `WhenValid()` em steps de wizard | Usuário avança com dados inválidos | Sempre validar antes de permitir navegação |

---

## Disposables — Regra de Ouro

Todo ViewModel que cria subscriptions ou comandos DEVE implementar `IDisposable` e usar `CompositeDisposable`:

```csharp
public class MyViewModel : ReactiveObject, IDisposable
{
    private readonly CompositeDisposable disposable = new();

    public MyViewModel(IUIServices uiServices)
    {
        // Subscription with automatic cleanup
        this.WhenAnyValue(x => x.Name)
            .Subscribe(name => Debug.WriteLine($"Name changed: {name}"))
            .DisposeWith(disposable);

        // Command error handling with cleanup
        SaveCommand
            .HandleErrorsWith(uiServices.NotificationService, "Save Failed")
            .DisposeWith(disposable);
    }

    public void Dispose() => disposable.Dispose();
}
```

---

## Guides (Referência Detalhada)

Para documentação aprofundada de cada tópico, consulte os guias complementares:

- [ViewModels & Commands](viewmodels.md) — Criação de ViewModels robustos e gerenciamento de comandos
- [Wizards & Flows](wizards.md) — Construção de wizards multi-step com `SlimWizard`
- [Navigation & Sections](navigation_sections.md) — Gerenciamento de navegação e UIs baseadas em seções
- [Composition & Mapping](composition.md) — Boas práticas de wiring View-ViewModel e DI

## Example Reference

Para implementações reais, consulte o projeto **Angor**:
- `CreateProjectFlowV2.cs` — Exemplo de wizard complexo com múltiplas etapas e validação
- `HomeViewModel.cs` — ViewModel de seção simples usando comandos functional-reactive
