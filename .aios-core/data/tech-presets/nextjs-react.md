# Next.js + React Tech Preset

> Preset de arquitetura otimizado para desenvolvimento fullstack com Next.js e React, focado em máxima eficiência com Claude Code.

---

## Metadata

```yaml
preset:
  id: nextjs-react
  name: 'Next.js + React Fullstack Preset'
  version: 1.0.0
  description: 'Arquitetura otimizada para aplicações fullstack com Next.js 16+, React, TypeScript e padrões que maximizam a eficiência do Claude Code'
  technologies:
    - Next.js 16+ (App Router + Proxy)
    - React 18+
    - TypeScript
    - Tailwind CSS
    - Zustand
    - React Query
    - Zod
    - Vitest
    - Playwright
  suitable_for:
    - 'Aplicações web fullstack'
    - 'SaaS products'
    - 'E-commerce'
    - 'Dashboards administrativos'
    - 'Aplicações com SSR/SSG'
  not_suitable_for:
    - 'Aplicações mobile-only (use React Native)'
    - 'Microsserviços backend puros (use Node.js puro ou NestJS)'
    - 'Sites estáticos simples (use Astro)'
```

---

## Design Patterns (The Essential 5)

> **Critical:** Estes 5 patterns eliminam 95% dos bugs e permitem ao Claude Code trabalhar com máxima eficiência. São complementares e devem ser usados TODOS juntos.

### Pattern 1: Contract Pattern

**Purpose:** Definir APIs públicas entre features para prevenir bugs de integração

**Execution Score:** 10/10 | **Anti-Bug Score:** 10/10

````typescript
// src/features/auth/auth.contract.ts

/**
 * Public API for authentication feature
 * Other features depend ONLY on this contract, never on implementation
 *
 * @example
 * ```ts
 * class CheckoutService {
 *   constructor(private auth: AuthContract) {}
 *
 *   async process() {
 *     const user = await this.auth.getCurrentUser()
 *   }
 * }
 * ```
 */
export interface AuthContract {
  /**
   * Authenticate user with credentials
   * @throws {InvalidCredentialsError} When credentials are wrong
   * @throws {UserBlockedError} When user account is blocked
   */
  login(email: string, password: string): Promise<AuthResult>;

  /**
   * Get currently authenticated user
   * @throws {UnauthorizedError} When no user is authenticated
   */
  getCurrentUser(): Promise<User>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean;

  /**
   * Sign out current user
   */
  logout(): Promise<void>;
}

export type AuthResult = {
  user: User;
  token: string;
  expiresAt: Date;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
};
````

**Bugs Eliminated:**

- Feature A expects string, Feature B returns number
- Method renamed breaks all consumers
- Parameters in wrong order
- Unexpected return types
- Circular dependencies between features

**Why Claude Code Excels:**

- TypeScript enforces contracts at compile time
- Claude reads contract (50 lines) instead of implementation (2000 lines)
- Impossible to break contract without TypeScript errors

---

### Pattern 2: Service Pattern

**Purpose:** Encapsular lógica de negócio em serviços testáveis e reutilizáveis

**Execution Score:** 10/10 | **Anti-Bug Score:** 9/10

```typescript
// src/features/auth/services/auth.service.ts

import { AuthContract, AuthResult, User } from '../auth.contract';
import { UserRepository } from '../repositories/user.repository';
import { EventBus } from '@/shared/events/eventBus';

export class AuthService implements AuthContract {
  constructor(
    private userRepo: UserRepository,
    private eventBus: EventBus
  ) {}

  async login(email: string, password: string): Promise<AuthResult> {
    // 1. Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // 2. Find user
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError('Invalid credentials');
    }

    // 3. Verify password
    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new InvalidCredentialsError('Invalid credentials');
    }

    // 4. Check if blocked
    if (user.isBlocked) {
      throw new UserBlockedError('Account is blocked');
    }

    // 5. Generate token
    const token = this.generateToken(user);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 6. Emit event
    this.eventBus.emit('auth:login', user);

    return {
      user: this.sanitizeUser(user),
      token,
      expiresAt,
    };
  }

  // ... other methods
}

// Export singleton instance
export const authService = new AuthService(userRepository, eventBus);
```

