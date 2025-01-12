import { DataSource } from 'typeorm';
import request from 'supertest';
import bodyParser from 'body-parser';
import express from 'express';
import commentsRoutes from '../../routes/commentRoutes';
import { beforeAll, afterAll, describe, expect, it } from '@jest/globals';
import { Users } from '../../entities/user';
import { Polls } from '../../entities/poll';
import { PollOptions } from '../../entities/pollOption';
import { Votes } from '../../entities/vote';
import testConfig from '../../config/dbConfigTest';
import pollsTable from './__slug__/pollsTable';
import pollOptionsTable from './__slug__/pollOptionsTable';
import pollVotesTable from './__slug__/pollVotesTable';

import commentsTable from './__slug__/commentsTable';
import { Comments } from '../../entities/comments';
import usersTable from './__slug__/usersTable';

const app = express();
app.use(bodyParser.json());

describe('Integration tests - Users', () => {
    const initializationDataBases = async (dataSource: DataSource): Promise<void> => {
        const pollRepository = dataSource.getRepository(Polls);
        const pollOptionsRepository = dataSource.getRepository(PollOptions);
        const pollVotesRepository = dataSource.getRepository(Votes);
        const userRepository = dataSource.getRepository(Users);

        for (const poll of pollsTable) {
            const newPoll = pollRepository.create(poll);
            await pollRepository.save(newPoll);
        }

        for (const option of pollOptionsTable) {
            const newOption = pollOptionsRepository.create(option);
            await pollOptionsRepository.save(newOption);
        }

        for (const vote of pollVotesTable) {
            const newVote = pollVotesRepository.create(vote);
            await pollVotesRepository.save(newVote);
        }

        for (const user of usersTable) {
            const newUser = userRepository.create(user);
            await userRepository.save(newUser);
        }
    };
    let dataSource: DataSource;

    beforeAll(async () => {
        dataSource = new DataSource(testConfig);
        await dataSource.initialize();
        app.use('/api', commentsRoutes(dataSource));
        await initializationDataBases(dataSource);
        const commentsRepository = dataSource.getRepository(Comments);
        for (const comment of commentsTable) {
            const newComment = commentsRepository.create(comment);
            await commentsRepository.save(newComment);
        }
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    it('Should insert a new comment correctly', async () => {
        const response = await request(app).post('/api/comments').send({ pollId: 1, user_id: 1, content: "Comentário de teste" });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ id: 11, pollId: 1, user_id: 1, content: "Comentário de teste" });

        const allComments = await dataSource.getRepository(Comments).find();

        expect(allComments.find((comment) => comment.id === 11)).toBeTruthy();
    });

    it('Should get all comments from a specific poll', async () => {
        const response = await request(app).get('/api/comments/1');

        expect(response.status).toBe(200);

        const allComments = await dataSource.getRepository(Comments).find();
        const commentsForPollIdOne = allComments.filter((comment) => comment.poll_id === 1);
        expect(response.body.length).toEqual(commentsForPollIdOne.length);
    });

});
