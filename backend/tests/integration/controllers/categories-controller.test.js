import mongoose from 'mongoose';
import request from 'supertest';
import Category from '../../../models/category.js';
import server from '../../../server.js';
import { HTTP_STATUS } from '../../../utils/constants.js';

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Integration Tests: Categories', () => {
  it('GET /api/categories - returns empty array initially', async () => {
    const response = await request(server).get('/api/categories');
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it('POST /api/categories - requires authentication', async () => {
    const response = await request(server)
      .post('/api/categories')
      .send({ name: 'Test Category' });
    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });
});