**Bugs Eliminated:**

- Business logic scattered across components
- Code duplication
- Impossible to test without UI
- Inconsistent error handling
- Side effects in unexpected places

---

### Pattern 3: Repository Pattern

**Purpose:** Isolar lógica de acesso a dados da lógica de negócio

**Execution Score:** 9/10 | **Anti-Bug Score:** 9/10

```typescript
// src/features/auth/repositories/user.repository.ts

import { db } from '@/lib/database';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return db.user.findUnique({
      where: { id },
    });
  }

  async create(data: CreateUserDTO): Promise<User> {
    return db.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role || 'user',
        createdAt: new Date(),
      },
    });
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    return db.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await db.user.delete({
      where: { id },
    });
  }
}

// Export singleton
export const userRepository = new UserRepository();
```

**Bugs Eliminated:**

- SQL/queries scattered throughout codebase
- Impossible to test without real database
- Changing ORM breaks entire application
- Inconsistent data access patterns

---

### Pattern 4: Event Bus Pattern (Observer)

**Purpose:** Habilitar acoplamento solto entre features através de arquitetura event-driven

**Execution Score:** 8/10 | **Anti-Bug Score:** 10/10

```typescript
// src/shared/events/eventBus.ts

type EventHandler<T = any> = (data: T) => void | Promise<void>;

export class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  on<T = any>(event: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  off<T = any>(event: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  async emit<T = any>(event: string, data: T): Promise<void> {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach((handler) => {
      try {
        Promise.resolve(handler(data)).catch((error) => {
          console.error(`Error in handler for event "${event}":`, error);
        });
      } catch (error) {
        console.error(`Error in handler for event "${event}":`, error);
      }
    });
  }
}

export const eventBus = new EventBus();

// Typed events
export type AppEvents = {
  'auth:login': User;
  'auth:logout': { userId: string };
  'order:created': Order;
  'order:paid': { orderId: string; amount: number };
};
```

**Usage:**

```typescript
// Feature A emits
this.eventBus.emit('order:created', order);

// Feature B reacts (doesn't know about Feature A)
eventBus.on('order:created', async (order) => {
  await emailService.sendOrderConfirmation(order);
});

// Feature C also reacts independently
eventBus.on('order:created', async (order) => {
  await analytics.track('purchase', { orderId: order.id });
});
```

**Bugs Eliminated:**

- Circular dependencies between features
- Feature A change breaks Feature B
- Tight coupling makes refactoring impossible
- Adding new functionality requires modifying existing code

---

### Pattern 5: Builder Pattern (Tests Only)

**Purpose:** Criar fixtures de teste facilmente e consistentemente

**Execution Score:** 10/10 | **Anti-Bug Score:** 8/10

**IMPORTANT:** Use Builders APENAS para TESTES, não em código de produção

```typescript
// test/builders/user.builder.ts

export class UserBuilder {
  private data: Partial<User> = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: new Date(),
    isBlocked: false,
  };

  withId(id: string): this {
    this.data.id = id;
    return this;
  }

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  asAdmin(): this {
    this.data.role = 'admin';
    return this;
  }

  asBlocked(): this {
    this.data.isBlocked = true;
    return this;
  }

  build(): User {
    return this.data as User;
  }
}
```

**Usage in Tests:**

```typescript
describe('OrderService', () => {
  it('should create order for authenticated user', async () => {
    const user = new UserBuilder().withEmail('customer@example.com').build();

    const admin = new UserBuilder().asAdmin().build();
    const blocked = new UserBuilder().asBlocked().build();

    // ... test logic
  });
});
```

---

## Project Structure

