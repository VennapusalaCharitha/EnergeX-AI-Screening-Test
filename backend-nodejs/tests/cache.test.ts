import request from 'supertest';
import app from '../src/index';

describe('Cache Service', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        service: 'EnergeX Cache Service'
      });
    });
  });

  describe('GET /cache/posts', () => {
    it('should return posts data', async () => {
      const response = await request(app)
        .get('/cache/posts')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('cached');
      expect(Array.isArray(response.body.posts)).toBe(true);
    });
  });

  describe('GET /cache/posts/:id', () => {
    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .get('/cache/posts/99999')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Post not found'
      });
    });
  });

  describe('POST /cache/clear', () => {
    it('should clear cache successfully', async () => {
      const response = await request(app)
        .post('/cache/clear')
        .send({ keys: ['posts:all'] })
        .expect(200);

      expect(response.body).toEqual({
        message: 'Cache cleared successfully'
      });
    });
  });
});