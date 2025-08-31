import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { CacheController } from './controllers/cacheController';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const cacheController = new CacheController();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'EnergeX Cache Service', status: 'Running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'EnergeX Cache Service' });
});

app.get('/cache/posts', (req, res) => cacheController.getPosts(req, res));
app.get('/cache/posts/:id', (req, res) => cacheController.getPost(req, res));
app.post('/cache/clear', (req, res) => cacheController.clearCache(req, res));

app.listen(port, () => {
  console.log(`Cache service running on port ${port}`);
});

export default app;