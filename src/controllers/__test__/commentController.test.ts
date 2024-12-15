import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { beforeEach, afterEach, describe, expect, it, jest } from '@jest/globals';
import { addComment, getComments } from '../commentController';
import { pool } from '../../config/dbConfig';



const app = express();
app.use(bodyParser.json());
app.post('/comments', addComment);
app.get('/comments/:pollId', getComments);

jest.mock('../../config/dbConfig', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('Comment Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add a new comment', async () => {
    const mockResult = { insertId: 1 };
    (pool.query as jest.Mock).mockReturnValue([mockResult]);

    const response = await request(app)
      .post('/comments')
      .send({ pollId: 1, userId: 1, content: 'Test comment' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 1, pollId: 1, userId: 1, content: 'Test comment' });
  });

  it('should get comments for a poll', async () => {
    const mockComments = [{ id: 1, pollId: 1, userId: 1, content: 'Test comment', created_at: '2023-01-01T00:00:00.000Z' }];
    (pool.query as jest.Mock).mockReturnValue([mockComments]);

    const response = await request(app).get('/comments/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockComments);
  });

  it('should return 400 when comment content is null', async () => {
    const response = await request(app)
      .post('/comments')
      .send({ pollId: 1, userId: 1, content: null });
  
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid request' });
  });
  
});