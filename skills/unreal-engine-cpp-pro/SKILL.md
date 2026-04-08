---
name: unreal-engine-cpp-pro
description: "C++ no Unreal não é C++ convencional — é C++ com superpoderes (e responsabilidades) extras."
  Guia especializado para desenvolvimento C++ em Unreal Engine 5.x.
  UObject hygiene, performance patterns, Gameplay Ability System,
  networking, debugging e convenções da Epic Games.
version: "2.0.0"
categories: [game-development, cpp, unreal-engine]
allowed-tools: Read, Glob, Grep, Bash, Edit, Write

category: design
tags: [SKILL]
---

# Unreal Engine C++ Pro

> C++ no Unreal não é C++ convencional — é C++ com superpoderes (e responsabilidades) extras.

**Analogia:** O Unreal Engine é como um carro de Fórmula 1. Você tem potência absurda, mas se não souber usar o câmbio, a telemetria e as regras da pista, vai bater na primeira curva. Este guia é o manual do piloto.

## Quando Usar

- Desenvolvimento de código C++ para projetos Unreal Engine 5.x
- Criação de Actors, Components, ou classes derivadas de UObject
- Otimização de código crítico de performance
- Debug de memory leaks ou problemas de garbage collection
- Implementação de funcionalidades expostas a Blueprints
- Uso do sistema de reflexão (UCLASS, USTRUCT, UFUNCTION)
- Gerenciamento de asset loading e soft references
- Implementação de Gameplay Ability System (GAS)
- Networking e replicação de estado

## Quando NÃO Usar

- Projetos Blueprint-only (sem C++)
- Unreal Engine versões anteriores a 5.x
- Outros game engines (Unity, Godot)
- Tarefas não relacionadas a Unreal Engine

## Discovery Questions

Perguntas antes de executar. Usar AskUserQuestion tool. Pular se o contexto já foi fornecido.

1. **Qual versão do Unreal Engine 5.x está usando?** — (APIs e deprecated features variam entre 5.1, 5.3, 5.5)
2. **O que está implementando (Actor, Component, GameMode, Subsystem)?** — (cada tipo tem padrões e lifecycle hooks diferentes)
3. **O código precisa ser exposto a Blueprints?** — (define uso de UFUNCTION, UPROPERTY specifiers e nível de exposição)
4. **É código de gameplay ou sistema de engine/ferramentas?** — (impacta decisões de Tick vs Timer, GC patterns e performance constraints) (opcional)
5. **O projeto usa networking/multiplayer?** — (define se precisa de replicação, RPCs e ownership) (opcional)

---

## 1. Princípios Fundamentais

### UObject & Garbage Collection

O GC do Unreal é como um zelador do prédio — ele limpa tudo que não está sendo usado. Mas se você não marcar suas coisas com `UPROPERTY()`, ele vai jogar fora achando que é lixo.

| Regra | Detalhe | Consequência de ignorar |
|-------|---------|------------------------|
| **UPROPERTY() em UObject*** | Toda variável membro UObject* deve ter UPROPERTY() | GC coleta o objeto → crash |
| **IsValid() vs nullptr** | `IsValid()` checa pending kill + nullptr | Acesso a objeto marcado para destruição → crash |
| **TStrongObjectPtr** | Para referências fora do grafo UObject | Objeto coletado prematuramente |
| **AddToRoot()** | Para singletons que devem sobreviver ao GC | Use com parcimônia, lembre de RemoveFromRoot() |
| **TWeakObjectPtr** | Para referências que não devem prevenir GC | Acesso sem checagem → crash |

```cpp
// CORRETO: GC rastreia a referência
UPROPERTY()
UHealthComponent* HealthComp;

// ERRADO: GC não sabe que você está usando isso
UHealthComponent* HealthComp; // → Vai ser coletado

// CORRETO: Checagem segura
if (IsValid(HealthComp)) {
    HealthComp->TakeDamage(10.f);
}

// ERRADO: Pode ser pending kill
if (HealthComp != nullptr) { // → Não checa pending kill
    HealthComp->TakeDamage(10.f);
}
```

