import { formatDateForComparison } from '../../utils/formatString';
import { DataSource } from 'typeorm';
import request from 'supertest';
import bodyParser from 'body-parser';
import express from 'express';
import userRoutes from '../../routes/userRoutes';
import { beforeAll, afterAll, describe, expect, it, jest } from '@jest/globals';
import { Users } from '../../entities/user';
import testConfig from '../../config/dbConfigTest';
import usersTable from './__slug__/usersTable';

const app = express();
app.use(bodyParser.json());

describe('Integration tests - Users', () => {
    let dataSource: DataSource;

    beforeAll(async () => {
        dataSource = new DataSource(testConfig);
        await dataSource.initialize();
        app.use('/api', userRoutes(dataSource));

        const userRepository = dataSource.getRepository(Users);
        for (const user of usersTable) {
            const newUser = userRepository.create(user);
            await userRepository.save(newUser);
        }
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    it('Should get all the users correctly', async () => {
        const response = await request(app).get('/api/users');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.arrayContaining(
                usersTable.map(user => expect.objectContaining({
                    id: user.id,
                    username: user.username,
                    password: user.password,
                    createdAt: formatDateForComparison(user.createdAt),
                }))
            )
        );
    });

    it('Should insert the new user correctly', async () => {
        const newUserToAdd = {
            username: 'myNewUser',
            password: 'passwordNewUser',
        }

        const response = await request(app).post('/api/users').send(newUserToAdd);

        expect(response.status).toBe(201);
    });

    it('Should get the correct user by id', async () => {
        const selectUser = usersTable[0];

        const response = await request(app).get('/api/users/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            {
                id: selectUser.id,
                username: selectUser.username,
                password: selectUser.password,
                createdAt: formatDateForComparison(selectUser.createdAt),
            }
        );
    });
});