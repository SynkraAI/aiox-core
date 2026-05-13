# Angular 21 + NestJS Tech Preset

> Preset de arquitetura otimizado para desenvolvimento fullstack com Angular 21 no frontend e NestJS no backend, seguindo padrões que maximizam a eficiência com Claude Code.

---

## Metadata

```yaml
preset:
  id: angular-nestjs
  name: 'Angular 21 + NestJS Fullstack Preset'
  version: 1.0.0
  description: 'Arquitetura otimizada para aplicações fullstack com Angular 21 (Signals, Standalone Components) no frontend e NestJS (Modular, DI, Guards) no backend'
  technologies:
    - Angular 21 (Signals, Standalone Components, SSR)
    - NestJS 11+
    - TypeScript 5+
    - RxJS 7+
    - Prisma ORM
    - Jest
    - Playwright
    - Zod
  suitable_for:
    - 'Aplicações enterprise fullstack'
    - 'SaaS com autenticação robusta'
    - 'Dashboards e painéis administrativos'
    - 'Aplicações com lógica de negócio complexa'
    - 'APIs REST + WebSocket'
  not_suitable_for:
    - 'Landing pages simples (use Next.js ou Astro)'
    - 'Aplicações mobile-only (use Ionic ou React Native)'
    - 'Microsserviços sem frontend (use NestJS standalone)'
```

---

## Design Patterns (The Essential 5)

> **Critical:** Estes 5 patterns eliminam 95% dos bugs e permitem ao Claude Code trabalhar com máxima eficiência.

### Pattern 1: Contract Pattern (Shared DTOs)

**Purpose:** Definir contratos compartilhados entre frontend e backend para prevenir bugs de integração

**Execution Score:** 10/10 | **Anti-Bug Score:** 10/10

```typescript
// shared/contracts/auth.contract.ts
// Interfaces TypeScript para uso no Angular frontend (type-checking apenas)
// ⚠️ NOTE: TypeScript interfaces are erased at runtime — they cannot be used
// with NestJS ValidationPipe. Use the DTO classes below on the NestJS side.

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  // No accessToken in cookie-based auth — backend sets HttpOnly cookie
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}
```

```typescript
// backend/src/features/auth/dto/login.dto.ts
// NestJS DTO — class-based so ValidationPipe can enforce rules at runtime
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

```typescript
// backend/src/features/auth/dto/user-response.dto.ts
import { IsString, IsUUID, IsIn, IsEmail } from 'class-validator';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsIn(['admin', 'user'])
  role: 'admin' | 'user';
}
```

**Bugs Eliminated:**

- Frontend espera `token`, backend retorna `accessToken`
- Tipagem divergente entre camadas
- Refatoração em um lado quebra o outro
- Parâmetros de API em ordem errada

---

### Pattern 2: NestJS Module Pattern

**Purpose:** Organizar backend em módulos coesos e testáveis com Dependency Injection

**Execution Score:** 10/10 | **Anti-Bug Score:** 9/10

```typescript
// backend/src/features/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './repositories/user.repository';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule, // Required: provides ConfigService to JwtModule.registerAsync factory
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtStrategy],
  exports: [AuthService], // Exporta apenas o que outros módulos precisam
})
export class AuthModule {}
```

```typescript
// backend/src/features/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UserRepository } from './repositories/user.repository';
import { LoginRequestDto, LoginResponseDto, UserDto } from '@shared/contracts/auth.contract';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginRequestDto, res: Response): Promise<LoginResponseDto> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user || !await this.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    // Set JWT as HttpOnly cookie — never exposed to JavaScript
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600 * 1000, // 1 hour in ms
    });

    const userDto: UserDto = { id: user.id, email: user.email, name: user.name, role: user.role };
    return { user: userDto };
  }
}