```
/src
  /features              # Feature-based organization (NOT type-based)
    /auth
      /components       # UI components specific to auth
      /hooks           # Custom hooks for auth
      /services        # Business logic (pure functions)
      /repositories    # Data access layer
      /types           # TypeScript types/interfaces
      /utils           # Helper functions
      auth.contract.ts # PUBLIC API (integration point)
      index.ts         # Barrel export (facade)
    /products
      [same structure]
    /checkout
      [same structure]
    /_reference        # Reference feature (copy good code)
      /contracts
      /repositories
      /services
      /hooks
      /components
      index.ts

  /shared               # ONLY truly shared code
    /components         # Reusable UI components
    /hooks             # Generic hooks
    /utils             # Generic utilities
    /types             # Shared types
    /events            # Event bus

  /config              # Environment variables, constants
  /lib                 # Third-party integrations

/test
  /builders            # Test fixture builders
  /mocks               # MSW handlers and mocks
  /e2e                 # Playwright E2E tests
```

### Structure Rationale

- **Features are self-contained:** Easier to understand context
- **Contract-based integration:** Features communicate via contracts only
- **Reference feature:** Template for new features (copy patterns)
- **Shared is minimal:** Only truly reusable code

---

## Tech Stack

| Category            | Technology      | Version | Purpose                                 |
| ------------------- | --------------- | ------- | --------------------------------------- |
| Framework           | Next.js         | ^16.0.0 | Fullstack React framework (Proxy-based) |
| Language            | TypeScript      | ^5.0.0  | Type safety                             |
| Styling             | Tailwind CSS    | ^3.4.0  | Utility-first CSS                       |
| UI Components       | shadcn/ui       | latest  | Accessible components                   |
| State (Global)      | Zustand         | ^4.5.0  | Simple global state                     |
| State (Server)      | React Query     | ^5.0.0  | Server state management                 |
| Forms               | React Hook Form | ^7.50.0 | Form handling                           |
| Validation          | Zod             | ^3.22.0 | Schema validation                       |
| Testing (Unit)      | Vitest          | ^1.2.0  | Fast unit testing                       |
| Testing (Component) | Testing Library | ^14.0.0 | Component testing                       |
| Testing (E2E)       | Playwright      | ^1.41.0 | E2E testing                             |
| API Mocking         | MSW             | ^2.1.0  | Mock Service Worker                     |
| Database            | Prisma          | ^5.9.0  | Type-safe ORM                           |

### Required Dependencies

```bash
# Core
npm install next react react-dom typescript
npm install tailwindcss postcss autoprefixer
npm install @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod

# Dev
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test msw
npm install -D prisma @types/node @types/react
```

---

## Coding Standards

### Naming Conventions

| Element      | Convention             | Example                |
| ------------ | ---------------------- | ---------------------- |
| Components   | PascalCase             | `ProductCard.tsx`      |
| Hooks        | useCamelCase           | `useProducts.ts`       |
| Services     | camelCase + Service    | `auth.service.ts`      |
| Repositories | camelCase + Repository | `user.repository.ts`   |
| Contracts    | camelCase + .contract  | `auth.contract.ts`     |
| Types        | PascalCase             | `User`, `AuthResult`   |
| Constants    | SCREAMING_SNAKE        | `MAX_ITEMS_PER_PAGE`   |
| Tests        | _.test.ts or _.spec.ts | `auth.service.test.ts` |

### Critical Rules

1. **Contract Pattern:** Features ONLY expose via `.contract.ts` files
2. **No Cross-Feature Imports:** Import from `@/features/[name]` index only
3. **Types First:** Always define schemas/types BEFORE implementation
4. **Error Handling:** All async operations must have explicit error handling
5. **No `any` Types:** Use `unknown` if type is truly unknown, then narrow

### Next.js 16+ Proxy (substitui Middleware)

> **IMPORTANTE:** Next.js 16 substituiu o Middleware pelo sistema de Proxy. NÃO use `middleware.ts`.

