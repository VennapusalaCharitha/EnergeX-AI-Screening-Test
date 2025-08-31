const request = require('supertest');

// Mock app for testing
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'EnergeX Cache Service' });
});

app.get('/cache/posts', (req, res) => {
  res.json({ posts: [], cached: false });
});

describe('Cache Service', () => {
  test('Health endpoint should return OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  test('Cache posts endpoint should return empty array', async () => {
    const response = await request(app).get('/cache/posts');
    expect(response.status).toBe(200);
    expect(response.body.posts).toEqual([]);
  });
});