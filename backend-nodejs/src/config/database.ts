import mysql from 'mysql2/promise';
import { createClient } from 'redis';

export const createDbConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'energex_db'
  });
};

export const createRedisClient = () => {
  const client = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379')
    }
  });

  client.on('error', (err) => console.log('Redis Client Error', err));
  
  return client;
};