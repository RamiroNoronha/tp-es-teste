import { formatDateForComparison } from '../../utils/formatString';
import { DataSource } from 'typeorm';
import request from 'supertest';
import bodyParser from 'body-parser';
import express from 'express';
import pollRoutes from '../../routes/pollRoutes';
import commentRoutes from '../../routes/commentRoutes';
import userRoutes from '../../routes/userRoutes';
import { beforeAll, afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import { Polls } from '../../entities/poll';
import { PollOptions } from '../../entities/pollOption';
import { Votes } from '../../entities/vote';
import { Comments } from '../../entities/comments';
import { Users } from '../../entities/user';
import testConfig from '../../config/dbConfigTest';
import pollsTable from './__slug__/pollsTable';
import pollOptionsTable from './__slug__/pollOptionsTable';
import pollVotesTable from './__slug__/pollVotesTable';
import commentsTable from './__slug__/commentsTable';
import usersTable from './__slug__/usersTable';

const app = express();
app.use(bodyParser.json());

describe('Integration tests - General', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource(testConfig);
    await dataSource.initialize();
    app.use('/api', pollRoutes(dataSource));
    app.use('/api', commentRoutes(dataSource));
    app.use('/api', userRoutes(dataSource));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    const pollRepository = dataSource.getRepository(Polls);
    const pollOptionsRepository = dataSource.getRepository(PollOptions);
    const pollVotesRepository = dataSource.getRepository(Votes);
    const commentsRepository = dataSource.getRepository(Comments);
    const userRepository = dataSource.getRepository(Users);

    await pollVotesRepository.clear();
    await pollOptionsRepository.clear();
    await pollRepository.clear();
    await commentsRepository.clear();
    await userRepository.clear();

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

    for (const comment of commentsTable) {
      const newComment = commentsRepository.create(comment);
      await commentsRepository.save(newComment);
    }

    for (const user of usersTable) {
      const newUser = userRepository.create(user);
      await userRepository.save(newUser);
    }
  });

  it('Should add a poll, set options, vote, and comment successfully', async () => {
    const newPollToAdd = {
      title: 'Integration Test Poll',
      description: 'This is an integration test poll',
      poll_type_id: 2,
      user_id: 1,
    };

    const addPollResponse = await request(app).post('/api/polls').send(newPollToAdd);
    expect(addPollResponse.status).toBe(201);
    expect(addPollResponse.body).toHaveProperty('id');
    const pollId = addPollResponse.body.id;

    const options = ['Option 1', 'Option 2'];
    const setOptionsResponse = await request(app).post(`/api/polls/${pollId}/options`).send({
      poll_id: pollId,
      user_id: 1,
      options
    });
    expect(setOptionsResponse.status).toBe(200);
    expect(setOptionsResponse.body).toEqual({ message: 'Poll options set successfully' });

    const voteResponse = await request(app).post('/api/polls/vote').send({
      poll_id: pollId,
      option_id: 1,
      user_id: 1
    });
    expect(voteResponse.status).toBe(201);

    const resultsResponse = await request(app).get(`/api/polls/${pollId}/results`);
    expect(resultsResponse.status).toBe(200);
    expect(resultsResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ option_id: 1, votes: 1 })
      ])
    );

    const commentResponse = await request(app).post('/api/comments').send({
      pollId: pollId,
      user_id: 1,
      content: 'This is a test comment'
    });
    console.log(pollId)
    expect(commentResponse.status).toBe(201);
    expect(commentResponse.body).toEqual({
      id: expect.any(Number),
      pollId: pollId,
      user_id: 1,
      content: 'This is a test comment'
    });

    const commentsResponse = await request(app).get(`/api/comments/${pollId}`);
    expect(commentsResponse.status).toBe(200);
    expect(commentsResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ content: 'This is a test comment' })
      ])
    );
  });
});