import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should successfully create a new user', async () => {
      const result = await service.signup({
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'Test User',
        role: 'COMERCIAL',
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(result.user.role).toBe('COMERCIAL');
      expect(result.token).toBeDefined();
    });

    it('should handle signup errors gracefully', async () => {
      await expect(
        service.signup({
          email: 'error@example.com',
          password: 'SecurePass123',
          name: 'Test User',
          role: 'ADMIN',
        })
      ).resolves.toBeDefined();
    });
  });

  describe('signin', () => {
    it('should successfully authenticate user', async () => {
      const result = await service.signin({
        email: 'test@example.com',
        password: 'SecurePass123',
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBeDefined();
      expect(result.token).toBeDefined();
    });
  });

  describe('token generation and verification', () => {
    it('should generate valid JWT token', async () => {
      const result = await service.signup({
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'Test User',
        role: 'ADMIN',
      });

      expect(result.token).toBeDefined();

      const payload = service.verifyToken(result.token);
      expect(payload.sub).toBe(result.user.id);
      expect(payload.role).toBe('ADMIN');
      expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('should reject expired token', () => {
      const expiredPayload = {
        sub: 'user-id',
        role: 'ADMIN',
        iat: Math.floor(Date.now() / 1000) - 7200,
        exp: Math.floor(Date.now() / 1000) - 3600,
      };

      const expiredToken = Buffer.from(JSON.stringify(expiredPayload)).toString('base64');

      expect(() => service.verifyToken(expiredToken)).toThrow('Token expired');
    });

    it('should reject malformed token', () => {
      expect(() => service.verifyToken('invalid-token')).toThrow();
    });
  });

  describe('logout', () => {
    it('should not throw when logging out', async () => {
      await expect(service.logout('test-user-id')).resolves.not.toThrow();
    });
  });
});
