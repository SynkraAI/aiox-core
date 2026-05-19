import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from '@src/app.module';

describe('Auth E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors({
      origin: 'http://localhost:3001',
      credentials: true,
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/signup', () => {
    it('should reject missing email', async () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          password: 'Password123',
          name: 'Test User',
          role: 'COMERCIAL',
        })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error).toBe('Validation failed');
        });
    });

    it('should reject invalid email format', async () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'Password123',
          name: 'Test User',
          role: 'COMERCIAL',
        })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error).toBe('Validation failed');
        });
    });

    it('should reject password shorter than 8 characters', async () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'short',
          name: 'Test User',
          role: 'COMERCIAL',
        })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error).toBe('Validation failed');
        });
    });

    it('should reject invalid role', async () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          name: 'Test User',
          role: 'INVALID_ROLE',
        })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error).toBe('Validation failed');
        });
    });

    it('should reject empty name', async () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          name: '',
          role: 'COMERCIAL',
        })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error).toBe('Validation failed');
        });
    });
  });

  describe('POST /auth/signin', () => {
    it('should successfully sign in', async () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('token');
          expect(res.body.data.user.email).toBeDefined();
        });
    });

    it('should reject invalid email', async () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'not-an-email',
          password: 'Password123',
        })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error).toBe('Validation failed');
        });
    });

    it('should reject empty password', async () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: '',
        })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error).toBe('Validation failed');
        });
    });
  });

  describe('POST /auth/logout', () => {
    it('should successfully log out with valid token', async () => {
      const signInRes = await request(app.getHttpServer()).post('/auth/signin').send({
        email: 'test@example.com',
        password: 'Password123',
      });

      const token = signInRes.body.data.token;

      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toContain('logged out');
        });
    });

    it('should reject logout without token', async () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401)
        .expect((res: Response) => {
          expect(res.body.message).toContain('Unauthorized');
        });
    });

    it('should reject malformed Bearer token', async () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'InvalidBearerFormat')
        .expect(401)
        .expect((res: Response) => {
          expect(res.body.message).toContain('Unauthorized');
        });
    });

    it('should reject invalid token', async () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
        .expect((res: Response) => {
          expect(res.body.message).toContain('Unauthorized');
        });
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers in response', async () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        })
        .expect((res: Response) => {
          expect(res.headers['access-control-allow-origin']).toBeDefined();
        });
    });
  });
});
