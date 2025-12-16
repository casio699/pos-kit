import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Auth Flow', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: 'Test123!@#',
          first_name: 'Test',
          last_name: 'User',
          tenant_id: '00000000-0000-0000-0000-000000000001',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
    });

    it('should login user and return tokens', async () => {
      const email = `test-${Date.now()}@example.com`;
      
      // Register first
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'Test123!@#',
          first_name: 'Test',
          last_name: 'User',
          tenant_id: '00000000-0000-0000-0000-000000000001',
        });

      // Login
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: 'Test123!@#',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      authToken = response.body.access_token;
    });

    it('should access protected endpoint with valid token', async () => {
      await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should reject request without token', async () => {
      await request(app.getHttpServer())
        .get('/products')
        .expect(401);
    });
  });
});