### Sistema de Reflexão

| Macro | Uso | Exemplo |
|-------|-----|---------|
| `UCLASS()` | Classes derivadas de UObject | `UCLASS(BlueprintType)` |
| `USTRUCT()` | Structs expostas ao reflection | `USTRUCT(BlueprintType)` |
| `UENUM()` | Enums expostos ao reflection | `UENUM(BlueprintType)` |
| `UFUNCTION()` | Funções expostas | `UFUNCTION(BlueprintCallable)` |
| `UPROPERTY()` | Propriedades rastreadas pelo GC/expostas | `UPROPERTY(EditAnywhere)` |

### UPROPERTY Specifiers (mais usados)

| Specifier | Quando usar |
|-----------|-------------|
| `EditAnywhere` | Editável no editor e em instâncias |
| `EditDefaultsOnly` | Editável apenas no Class Default Object |
| `VisibleAnywhere` | Visível mas não editável |
| `BlueprintReadOnly` | Legível em BP, não escrevível (preferir para estado) |
| `BlueprintReadWrite` | Legível e escrevível em BP (usar com cautela) |
| `Transient` | Não serializado (calculado em runtime) |
| `Replicated` | Replicado para clientes em multiplayer |
| `ReplicatedUsing=OnRep_X` | Replicado com callback |

### UFUNCTION Specifiers (mais usados)

| Specifier | Quando usar |
|-----------|-------------|
| `BlueprintCallable` | Chamável de Blueprints |
| `BlueprintPure` | Sem side effects, sem exec pin |
| `BlueprintNativeEvent` | Implementação C++ com override em BP |
| `BlueprintImplementableEvent` | Implementação apenas em BP |
| `Server` | RPC executado no servidor |
| `Client` | RPC executado no client owner |
| `NetMulticast` | RPC executado em todos |
| `Reliable` | Garantia de entrega (usar com parcimônia) |

---

## 2. Convenções de Nomenclatura (Obrigatório)

Seguir o padrão da Epic Games — não inventar:

| Prefixo | Tipo | Exemplo |
|---------|------|---------|
| `T` | Templates | `TArray`, `TMap`, `TSharedPtr` |
| `U` | UObject (não-Actor) | `UCharacterMovementComponent` |
| `A` | Actor | `AMyGameMode`, `AProjectile` |
| `S` | Slate Widget | `SHealthBar` |
| `F` | Structs e tipos não-UObject | `FVector`, `FHitResult` |
| `E` | Enums | `EWeaponState`, `ETeamID` |
| `I` | Interfaces | `IInteractable`, `IDamageable` |
| `b` | Booleans | `bIsDead`, `bCanJump` |

### Convenções adicionais

```cpp
// Funções: PascalCase, verbos de ação
void FireWeapon();
bool CanInteract() const;
float GetHealthPercent() const;

// Delegates: prefixo On ou F
FOnHealthChanged OnHealthChanged;
FOnPlayerDied OnPlayerDied;

// Getters/Setters: Get/Set explícito
float GetCurrentHealth() const { return CurrentHealth; }
void SetMaxHealth(float NewMax);

// Constants: prefixo k ou UPCASE com underscores
static constexpr float kDefaultHealth = 100.f;
```

---

## 3. Performance Patterns

### Tick: o vilão silencioso

Tick é como deixar uma torneira pingando 60 vezes por segundo. Parece pouco, mas com 100 actors, são 6000 chamadas por segundo.

| Abordagem | Quando | Performance |
|-----------|--------|-------------|
| `Tick` desabilitado | Default para TUDO | Melhor |
| `FTimerHandle` | Lógica periódica (check every 0.5s) | Bom |
| Event-driven (delegates) | Reação a mudanças de estado | Melhor |
| `Tick` habilitado | Physics-dependent, interpolação frame-by-frame | Necessário |

