import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { dataSource } from '../../config/dbConfig';
import pollRoutes from '../../routes/pollRoutes';


const app = express();
app.use(bodyParser.json());

app.use('/api', pollRoutes(dataSource));

jest.mock('../../config/dbConfig', () => {
    const mockDataSource = {
        query: jest.fn(),
    };
    return { dataSource: mockDataSource };
});


describe('Poll Controller', () => {
    const mockPoll = { id: 1, title: 'My test poll', description: "It's just a test poll", poll_type_id: 1, user_id: 1 };
    const mockVotePoll = { poll_id: 1, option_id: 1, user_id: 1 };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should get all poll results successfully', async () => {
        const mockPolls = [mockPoll];
        (dataSource.query as jest.Mock).mockReturnValue(mockPolls);

        const response = await request(app).get('/api/polls');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPolls);
    });

    it('should return 500 when there is a database error while getting polls', async () => {
        (dataSource.query as jest.Mock).mockRejectedValueOnce({
            message: 'Database error',
        } as never);

        const response = await request(app).get('/api/polls');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });

    it('should create a poll successfully', async () => {
        const mockResult = { insertId: 2 };
        (dataSource.query as jest.Mock).mockReturnValue(mockResult);

        const response = await request(app).post('/api/polls').send({
            ...mockPoll,
            id: undefined
        });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ id: 2 });
    });

    it('should return 400 when creating a poll with missing information', async () => {
        const response = await request(app).post('/api/polls').send({
            ...mockPoll,
            id: undefined,
            title: undefined
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should allow voting on a poll successfully', async () => {

        const mockDate = { expiration_date: null };
        const mockResult = { insertId: 1 };
        (dataSource.query as jest.Mock).mockReturnValueOnce([mockDate])
            .mockReturnValueOnce([mockResult]);

        const response = await request(app).post('/api/polls/vote').send(
            mockVotePoll
        );

        expect(response.status).toBe(201);
    });

    it('should return 400 when trying to vote on an expired poll', async () => {

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString();

        const mockDate = { closed_at: yesterdayString };
        const mockResult = { insertId: 1 };
        (dataSource.query as jest.Mock).mockReturnValueOnce([mockDate])
            .mockReturnValueOnce([mockResult]);

        const response = await request(app).post('/api/polls/vote').send(
            mockVotePoll
        );

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Poll has expired' });
    });

    it('should return 400 when voting on a poll with missing information', async () => {
        const response = await request(app).post('/api/polls/vote').send(
            {
                ...mockVotePoll,
                poll_id: undefined
            }
        );

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should get poll results successfully', async () => {
        const mockResult = { option_id: 1, count: 10 };
        (dataSource.query as jest.Mock).mockReturnValue(mockResult);

        const response = await request(app).get("/api/polls/${pollId}/results");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockResult);
    });

    it('should return 404 when trying to vote on a non-existent poll', async () => {

        (dataSource.query as jest.Mock).mockReturnValueOnce([]);

        const response = await request(app).post('/api/polls/vote').send(
            mockVotePoll
        );

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Poll not found' });
    });


    it('should return 400 when deleting a poll with missing user id', async () => {
        const deleteResponse = await request(app)
            .delete('/api/polls/1')
            .send({});

        expect(deleteResponse.status).toBe(400);
        expect(deleteResponse.body).toEqual({ message: 'Poll ID and User ID are required' });
    });

    it('should return 404 when trying to delete a non-existent poll', async () => {
        (dataSource.query as jest.Mock)
            .mockReturnValueOnce([]);

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

        (dataSource.query as jest.Mock)
            .mockReturnValueOnce(mockPolls)
            .mockReturnValueOnce({ user_id: 1 });

        const deleteResponse = await request(app)
            .delete('/api/polls/1')
            .send({ user_id: 2 });

        expect(deleteResponse.status).toBe(403);
        expect(deleteResponse.body).toEqual({ message: 'You are not authorized to delete this poll' });
    });

    it('should delete a poll successfully when the user is authorized', async () => {
        const mockPolls = [
            { id: 1, title: 'Poll 1', description: 'Description 1', poll_type_id: 1, user_id: 1 },
        ];

        (dataSource.query as jest.Mock)
            .mockReturnValueOnce(mockPolls)
            .mockReturnValueOnce({ user_id: 1 });

        const deleteResponse = await request(app)
            .delete('/api/polls/1')
            .send({ user_id: 1 });

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body).toEqual({ message: 'Poll deleted successfully' });
    });

    it('should return 400 when setting poll expiration with missing information', async () => {

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const mockBody = { user_id: 1, expiration_date: undefined };

        const response = await request(app).post("/api/polls/expire/${pollId}").send(mockBody);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Poll ID, User ID, and Expiration Date are required' });
    });

    it('should return 403 when the user is not authorized to set poll expiration', async () => {

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString();

        const mockBody = { user_id: 1, closed_at: yesterdayString };
        const mockResult = { user_id: 2 };

        (dataSource.query as jest.Mock).mockReturnValue(mockResult);

        const response = await request(app).post("/api/polls/expire/${pollId}").send(mockBody);

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: 'You are not authorized to update this poll' });
    });

    it('should return 404 when trying to set expiration for a non-existent poll', async () => {

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString();

        const mockBody = { user_id: 1, closed_at: yesterdayString };

        (dataSource.query as jest.Mock).mockReturnValue(undefined);

        const response = await request(app).post("/api/polls/expire/${pollId}").send(mockBody);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Poll not found' });
    });

    it('should set poll expiration successfully when the user is authorized', async () => {

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString();

        const mockBody = { user_id: 1, closed_at: yesterdayString };
        const mockResult = { user_id: 1 };

        (dataSource.query as jest.Mock)
            .mockReturnValueOnce(mockResult)
            .mockReturnValueOnce(undefined);

        const response = await request(app).post("/api/polls/expire/${pollId}").send(mockBody);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Poll expiration date set successfully' });
    });

    it('should set poll options successfully', async () => {
        const mockPoll = { id: 1, user_id: 1, closed_at: null };
        const mockOptions = ['Option 1', 'Option 2'];

        (dataSource.query as jest.Mock)
            .mockReturnValueOnce([mockPoll])
            .mockReturnValueOnce([])
            .mockReturnValueOnce([])
            .mockReturnValueOnce([]);

        const response = await request(app).post('/api/polls/1/options').send({
            poll_id: 1,
            user_id: 1,
            options: mockOptions
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Poll options set successfully' });
    });

    it('should return 404 when trying to set options for a non-existent poll', async () => {
        const mockOptions = ['Option 1', 'Option 2'];

        (dataSource.query as jest.Mock).mockReturnValueOnce([]);

        const response = await request(app).post('/api/polls/1/options').send({
            poll_id: 1,
            user_id: 1,
            options: mockOptions
        });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Poll not found' });
    });

    it('should return 403 when trying to set options for a poll owned by another user', async () => {
        const mockPoll = { id: 1, user_id: 2, expiration_date: null };
        const mockOptions = ['Option 1', 'Option 2'];

        (dataSource.query as jest.Mock).mockReturnValueOnce([mockPoll]);

        const response = await request(app).post('/api/polls/1/options').send({
            poll_id: 1,
            user_id: 1,
            options: mockOptions
        });

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: 'You are not authorized to set options for this poll' });
    });

    it('should return 400 when trying to set options for an expired poll', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const mockPoll = { id: 1, user_id: 1, closed_at: yesterday.toISOString() };
        const mockOptions = ['Option 1', 'Option 2'];

        (dataSource.query as jest.Mock).mockReturnValueOnce([mockPoll]);

        const response = await request(app).post('/api/polls/1/options').send({
            poll_id: 1,
            user_id: 1,
            options: mockOptions
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Poll has expired' });
    });

    it('should get poll options successfully', async () => {
        const mockOptions = [
            { id: 1, poll_id: 1, option_text: 'Option 1' },
            { id: 2, poll_id: 1, option_text: 'Option 2' }
        ];

        (dataSource.query as jest.Mock).mockReturnValueOnce(mockOptions);

        const response = await request(app).get('/api/polls/1/options');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockOptions);
    });

    it('should return 404 when no options are found for the poll', async () => {
        (dataSource.query as jest.Mock).mockReturnValueOnce([]);

        const response = await request(app).get('/api/polls/1/options');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'No options found for this poll' });
    });

    it('should return 500 when there is a database error while getting poll options', async () => {
        (dataSource.query as jest.Mock).mockRejectedValueOnce({
            message: 'Database error',
        } as never);

        const response = await request(app).get('/api/polls/1/options');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });

});