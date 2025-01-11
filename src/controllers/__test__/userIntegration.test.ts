import { formatDateForComparison } from './../../utils/formatString';
import { DataSource } from 'typeorm';
import request from 'supertest';
import bodyParser from 'body-parser';
import express from 'express';
import userRoutes from '../../routes/userRoutes';
import { beforeAll, afterAll, describe, expect, it, jest } from '@jest/globals';
import { Users } from '../../entities/user';
import testConfig from '../../config/dbConfigTest';
const app = express();
app.use(bodyParser.json());

describe('Teste de Integração - Usuários', () => {
    let dataSource: DataSource;
    beforeAll(async () => {
        dataSource = new DataSource(testConfig);
        await dataSource.initialize();
        app.use('/api', userRoutes(dataSource));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    it('Deve criar e listar usuários', async () => {
        // Inserir um usuário no banco
        const userRepository = dataSource.getRepository(Users);
        const user = userRepository.create({
            id: 1, // Opcional; SQLite gerará automaticamente se omitido
            username: 'johndoe',
            password: 'securepassword',
            createdAt: new Date(),
        });
        await userRepository.save(user);


        const response = await request(app).get('/api/users');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                id: user.id,
                username: user.username,
                password: user.password,
                createdAt: formatDateForComparison(user.createdAt),
            }),
        );
    });
});
