import { createRedisClient, createDbConnection } from '../config/database';

export class CacheService {
  private redisClient;
  
  constructor() {
    this.redisClient = createRedisClient();
    this.redisClient.connect();
  }

  async getPosts() {
    try {
      const cacheKey = 'posts:all';
      const cachedPosts = await this.redisClient.get(cacheKey);

      if (cachedPosts) {
        return {
          posts: JSON.parse(cachedPosts),
          cached: true
        };
      }

      const db = await createDbConnection();
      const [rows] = await db.execute(`
        SELECT p.*, u.name as user_name 
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        ORDER BY p.created_at DESC
      `);
      
      await db.end();

      // Cache for 5 minutes
      await this.redisClient.setEx(cacheKey, 300, JSON.stringify(rows));

      return {
        posts: rows,
        cached: false
      };
    } catch (error) {
      console.error('Error in getPosts:', error);
      throw error;
    }
  }

  async getPost(id: string) {
    try {
      const cacheKey = `posts:${id}`;
      const cachedPost = await this.redisClient.get(cacheKey);

      if (cachedPost) {
        return {
          post: JSON.parse(cachedPost),
          cached: true
        };
      }

      const db = await createDbConnection();
      const [rows] = await db.execute(`
        SELECT p.*, u.name as user_name 
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.id = ?
      `, [id]);
      
      await db.end();

      if (Array.isArray(rows) && rows.length === 0) {
        return null;
      }

      const post = Array.isArray(rows) ? rows[0] : rows;

      // Cache for 5 minutes
      await this.redisClient.setEx(cacheKey, 300, JSON.stringify(post));

      return {
        post,
        cached: false
      };
    } catch (error) {
      console.error('Error in getPost:', error);
      throw error;
    }
  }

  async clearCache(keys?: string[]) {
    try {
      if (keys) {
        await Promise.all(keys.map(key => this.redisClient.del(key)));
      } else {
        await this.redisClient.flushAll();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }
}