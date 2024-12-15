import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { pool } from '../../config/dbConfig';
import pollRoutes from '../../routes/pollRoutes';


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
    const mockPoll = { id: 1, title: 'My test poll', description: "It's just a test poll", poll_type_id: 1, user_id: 1 };
    const mockVotePoll = { poll_id: 1, option_id: 1, user_id: 1 };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should get all polls', async () => {
        const mockPolls = [mockPoll];
        (pool.query as jest.Mock).mockReturnValue([mockPolls]);

        const response = await request(app).get('/api/polls');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPolls);
    });

    it('should return 500 when polls routes is called if there is an error', async () => {
        (pool.query as jest.Mock).mockRejectedValueOnce({
            message: 'Database error',
        } as never);

        const response = await request(app).get('/api/polls');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });

    it('should return status code 201 when a poll is successed created', async () => {
        const mockResult = { insertId: 2 };
        (pool.query as jest.Mock).mockReturnValue([mockResult]);

        const response = await request(app).post('/api/polls').send({
            ...mockPoll,
            id: undefined
        });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ id: 2 });
    });

    it('should return status code 400 when is missing some information in post polls call', async () => {
        const response = await request(app).post('/api/polls').send({
            ...mockPoll,
            id: undefined,
            title: undefined
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should return status code 201 when a vote poll is success', async () => {

        const mockDate = { expiration_date: null };
        const mockResult = { insertId: 1 };
        (pool.query as jest.Mock).mockReturnValueOnce([mockDate])
            .mockReturnValueOnce([mockResult]);

        const response = await request(app).post('/api/polls/vote').send(
            mockVotePoll
        );

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ id: 1 });
    });

    it('should return 400 when poll is expired', async () => {

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString();

        const mockDate = { expiration_date: yesterdayString };
        const mockResult = { insertId: 1 };
        (pool.query as jest.Mock).mockReturnValueOnce([mockDate])
            .mockReturnValueOnce([mockResult]);

        const response = await request(app).post('/api/polls/vote').send(
            mockVotePoll
        );

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Poll has expired' });
    });

    it('should return status code 400 when is missing a body property when call polls/vote route', async () => {
        const response = await request(app).post('/api/polls/vote').send(
            {
                ...mockVotePoll,
                poll_id: undefined
            }
        );

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should return status code 200 when getPollResults is success', async () => {
        const pollId = 1;
        const mockResult = { option_id: 1, count: 10 };
        (pool.query as jest.Mock).mockReturnValue([mockResult]);

        const response = await request(app).get("/api/polls/${pollId}/results");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockResult);
    });

    it('should return status code 404 when a vote poll_id not finded in the query', async () => {

        (pool.query as jest.Mock).mockReturnValueOnce([]);

        const response = await request(app).post('/api/polls/vote').send(
            mockVotePoll
        );

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Poll not found' });
    });


    it('should return 400 when the body is missing the user id in delete operator for a poll', async () => {
        const deleteResponse = await request(app)
            .delete('/api/polls/1')
            .send({});

        expect(deleteResponse.status).toBe(400);
        expect(deleteResponse.body).toEqual({ message: 'Poll ID and User ID are required' });
    });

    it('should return 404 when trying to delete a poll from a user that not have any poll', async () => {
        (pool.query as jest.Mock)
            .mockReturnValueOnce([[]]);

        const deleteResponse = await request(app)
            .delete('/api/polls/1')
            .send({ user_id: 1 });

        expect(deleteResponse.status).toBe(404);
        expect(deleteResponse.body).toEqual({ message: 'Poll not found' });
    });

    it('should return 403 when trying to delete a poll from another user', async () => {
        const mockPolls = [
            { id: 1, title: 'Poll 1', description: 'Description 1', poll_type_id: 1, user_id: 1 },
        ];

        (pool.query as jest.Mock)
            .mockReturnValueOnce([mockPolls])
            .mockReturnValueOnce([{ user_id: 1 }]);

        const deleteResponse = await request(app)
            .delete('/api/polls/1')
            .send({ user_id: 2 });

        expect(deleteResponse.status).toBe(403);
        expect(deleteResponse.body).toEqual({ message: 'You are not authorized to delete this poll' });
    });

    it('should return 200 when a user try to delete his poll', async () => {
        const mockPolls = [
            { id: 1, title: 'Poll 1', description: 'Description 1', poll_type_id: 1, user_id: 1 },
        ];

        (pool.query as jest.Mock)
            .mockReturnValueOnce([mockPolls])
            .mockReturnValueOnce([{ user_id: 1 }]);

        const deleteResponse = await request(app)
            .delete('/api/polls/1')
            .send({ user_id: 1 });

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body).toEqual({ message: 'Poll deleted successfully' });
    });

    it('should return status code 400 when body for expire route is missing some information', async () => {
        const pollId = 1;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const mockBody = { user_id: 1, expiration_date: undefined };

        const response = await request(app).post("/api/polls/expire/${pollId}").send(mockBody);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Poll ID, User ID, and Expiration Date are required' });
    });

    it('should return status code 403 when the usuary is not authorized to update the poll', async () => {
        const pollId = 1;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString();

        const mockBody = { user_id: 1, expiration_date: yesterdayString };
        const mockResult = { user_id: 2 };

        (pool.query as jest.Mock).mockReturnValue([mockResult]);

        const response = await request(app).post("/api/polls/expire/${pollId}").send(mockBody);

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: 'You are not authorized to update this poll' });
    });

    it('should return status code 404 when the poll is not finded', async () => {
        const pollId = 1;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString();

        const mockBody = { user_id: 1, expiration_date: yesterdayString };

        (pool.query as jest.Mock).mockReturnValue([]);

        const response = await request(app).post("/api/polls/expire/${pollId}").send(mockBody);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Poll not found' });
    });

    it('should return status code 200 when the usuary is authorized to update the poll', async () => {
        const pollId = 1;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString();

        const mockBody = { user_id: 1, expiration_date: yesterdayString };
        const mockResult = { user_id: 1 };

        (pool.query as jest.Mock)
            .mockReturnValueOnce([mockResult])
            .mockReturnValueOnce([]);

        const response = await request(app).post("/api/polls/expire/${pollId}").send(mockBody);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Poll expiration date set successfully' });
    });
});