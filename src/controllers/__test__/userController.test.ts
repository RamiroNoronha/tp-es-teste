import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { pool } from '../../config/dbConfig';
import userRoutes from '../../routes/userRoutes';


const app = express();
app.use(bodyParser.json());

app.use('/api', userRoutes);

jest.mock('../../config/dbConfig', () => {
    const mockPool = {
        query: jest.fn(),
    };
    return { pool: mockPool };
});

describe('User Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get all users', async () => {
        const mockUsers = [{ id: 1, username: 'user1', password: 'pass1' }];
        (pool.query as jest.Mock).mockReturnValue([mockUsers]);

        const response = await request(app).get('/api/users');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUsers);
    });

    // it('should return 500 when users routes is called if there is an error', async () => {
    //     (pool.query as jest.Mock).mockRejectedValueOnce({
    //         message: 'Database error',
    //     } as never);

    //     const response = await request(app).get('/api/users');

    //     expect(response.status).toBe(500);
    //     expect(response.body).toEqual({ error: 'Database error' });
    // });

    // it('should create a new user', async () => {
    //     const newUser = { username: 'user2', password: 'pass2' };
    //     (pool.query as jest.Mock).mockReturnValue([{ insertId: 2 }]);

    //     const response = await request(app)
    //         .post('/api/users')
    //         .send(newUser);

    //     expect(response.status).toBe(201);
    //     expect(response.body).toEqual({ id: 2 });
    // });

    // it('should return status code 400 when username is undefined in the post route users', async () => {
    //     const newUser = { password: 'pass2' };

    //     const response = await request(app)
    //         .post('/api/users')
    //         .send(newUser);

    //     expect(response.status).toBe(400);
    //     expect(response.body).toEqual({ error: 'Invalid request' });
    // });

    // it('should return status code 400 when password is undefined in the post route users', async () => {
    //     const newUser = { username: 'user2', };

    //     const response = await request(app)
    //         .post('/api/users')
    //         .send(newUser);

    //     expect(response.status).toBe(400);
    //     expect(response.body).toEqual({ error: 'Invalid request' });
    // });

    // it('should return 500 when users post routes is called if there is an error', async () => {
    //     const newUser = { username: 'user2', password: 'pass2' };

    //     (pool.query as jest.Mock).mockRejectedValueOnce({
    //         message: 'Database error',
    //     } as never);

    //     const response = await request(app).post('/api/users').send(newUser);

    //     expect(response.status).toBe(500);
    //     expect(response.body).toEqual({ error: 'Database error' });
    // });

    // it('should get a specific user when call getUserById with a existet user', async () => {
    //     const mockUsers = [{ id: 1, username: 'user1', password: 'pass1' }];
    //     (pool.query as jest.Mock).mockReturnValue([mockUsers]);

    //     const userId = 1;
    //     const response = await request(app).get(`/api/users/${userId}`);

    //     expect(response.status).toBe(200);
    //     expect(response.body).toEqual(mockUsers[0]);
    // });

    // it('should return status code 404 when the user is not founded', async () => {
    //     (pool.query as jest.Mock).mockReturnValue([[]]);

    //     const userId = 1;
    //     const response = await request(app).get(`/api/users/${userId}`);

    //     expect(response.status).toBe(404);
    //     expect(response.body).toEqual({ error: 'User not found' });
    // });

    // it('should return status code 200 when affectedRows is bigger then 0', async () => {
    //     const updatedUser = { username: 'user2', password: 'pass2' };
    //     const userId = 1;
    //     (pool.query as jest.Mock).mockReturnValue([{ affectedRows: 1 }]);

    //     const response = await request(app)
    //         .put(`/api/users/${userId}`)
    //         .send(updatedUser);

    //     expect(response.status).toBe(200);
    //     expect(response.body).toEqual({ message: 'User updated successfully' });
    // });

    // it('should return status code 404 when has no affectedRows', async () => {
    //     const updatedUser = { username: 'user2', password: 'pass2' };
    //     const userId = 1;
    //     (pool.query as jest.Mock).mockReturnValue([{ affectedRows: 0 }]);

    //     const response = await request(app)
    //         .put(`/api/users/${userId}`)
    //         .send(updatedUser);

    //     expect(response.status).toBe(404);
    //     expect(response.body).toEqual({ error: 'User not found' });
    // });

    // it('should return status code 400 when has no username neither password', async () => {
    //     const updatedUser = {};
    //     const userId = 1;

    //     const response = await request(app)
    //         .put(`/api/users/${userId}`)
    //         .send(updatedUser);

    //     expect(response.status).toBe(400);
    //     expect(response.body).toEqual({ error: 'Invalid request' });
    // });

    // it('should return status code 200 when has one affectedRows when deleting a user', async () => {
    //     const userId = 1;
    //     (pool.query as jest.Mock).mockReturnValue([{ affectedRows: 1 }]);

    //     const response = await request(app)
    //         .delete(`/api/users/${userId}`);

    //     expect(response.status).toBe(200);
    //     expect(response.body).toEqual({ message: 'User deleted successfully' });
    // });

    // it('should return status code 404 when has no affectedRows when deleting a user', async () => {
    //     const userId = 1;
    //     (pool.query as jest.Mock).mockReturnValue([{ affectedRows: 0 }]);

    //     const response = await request(app)
    //         .delete(`/api/users/${userId}`);

    //     expect(response.status).toBe(404);
    //     expect(response.body).toEqual({ error: 'User not found' });
    // });


});