import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { app } from '../../api';
import { createTestUser, cleanupTestUser } from '../helpers/auth';

const request = supertest(app);

describe('Authentication API', () => {
  let testUser: { id: string; email: string };

  beforeAll(async () => {
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestUser(testUser.id);
  });

  describe('POST /api/auth/login', () => {
    it('should send magic link email', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Magic link sent');
    });

    it('should handle invalid email', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // First login to get tokens
      const loginResponse = await request
        .post('/api/auth/callback')
        .send({
          code: 'test-code',
          user: {
            id: testUser.id,
            email: testUser.email
          }
        });

      const refreshToken = loginResponse.headers['set-cookie']
        .find((cookie: string) => cookie.startsWith('refresh_token='));

      const response = await request
        .post('/api/auth/refresh')
        .set('Cookie', [refreshToken])
        .expect(200);

      expect(response.headers).toHaveProperty('set-cookie');
    });

    it('should reject invalid refresh token', async () => {
      await request
        .post('/api/auth/refresh')
        .set('Cookie', ['refresh_token=invalid'])
        .expect(401);
    });
  });
});