// backend/src/features/auth/auth.controller.ts (relevant excerpt)
// Controller passes @Res({ passthrough: true }) to allow cookie setting
import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return { message: 'Logged out' };
  }
}
```

**Bugs Eliminated:**

- Serviços com dependências circulares
- Lógica de negócio em controllers
- Impossível testar sem servidor real
- Segredos hard-coded

---

### Pattern 3: Angular Signals + Service Pattern

**Purpose:** Gerenciar estado no frontend com Signals e serviços injetáveis — sem NgRx para apps de médio porte

**Execution Score:** 9/10 | **Anti-Bug Score:** 9/10

```typescript
// frontend/src/app/features/auth/auth.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LoginRequestDto, LoginResponseDto, UserDto } from '@shared/contracts/auth.contract';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // State as Signals
  private readonly _user = signal<UserDto | null>(null);
  private readonly _loading = signal(false);

  // Public read-only signals
  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  async login(dto: LoginRequestDto): Promise<void> {
    this._loading.set(true);
    try {
      const response = await firstValueFrom(
        // credentials: 'include' ensures the HttpOnly cookie set by NestJS is sent/received
        this.http.post<LoginResponseDto>('/api/auth/login', dto, { withCredentials: true })
      );
      // ⚠️ SECURITY: Do NOT store JWT in localStorage (XSS vulnerable).
      // The NestJS backend sets an HttpOnly cookie — Angular just tracks the user state.
      this._user.set(response.user);
      await this.router.navigate(['/dashboard']);
    } finally {
      this._loading.set(false);
    }
  }

  async logout(): Promise<void> {
    // Call backend to clear the HttpOnly cookie
    await firstValueFrom(this.http.post('/api/auth/logout', {}, { withCredentials: true }));
    this._user.set(null);
    await this.router.navigate(['/login']);
  }
}
```

```typescript
// frontend/src/app/features/auth/login/login.component.ts
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="email" type="email" />
      <input formControlName="password" type="password" />
      <button type="submit" [disabled]="auth.loading()">
        {{ auth.loading() ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  `,
})
export class LoginComponent {
  protected readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    await this.auth.login(this.form.getRawValue() as LoginRequestDto);
  }
}
```

**Bugs Eliminated:**

- Estado mutável espalhado por componentes
- Change detection desnecessária (Signals são granulares)
- Subscriptions não desinscritas (Signals são automáticos)
- Prop drilling profundo

---

### Pattern 4: NestJS Guard + Decorator Pattern

**Purpose:** Proteger endpoints com guards reutilizáveis e decorators declarativos

**Execution Score:** 9/10 | **Anti-Bug Score:** 10/10

```typescript
// backend/src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// backend/src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: { role: string } }>();
    if (!user) return false; // Guard against unauthenticated requests reaching this guard
    return requiredRoles.includes(user.role);
  }
}

// backend/src/features/admin/admin.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles('admin')
  getUsers() {
    // Protegido automaticamente — apenas admin acessa
  }
}
```

**Bugs Eliminated:**

- Verificações de autorização duplicadas em cada controller
- Esquecer de proteger um endpoint
- Lógica de autenticação acoplada ao business logic
- Impossível reutilizar a lógica de autorização

---

### Pattern 5: Builder Pattern (Tests Only)

**Purpose:** Criar fixtures de teste facilmente no Angular e NestJS

**Execution Score:** 10/10 | **Anti-Bug Score:** 8/10

```typescript
// test/builders/user.builder.ts (compartilhado frontend/backend)
import { UserDto } from '@shared/contracts/auth.contract';

export class UserBuilder {
  private data: UserDto = {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    role: 'user',
  };

  withId(id: string): this { this.data.id = id; return this; }
  withEmail(email: string): this { this.data.email = email; return this; }
  asAdmin(): this { this.data.role = 'admin'; return this; }

  build(): UserDto { return { ...this.data }; }
}

// NestJS test
describe('RolesGuard', () => {
  it('should allow admin access', () => {
    const user = new UserBuilder().asAdmin().build();
    // ...
  });
});

// Angular test
it('should show admin menu', () => {
  const user = new UserBuilder().asAdmin().build();
  authService['_user'].set(user);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('.admin-menu')).toBeTruthy();
});
```

---

## Project Structure

```text
/
├── frontend/                    # Angular 21 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/        # Feature-based organization
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login/
│   │   │   │   │   │   ├── login.component.ts
│   │   │   │   │   │   └── login.component.html
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   └── index.ts  # Barrel export
│   │   │   │   ├── dashboard/
│   │   │   │   └── _reference/   # Referência — copie daqui
│   │   │   ├── shared/
│   │   │   │   ├── components/   # Componentes reutilizáveis
│   │   │   │   ├── directives/
│   │   │   │   ├── pipes/
│   │   │   │   └── interceptors/
│   │   │   ├── core/
│   │   │   │   ├── http/         # HttpClient config, interceptors
│   │   │   │   └── error/        # Error handling global
│   │   │   └── app.config.ts     # Standalone bootstrap
│   │   └── environments/
│   └── angular.json
│
├── backend/                     # NestJS application
│   ├── src/
│   │   ├── features/            # Módulos de negócio
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── repositories/
│   │   │   │   │   └── user.repository.ts
│   │   │   │   └── strategies/
│   │   │   │       └── jwt.strategy.ts
│   │   │   └── _reference/      # Referência — copie daqui
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   ├── decorators/
│   │   │   ├── filters/         # Exception filters
│   │   │   ├── interceptors/
│   │   │   └── pipes/           # Validation pipes
│   │   ├── config/              # ConfigModule, env vars
│   │   ├── database/            # Prisma setup
│   │   │   ├── prisma.service.ts
│   │   │   └── migrations/
│   │   └── main.ts
│   └── prisma/
│       └── schema.prisma
│
└── shared/                      # Código compartilhado
    └── contracts/               # DTOs compartilhados frontend/backend
        ├── auth.contract.ts
        ├── user.contract.ts
        └── index.ts
```

---

## Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Frontend Framework | Angular | 21+ | SPA com Signals e Standalone |
| Backend Framework | NestJS | 11+ | API REST modular |
| Language | TypeScript | 5+ | Type safety fullstack |
| State Management | Angular Signals | built-in | Estado reativo granular |
| HTTP Client | Angular HttpClient | built-in | Comunicação com backend |
| Forms | Angular Reactive Forms | built-in | Formulários type-safe |
| Validation (Backend) | class-validator | ^0.14.0 | NestJS request body DTOs — required by `ValidationPipe` (class-based, survives runtime) |
| Validation (Shared) | Zod | ^3.22.0 | Shared schema parsing (env vars, API response shapes) — NOT for NestJS `ValidationPipe` (interfaces/Zod types are erased at runtime) |
| ORM | Prisma | ^5.9.0 | Database type-safe |
| Auth | @nestjs/jwt + Passport | latest | JWT com Guards |
| Testing (Unit) | Jest | ^29.0.0 | Backend + Angular |
| Testing (Component) | Angular Testing Library | ^17.0.0 | Componentes |
| Testing (E2E) | Playwright | ^1.41.0 | E2E fullstack |
| CSS | Tailwind CSS | ^3.4.0 | Utility-first |
| UI Components | Angular Material 21 | ^21.0.0 | Componentes acessíveis |

### Required Dependencies

```bash
# Frontend
ng new my-app --standalone --routing --style=scss
npm install @angular/material tailwindcss zod

# Backend
npm install @nestjs/cli
nest new backend
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install class-validator class-transformer @prisma/client
npm install -D prisma
npx prisma init
```

---

## Coding Standards

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase + Component | `LoginComponent` |
| Services | PascalCase + Service | `AuthService` |
| Guards | PascalCase + Guard | `JwtAuthGuard` |
| Modules | PascalCase + Module | `AuthModule` |
| DTOs | PascalCase + Dto | `LoginRequestDto` |
| Interceptors | PascalCase + Interceptor | `TokenInterceptor` |
| Pipes | PascalCase + Pipe | `ValidationPipe` |
| Signals | camelCase (sem prefixo) | `user`, `loading` |
| Arquivos | kebab-case | `auth.service.ts` |

### Critical Rules

1. **Standalone Components:** Todos os componentes Angular devem ser `standalone: true` — sem NgModules de feature
2. **Signals para estado local/global:** Use Signals em vez de BehaviorSubject para estado de UI
3. **inject() em vez de constructor DI:** Prefira `inject()` em Angular para menos boilerplate
4. **NestJS DTOs com class-validator:** Todo body de request deve ter DTO + `@IsString()`, `@IsEmail()` etc.
5. **Shared Contracts:** DTOs compartilhados frontend/backend na pasta `/shared/contracts/`
6. **No `any`:** Use `unknown` + type guard ou tipos explícitos
7. **Guards para tudo:** Nunca verifique autorização dentro do service — use Guards

### Angular Signals — Padrões Críticos

```typescript
// ✓ CORRETO: Signals com computed e effect
const count = signal(0);
const doubled = computed(() => count() * 2);

effect(() => {
  console.log('count changed:', count());
});

// ✓ CORRETO: Update imutável
users.update(list => [...list, newUser]);
userMap.update(map => ({ ...map, [id]: user }));

// ✗ ERRADO: Mutação direta
users().push(newUser); // NÃO FAÇA — quebra reatividade
```

### NestJS Error Handling

```typescript
// backend/src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse
        ? (exceptionResponse as { message: unknown }).message
        : exceptionResponse;

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### TypeScript Config (ambos frontend e backend)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## Testing Strategy

### Test Pyramid

```text
         /\
        /E2E\           10% - Fluxos críticos do usuário
       /------\
      /Integration\     20% - Controller + Service + DB
     /------------\
    /  Unit Tests  \    70% - Services, Guards, Pipes, Components
   /----------------\
```

### NestJS Unit Test Template

```typescript
// backend/src/features/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserRepository } from './repositories/user.repository';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: { findByEmail: jest.fn() } },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'mock-token') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(UserRepository);
  });

  it('should throw UnauthorizedException for invalid credentials', async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    const mockRes = { cookie: jest.fn() } as unknown as Response;
    await expect(service.login({ email: 'x@x.com', password: '123' }, mockRes))
      .rejects.toThrow('Invalid credentials');
  });
});
```

### Angular Unit Test Template

```typescript
// frontend/src/app/features/auth/auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { UserBuilder } from '@test/builders/user.builder';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should set user signal after successful login', async () => {
    const user = new UserBuilder().withEmail('test@test.com').build();
    const loginPromise = service.login({ email: 'test@test.com', password: 'Pass123!' });

    // Cookie-based auth: backend sets HttpOnly cookie, response only carries user data
    http.expectOne('/api/auth/login').flush({ user });

    await loginPromise;
    expect(service.user()).toEqual(user);
    expect(service.isAuthenticated()).toBe(true);
  });
});
```

---

## Token Economy Strategies

### Strategy 1: Mostrar o módulo de referência

```text
// BOM: ~300 tokens mostrando o padrão
"Crie ProductsModule idêntico ao AuthModule:
[cole auth.module.ts]
Apenas troque a entidade para Product"
```

### Strategy 2: DTOs como documentação

```typescript
// DTO substitui 50+ linhas de explicação
export class CreateProductDto {
  @IsString() @MinLength(3) name: string;
  @IsNumber() @IsPositive() price: number;
  @IsEnum(ProductCategory) category: ProductCategory;
}
```

### Strategy 3: Testes como especificação

```text
"Faça estes testes passarem:
it('should return 404 when product not found')
it('should validate price is positive')
it('should require admin role')"
```

---

## Bug Prevention Stack

| Layer | Catches | Implementation |
|-------|---------|---------------|
| TypeScript Strict | 60% | `strict: true` em ambos projetos |
| class-validator (NestJS) | 15% | DTOs com decorators de validação |
| Angular Reactive Forms | 10% | Validators built-in + Validators customizados |
| Zod (shared) | 10% | Schemas em `/shared/contracts/` |
| Jest + Angular Testing | 5% | Edge cases e regressões |

> **Zod vs class-validator:** Use **Zod** for runtime-parsed shared schemas (e.g. API response shapes, env validation). Use **class-validator** for NestJS request body DTOs (required by `ValidationPipe`). They serve different layers.

```typescript
// shared/contracts/env.schema.ts — Zod for environment/config validation
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3000),
});

export type Env = z.infer<typeof envSchema>;

// backend/src/app.module.ts — use envSchema in ConfigModule
// ConfigModule.forRoot({ validate: (config) => envSchema.parse(config) })
```

---

## Patterns to AVOID

```typescript
// ✗ NgModule de feature (use Standalone)
@NgModule({ declarations: [LoginComponent] })
export class AuthModule {}

// ✓ Standalone Component
@Component({ standalone: true, ... })
export class LoginComponent {}

// ✗ BehaviorSubject em vez de Signals
private _user = new BehaviorSubject<User | null>(null);

// ✓ Signals
private readonly _user = signal<User | null>(null);

// ✗ Lógica de negócio no Controller NestJS
@Post('login')
async login(@Body() dto: LoginDto) {
  const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
  // lógica direto no controller — ERRADO
}

// ✓ Delegar ao Service
@Post('login')
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}

// ✗ any em TypeScript
const user: any = await this.getUser();

// ✓ Tipos explícitos ou unknown + guard
const user: UserDto = await this.getUser();
```