**Antes (Next.js 14 - DEPRECADO):**

```typescript
// middleware.ts - NÃO USE MAIS
export function middleware(request: NextRequest) {
  // auth checks, redirects, etc.
}
```

**Agora (Next.js 16+ - USE PROXY):**

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/old-route',
        destination: '/new-route',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

**Para autenticação, use Server Components ou Route Handlers:**

```typescript
// app/dashboard/page.tsx
import { auth } from '@/features/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return <Dashboard user={session.user} />
}
```

**Vantagens do Proxy sobre Middleware:**

- Executa no servidor Node.js (não em Edge Runtime limitado)
- Acesso completo a banco de dados e serviços
- Melhor performance e caching
- Configuração centralizada em `next.config.ts`

### TypeScript Config

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true
  }
}
```

---

## Testing Strategy

### Test Pyramid

```
         /\
        /E2E\           10% - Critical user flows only
       /------\
      /Integration\     20% - Features working together
     /------------\
    /  Unit Tests  \    70% - Business logic, components
   /----------------\
```

### What to Test

#### Always Test (Critical)

- [ ] Business Logic (Services/Utils) - 90%+ coverage
- [ ] Validation & Business Rules
- [ ] Edge Cases (null, empty, max values)

#### Consider Testing

- [ ] Custom Hooks
- [ ] Component Integration
- [ ] API Error Handling

#### Never Test

- [ ] Framework internals (React, Next.js)
- [ ] External libraries (Zod, React Query)
- [ ] Trivial getters/setters
- [ ] CSS/styling

### Coverage Goals

```
- Business logic (services/utils): 90%+
- Hooks: 80%+
- Components: 60%+
- Overall: 70%+

DO NOT pursue 100% - diminishing returns
```

### Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('[Feature]Service', () => {
  let service: FeatureService;
  let mockRepo: MockType;

  beforeEach(() => {
    mockRepo = { method: vi.fn() };
    service = new FeatureService(mockRepo);
  });

  describe('methodName', () => {
    it('should handle happy path', async () => {
      // Arrange
      const input = {
        /* test data */
      };
      mockRepo.method.mockResolvedValue({
        /* mock response */
      });

      // Act
      const result = await service.methodName(input);

      // Assert
      expect(result).toEqual({
        /* expected */
      });
    });

    it('should handle validation error', async () => {
      await expect(service.methodName(invalidInput)).rejects.toThrow('Error message');
    });
  });
});
```

---

## Token Economy Strategies

> Estratégias para minimizar consumo de tokens com Claude Code.

### Strategy 1: Show, Don't Tell

```
// BAD: ~1000 tokens explaining patterns
"Create a CheckoutService using the Service pattern with
Dependency Injection following SOLID principles..."

// GOOD: ~300 tokens showing example
"Create CheckoutService following the same pattern as AuthService:
[paste AuthService.ts]"
```

### Strategy 2: Reference Feature

Create one perfect feature as template, then:

```
"Create ProductService identical to _reference/services/reference.service.ts
Just change the entity name and business logic"
```

### Strategy 3: Schemas as Documentation

```typescript
// Schema replaces 50+ lines of explanation
export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  name: z.string().min(2).max(100),
});
```

### Strategy 4: Tests as Specifications

```typescript
// Tests are more concise than prose
"Make these tests pass:

describe('calculateShipping', () => {
  it('charges R$10 for < 1kg', () => {
    expect(calculateShipping(0.5, 50)).toBe(10)
  })
  it('adds 20% for distance > 100km', () => {
    expect(calculateShipping(1, 150)).toBe(12)
  })
})"
```

---

## Bug Prevention Stack

| Layer              | Catches | Implementation             |
| ------------------ | ------- | -------------------------- |
| TypeScript Strict  | 60%     | `strict: true` in tsconfig |
| Runtime Validation | 25%     | Zod schemas at boundaries  |
| Contract Pattern   | 10%     | Interface enforcement      |
| Tests              | 5%      | Edge cases and regressions |