```cpp
// CORRETO: Desabilitar Tick por padrão
AMyActor::AMyActor() {
    PrimaryActorTick.bCanEverTick = false;
}

// CORRETO: Usar Timer para lógica periódica
void AMyActor::BeginPlay() {
    Super::BeginPlay();
    GetWorldTimerManager().SetTimer(
        CheckTimerHandle,
        this,
        &AMyActor::CheckCondition,
        0.5f,  // Every 500ms
        true   // Looping
    );
}

// CORRETO: Usar Delegates para eventos
// No header:
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnHealthChanged, float, NewHealth);

UPROPERTY(BlueprintAssignable)
FOnHealthChanged OnHealthChanged;

// Na implementação:
void UHealthComponent::SetHealth(float NewHealth) {
    CurrentHealth = FMath::Clamp(NewHealth, 0.f, MaxHealth);
    OnHealthChanged.Broadcast(CurrentHealth);
}
```

### Casting: cache é rei

```cpp
// ERRADO: Cast toda vez no Tick
void AMyActor::Tick(float DeltaTime) {
    auto* PC = Cast<AMyPlayerController>(GetController()); // Every frame!
    if (PC) PC->DoSomething();
}

// CORRETO: Cache no BeginPlay
void AMyActor::BeginPlay() {
    Super::BeginPlay();
    CachedController = Cast<AMyPlayerController>(GetController());
}
```

### Structs vs Classes

```cpp
// Use USTRUCT para dados puros (sem lifecycle, sem GC overhead)
USTRUCT(BlueprintType)
struct FWeaponData {
    GENERATED_BODY()

    UPROPERTY(EditAnywhere)
    float Damage = 10.f;

    UPROPERTY(EditAnywhere)
    float FireRate = 0.5f;

    UPROPERTY(EditAnywhere)
    TSoftObjectPtr<UStaticMesh> MeshAsset;
};

// Use UCLASS para objetos que precisam de GC, networking, ou lifecycle
```

### Object Pooling

```cpp
// Para projectiles, particles, etc. que são criados/destruídos frequentemente
UPROPERTY()
TArray<AProjectile*> ProjectilePool;

AProjectile* AWeapon::GetPooledProjectile() {
    for (AProjectile* Proj : ProjectilePool) {
        if (!Proj->IsActive()) {
            Proj->Activate();
            return Proj;
        }
    }
    // Pool exausto — expandir ou retornar nullptr
    return SpawnNewProjectile();
}
```

---

## 4. Patterns Comuns

### Component Lookup Robusto

```cpp
void AMyCharacter::PostInitializeComponents() {
    Super::PostInitializeComponents();
    HealthComp = FindComponentByClass<UHealthComponent>();
    check(HealthComp); // Crash em dev se ausente — melhor que crash em runtime

    AbilityComp = FindComponentByClass<UAbilitySystemComponent>();
    ensureMsgf(AbilityComp, TEXT("AbilityComp missing on %s"), *GetName());
}
```

### Interface Implementation

```cpp
// Declaração da Interface
UINTERFACE(MinimalAPI)
class UInteractable : public UInterface {
    GENERATED_BODY()
};

class IInteractable {
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintNativeEvent, BlueprintCallable)
    void OnInteract(AActor* Interactor);

    UFUNCTION(BlueprintNativeEvent, BlueprintCallable)
    bool CanInteract(AActor* Interactor) const;
};

// Uso: chamada segura via interface
if (TargetActor->Implements<UInteractable>()) {
    IInteractable::Execute_OnInteract(TargetActor, this);
}
```

### Async Loading (Soft References)

```cpp
// Hard reference: força carregamento do asset na inicialização
UPROPERTY(EditDefaultsOnly)
TSubclassOf<AWeapon> WeaponClass; // Carrega o asset inteiro na memória

// Soft reference: carrega sob demanda
UPROPERTY(EditAnywhere, BlueprintReadWrite)
TSoftClassPtr<AWeapon> WeaponClassToLoad;

void AMyCharacter::Equip() {
    if (WeaponClassToLoad.IsPending()) {
        // Síncrono (bloqueia thread — usar apenas se necessário)
        WeaponClassToLoad.LoadSynchronous();
    }

    // Assíncrono (preferido para assets grandes)
    FStreamableManager& StreamableManager = UAssetManager::GetStreamableManager();
    StreamableManager.RequestAsyncLoad(
        WeaponClassToLoad.ToSoftObjectPath(),
        FStreamableDelegate::CreateUObject(this, &AMyCharacter::OnWeaponLoaded)
    );
}

void AMyCharacter::OnWeaponLoaded() {
    if (UClass* LoadedClass = WeaponClassToLoad.Get()) {
        GetWorld()->SpawnActor<AWeapon>(LoadedClass, GetActorTransform());
    }
}
```

