import { Request, Response } from 'express';
import { CacheService } from '../services/cacheService';

export class CacheController {
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService();
  }

  async getPosts(req: Request, res: Response) {
    try {
      const result = await this.cacheService.getPosts();
      res.json(result);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.cacheService.getPost(id);
      
      if (!result) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json(result);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async clearCache(req: Request, res: Response) {
    try {
      const { keys } = req.body;
      await this.cacheService.clearCache(keys);
      res.json({ message: 'Cache cleared successfully' });
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}