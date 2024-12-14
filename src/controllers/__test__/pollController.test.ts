import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { pool } from '../../config/dbConfig';
import pollRoutes from '../../routes/pollRoutes';
import { option } from 'yargs';


const app = express();
app.use(bodyParser.json());

app.use('/api', pollRoutes);

jest.mock('../../config/dbConfig', () => {
    const mockPool = {
        query: jest.fn(),
    };
    return { pool: mockPool };
});


describe('Poll Controller', () => {
    const mockPoll = { id: 1, title: 'My test poll', description: `It's just a test poll`, poll_type_id: 1, user_id: 1 };
    const mockVotePoll = { poll_id: 1, option_id: 1, user_id: 1 };

    it('should get all polls', async () => {
        const mockPolls = [mockPoll];
        (pool.query as jest.Mock).mockReturnValue([mockPolls]);

        const response = await request(app).get('/api/polls');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPolls);
    });

    // it('should return 500 when polls routes is called if there is an error', async () => {
    //     (pool.query as jest.Mock).mockRejectedValueOnce({
    //         message: 'Database error',
    //     } as never);

    //     const response = await request(app).get('/api/polls');

    //     expect(response.status).toBe(500);
    //     expect(response.body).toEqual({ error: 'Database error' });
    // });

    // it('should return status code 201 when a poll is successed created', async () => {
    //     const mockResult = { insertId: 2 };
    //     (pool.query as jest.Mock).mockReturnValue([mockResult]);

    //     const response = await request(app).post('/api/polls').send({
    //         ...mockPoll,
    //         id: undefined
    //     });

    //     expect(response.status).toBe(201);
    //     expect(response.body).toEqual({ id: 2 });
    // });

    // it('should return status code 400 when is missing some information in post polls call', async () => {
    //     const response = await request(app).post('/api/polls').send({
    //         ...mockPoll,
    //         id: undefined,
    //         title: undefined
    //     });

    //     expect(response.status).toBe(400);
    //     expect(response.body).toEqual({ error: 'Invalid request' });
    // });

    // it('should return status code 201 when a vote poll is success', async () => {

    //     const mockResult = { insertId: 1 };
    //     (pool.query as jest.Mock).mockReturnValue([mockResult]);

    //     const response = await request(app).post('/api/polls/vote').send(
    //         mockVotePoll
    //     );

    //     expect(response.status).toBe(201);
    //     expect(response.body).toEqual({ id: 1 });
    // });

    // it('should return status code 400 when is missing some information in post vote call', async () => {
    //     const response = await request(app).post('/api/polls').send({
    //         ...mockVotePoll,
    //         poll_id: undefined
    //     });

    //     expect(response.status).toBe(400);
    //     expect(response.body).toEqual({ error: 'Invalid request' });
    // });

    // it('should return status code 200 when getPollResults is success', async () => {
    //     const pollId = 1;
    //     const mockResult = { option_id: 1, count: 10 };
    //     (pool.query as jest.Mock).mockReturnValue([mockResult]);

    //     const response = await request(app).get(`/api/polls/${pollId}/results`);

    //     expect(response.status).toBe(200);
    //     expect(response.body).toEqual(mockResult);
    // });

});