### Subsystems

```cpp
// Game Instance Subsystem — persiste durante toda a sessão
UCLASS()
class UInventorySubsystem : public UGameInstanceSubsystem {
    GENERATED_BODY()
public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    UFUNCTION(BlueprintCallable)
    void AddItem(const FItemData& Item);

private:
    UPROPERTY()
    TArray<FItemData> PlayerInventory;
};

// Acesso de qualquer lugar:
UInventorySubsystem* InvSys = GetGameInstance()->GetSubsystem<UInventorySubsystem>();
```

---

## 5. Gameplay Ability System (GAS)

### Componentes Principais

| Componente | Papel | Analogia |
|------------|-------|----------|
| `UAbilitySystemComponent` | Gerenciador central | O "cérebro" que coordena tudo |
| `UGameplayAbility` | Uma habilidade específica | Uma "carta" que pode ser jogada |
| `UGameplayEffect` | Modificação de atributos | Um "buff/debuff" aplicado |
| `FGameplayAttributeSet` | Conjunto de atributos | A "ficha" do personagem (HP, MP, etc.) |
| `FGameplayTag` | Rótulo hierárquico | Uma "etiqueta" para categorizar |

### Setup Básico

```cpp
// AttributeSet
UCLASS()
class UMyAttributeSet : public UAttributeSet {
    GENERATED_BODY()
public:
    UPROPERTY(BlueprintReadOnly, ReplicatedUsing=OnRep_Health)
    FGameplayAttributeData Health;
    ATTRIBUTE_ACCESSORS(UMyAttributeSet, Health)

    UPROPERTY(BlueprintReadOnly, ReplicatedUsing=OnRep_MaxHealth)
    FGameplayAttributeData MaxHealth;
    ATTRIBUTE_ACCESSORS(UMyAttributeSet, MaxHealth)

    virtual void PreAttributeChange(const FGameplayAttribute& Attribute, float& NewValue) override;
    virtual void PostGameplayEffectExecute(const FGameplayEffectModCallbackData& Data) override;
};
```

---

## 6. Networking & Replicação

### Regras de Ouro

| Regra | Detalhe |
|-------|---------|
| Servidor é autoridade | Toda lógica de gameplay crítica roda no server |
| Replique estado, não ações | Replique `Health` (estado), não `TakeDamage()` (ação) |
| RPCs são caros | Minimize RPCs, prefira replicação de properties |
| `COND_OwnerOnly` | Dados sensíveis (inventário) só para o dono |

```cpp
// Replicação de propriedade
UPROPERTY(ReplicatedUsing=OnRep_Health)
float Health;

UFUNCTION()
void OnRep_Health();

void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override {
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);
    DOREPLIFETIME_CONDITION(AMyCharacter, Health, COND_None);
}

// RPC: Server (client pede, server executa)
UFUNCTION(Server, Reliable, WithValidation)
void Server_FireWeapon(FVector_NetQuantize AimLocation);

bool AMyCharacter::Server_FireWeapon_Validate(FVector_NetQuantize AimLocation) {
    return AimLocation.Size() < 100000.f; // Anti-cheat básico
}

void AMyCharacter::Server_FireWeapon_Implementation(FVector_NetQuantize AimLocation) {
    // Lógica de tiro no servidor
}
```

---

## 7. Debugging

### Logging

```cpp
// Definir categoria custom
DEFINE_LOG_CATEGORY_STATIC(LogMyGame, Log, All);

// Níveis de log
UE_LOG(LogMyGame, Display, TEXT("Normal info"));
UE_LOG(LogMyGame, Warning, TEXT("Health baixo: %f"), CurrentHealth);
UE_LOG(LogMyGame, Error, TEXT("Component %s não encontrado"), *CompName);

// Log com contexto do objeto
UE_LOG(LogMyGame, Warning, TEXT("[%s] Dano recebido: %f"), *GetName(), Damage);
```