---

## Patterns to AVOID

### Singleton Pattern

**Problem:** Hard to test, shared state between tests

```typescript
// BAD
class Database {
  private static instance: Database
  static getInstance() { ... }
}

// GOOD
export const db = new Database()
```

### TypeScript Decorators

**Problem:** Experimental, confusing syntax, hard to debug

```typescript
// BAD
@Log
@Validate
@Cache
class UserService {}

// GOOD
const userService = rateLimit(cache(validate(new UserService())));
```

### Abstract Factory

**Problem:** Over-engineering for 99% of cases

```typescript
// BAD
abstract class VehicleFactory {
  abstract createCar(): Car;
}

// GOOD
const vehicleFactory = {
  createCar: (region: string) => (region === 'US' ? new USCar() : new EUCar()),
};
```

---

## File Templates

### Contract Template

```typescript
// src/features/[feature]/[feature].contract.ts

/**
 * Public API for [feature] feature
 */
export interface [Feature]Contract {
  /**
   * Method description
   * @throws {ErrorType} When error occurs
   */
  methodName(param: Type): Promise<ReturnType>
}

export type [Feature]Result = {
  // type definition
}

export type [Feature]Events = {
  '[feature]:event-name': PayloadType
}
```

### Service Template

```typescript
// src/features/[feature]/services/[feature].service.ts

import { [Feature]Contract } from '../[feature].contract'

export class [Feature]Service implements [Feature]Contract {
  constructor(
    private dependency1: Dependency1Type,
    private eventBus: EventBus
  ) {}

  async methodName(param: Type): Promise<ReturnType> {
    // 1. Validate
    // 2. Execute
    // 3. Emit events
    // 4. Return
  }
}

export const [feature]Service = new [Feature]Service(dep1, eventBus)
```

### Index Template

```typescript
// src/features/[feature]/index.ts

// ONLY export public API
export type { [Feature]Contract, [Feature]Result } from './[feature].contract'
export { [feature]Service } from './services/[feature].service'

// DO NOT export internal implementation details
```

---

## Integration with AIOS

### Recommended Workflow

1. **Planning Phase:**
   - Use `@architect` with `*create-doc fullstack-architecture`
   - Reference this preset for patterns and structure

2. **Development Phase:**
   - Use `@dev` following the 5 Essential Patterns
   - Create features using the Reference Feature strategy

3. **QA Phase:**
   - Use `@qa` with the testing strategy defined
   - Ensure coverage goals are met

### Related AIOS Templates

- `fullstack-architecture-tmpl.yaml` - Main architecture document
- `front-end-architecture-tmpl.yaml` - Frontend specifics
- `story-tmpl.yaml` - User story format

### AIOS Commands

```bash
# Create architecture doc using this preset
@architect *create-doc fullstack-architecture

# Reference this preset
@dev "Follow the nextjs-react preset patterns"
```

---

## Checklist for New Features

```markdown
When creating a new feature:

- [ ] Define Contract if feature will be used by others
- [ ] Create Repository for all data access
- [ ] Implement Service for business logic
- [ ] Use Event Bus for cross-feature communication
- [ ] Create Builders for test fixtures
- [ ] Export only public API through index.ts
- [ ] Write tests using mocked contracts
- [ ] Document integration points

When integrating with existing feature:

- [ ] Import ONLY the Contract, never implementation
- [ ] Use Event Bus if don't need synchronous response
- [ ] Mock contracts in tests
- [ ] Don't create circular dependencies
```

---

## Changelog

| Date       | Version | Changes                                              |
| ---------- | ------- | ---------------------------------------------------- |
| 2026-01-28 | 1.1.0   | Update to Next.js 16+, replace Middleware with Proxy |
| 2025-01-27 | 1.0.0   | Initial version based on DEVELOPMENT_GUIDE.md        |

---

_AIOS Tech Preset - Synkra AIOS Framework_
