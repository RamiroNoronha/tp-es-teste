import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { dataSource } from '../../config/dbConfig';
import userRoutes from '../../routes/userRoutes';


const app = express();
app.use(bodyParser.json());

app.use('/api', userRoutes(dataSource));

jest.mock('../../config/dbConfig', () => {
    const mockDataSource = {
        query: jest.fn(),
    };
    return { dataSource: mockDataSource };
});

describe('User Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get all users successfully', async () => {
        const mockUsers = [{ id: 1, username: 'user1', password: 'pass1' }];
        (dataSource.query as jest.Mock).mockReturnValue([mockUsers]);

        const response = await request(app).get('/api/users');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUsers);
    });

    it('should return 500 when there is a database error while getting users', async () => {
        (dataSource.query as jest.Mock).mockRejectedValueOnce({
            message: 'Database error',
        } as never);

        const response = await request(app).get('/api/users');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });

    it('should create a new user successfully', async () => {
        const newUser = { username: 'user2', password: 'pass2' };
        (dataSource.query as jest.Mock).mockReturnValue([{ insertId: 2 }]);

        const response = await request(app)
            .post('/api/users')
            .send(newUser);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ id: 2 });
    });

    it('should return 400 when creating a user with missing username', async () => {
        const newUser = { password: 'pass2' };

        const response = await request(app)
            .post('/api/users')
            .send(newUser);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should return 400 when creating a user with missing password', async () => {
        const newUser = { username: 'user2', };

        const response = await request(app)
            .post('/api/users')
            .send(newUser);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should return 500 when there is a database error while creating a user', async () => {
        const newUser = { username: 'user2', password: 'pass2' };

        (dataSource.query as jest.Mock).mockRejectedValueOnce({
            message: 'Database error',
        } as never);

        const response = await request(app).post('/api/users').send(newUser);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });

    it('should get a specific user by ID successfully', async () => {
        const mockUsers = [{ id: 1, username: 'user1', password: 'pass1' }];
        (dataSource.query as jest.Mock).mockReturnValue([mockUsers]);

        const userId = 1;
        const response = await request(app).get(`/api/users/${userId}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUsers[0]);
    });

    it('should return 404 when the user is not found', async () => {
        (dataSource.query as jest.Mock).mockReturnValue([[]]);

        const userId = 1;
        const response = await request(app).get(`/api/users/${userId}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should update a user successfully when affectedRows is greater than 0', async () => {
        const updatedUser = { username: 'user2', password: 'pass2' };
        const userId = 1;
        (dataSource.query as jest.Mock).mockReturnValue([{ affectedRows: 1 }]);

        const response = await request(app)
            .put(`/api/users/${userId}`)
            .send(updatedUser);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'User updated successfully' });
    });

    it('should return 404 when updating a user that does not exist', async () => {
        const updatedUser = { username: 'user2', password: 'pass2' };
        const userId = 1;
        (dataSource.query as jest.Mock).mockReturnValue([{ affectedRows: 0 }]);

        const response = await request(app)
            .put(`/api/users/${userId}`)
            .send(updatedUser);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should return 400 when updating a user with missing username and password', async () => {
        const updatedUser = {};
        const userId = 1;

        const response = await request(app)
            .put(`/api/users/${userId}`)
            .send(updatedUser);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should delete a user successfully when affectedRows is greater than 0', async () => {
        const userId = 1;
        (dataSource.query as jest.Mock).mockReturnValue([{ affectedRows: 1 }]);

        const response = await request(app)
            .delete(`/api/users/${userId}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'User deleted successfully' });
    });

    it('should return 404 when deleting a user that does not exist', async () => {
        const userId = 1;
        (dataSource.query as jest.Mock).mockReturnValue([{ affectedRows: 0 }]);

        const response = await request(app)
            .delete(`/api/users/${userId}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'User not found' });
    });


});