### Screen Messages

```cpp
if (GEngine) {
    GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::Red, TEXT("Morreu!"));

    // Com formatação
    GEngine->AddOnScreenDebugMessage(-1, 3.f, FColor::Yellow,
        FString::Printf(TEXT("Health: %.1f / %.1f"), CurrentHealth, MaxHealth));
}
```

### Debug Drawing

```cpp
// Linhas, esferas, caixas para visualizar gameplay
DrawDebugLine(GetWorld(), Start, End, FColor::Green, false, 2.f, 0, 2.f);
DrawDebugSphere(GetWorld(), Location, 50.f, 12, FColor::Red, false, 2.f);
DrawDebugBox(GetWorld(), Center, Extent, FColor::Blue, false, 2.f);
```

### Visual Logger

```cpp
// Implementar IVisualLoggerDebugSnapshotInterface para AI debugging
UE_VLOG(this, LogMyAI, Log, TEXT("State: %s"), *StateName);
UE_VLOG_LOCATION(this, LogMyAI, Log, Location, 50.f, FColor::Green, TEXT("Target"));
```

---

## 8. Anti-Patterns

| NÃO faça | Faça | Por quê |
|----------|------|---------|
| `UObject*` sem UPROPERTY() | Sempre usar UPROPERTY() | GC vai coletar o objeto |
| Cast em Tick | Cache em BeginPlay | Performance |
| `bCanEverTick = true` por default | Desabilitar, usar Timer/Events | Performance |
| Hard references em assets grandes | TSoftObjectPtr/TSoftClassPtr | Tempo de carregamento |
| `new` para UObjects | `NewObject<T>()` ou `CreateDefaultSubobject<T>()` | GC não rastreia `new` |
| `delete` em UObjects | `ConditionalBeginDestroy()` ou deixar GC limpar | Double-free, crash |
| Lógica de gameplay no client | Servidor como autoridade | Anti-cheat |
| `GetWorld()` no constructor | Usar em BeginPlay ou PostInitialize | World não existe ainda |
| Strings hardcoded para tags | `FGameplayTag::RequestGameplayTag()` | Typos, sem validação |

---

## 9. Checklist Pré-PR

### Obrigatório

- [ ] Este Actor PRECISA de Tick? Pode ser Timer ou Event?
- [ ] Todos os `UObject*` membros estão com UPROPERTY()?
- [ ] Hard references (TSubclassOf) estão causando load chains? Podem ser Soft Ptrs?
- [ ] Delegates foram limpos em `EndPlay`?
- [ ] Timers foram limpos (ClearTimer) em `EndPlay`?
- [ ] Naming conventions da Epic estão sendo seguidas?

### Performance

- [ ] Casts estão sendo cacheados (não em loops)?
- [ ] Alocações frequentes estão usando pool?
- [ ] Arrays grandes usam `Reserve()` antes de popular?
- [ ] Strings usam `FName` para comparações frequentes?

### Networking (se aplicável)

- [ ] Estado crítico é validado no servidor?
- [ ] RPCs têm `_Validate` implementado?
- [ ] Properties replicadas usam `COND_` apropriado?
- [ ] `GetLifetimeReplicatedProps` está implementado?

### Blueprint Exposure

- [ ] Funções expostas têm `Category` definido?
- [ ] Properties usam `BlueprintReadOnly` quando possível (não ReadWrite)?
- [ ] Tooltips estão definidos para funções complexas?

---

## Veto Conditions

| ID | Trigger | Ação |
|----|---------|------|
| VETO_NOT_UE | Projeto não é Unreal Engine | SKIP — skill não se aplica |
| VETO_OLD_VERSION | UE versão < 5.0 | WARN — padrões podem diferir |
| VETO_BP_ONLY | Projeto apenas Blueprint | SKIP — usar recursos de BP |
