import { formatDateForComparison } from '../../utils/formatString';
import { DataSource } from 'typeorm';
import request from 'supertest';
import bodyParser from 'body-parser';
import express from 'express';
import pollRoutes from '../../routes/pollRoutes';
import { beforeAll, afterAll, afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { Polls } from '../../entities/poll';
import { PollOptions } from '../../entities/pollOption';
import { Votes } from '../../entities/vote';
import testConfig from '../../config/dbConfigTest';
import pollsTable from './__slug__/pollsTable';
import pollOptionsTable from './__slug__/pollOptionsTable';
import pollVotesTable from './__slug__/pollVotesTable';

const app = express();
app.use(bodyParser.json());

describe('Integration tests - Polls', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource(testConfig);
    await dataSource.initialize();
    app.use('/api', pollRoutes(dataSource));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    const pollRepository = dataSource.getRepository(Polls);
    const pollOptionsRepository = dataSource.getRepository(PollOptions);
    const pollVotesRepository = dataSource.getRepository(Votes);

    await pollVotesRepository.clear();
    await pollOptionsRepository.clear();
    await pollRepository.clear();

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
  });

  afterEach(async () => {
    const pollRepository = dataSource.getRepository(Polls);
    const pollOptionsRepository = dataSource.getRepository(PollOptions);
    const pollVotesRepository = dataSource.getRepository(Votes);

    await pollVotesRepository.clear();
    await pollOptionsRepository.clear();
    await pollRepository.clear();
  });

  it('Should get all the polls correctly', async () => {
    const response = await request(app).get('/api/polls');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining(
        pollsTable.map(poll => expect.objectContaining({
          id: poll.id,
          title: poll.title,
          description: poll.description,
          poll_type_id: poll.poll_type_id,
          user_id: poll.user_id,
          created_at: formatDateForComparison(poll.created_at),
          closed_at: poll.closed_at === null ? null : formatDateForComparison(poll.closed_at),
        }))
      )
    );
  });

  it('Should add a new poll correctly', async () => {
    const newPollToAdd = {
      title: 'New Poll',
      description: 'This is a new poll',
      poll_type_id: 2,
      user_id: 1,
    };

    const response = await request(app).post('/api/polls').send(newPollToAdd);

    expect(response.status).toBe(201);
  });

  it('Should set poll options successfully', async () => {
    const pollId = 1;
    const userId = 1;
    const options = ['Option 1', 'Option 2'];

    const response = await request(app).post(`/api/polls/${pollId}/options`).send({
      poll_id: pollId,
      user_id: userId,
      options
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Poll options set successfully' });

    const optionsResponse = await request(app).get(`/api/polls/${pollId}/options`);
    expect(optionsResponse.status).toBe(200);
    expect(optionsResponse.body).toEqual(
      expect.arrayContaining(
        options.map(option => expect.objectContaining({ option_text: option }))
      )
    );
  });

  it('Should vote for a poll option and update results', async () => {
    const pollId = 1;
    const optionId = 1;
    const userId = 5;

    const voteResponse = await request(app).post('/api/polls/vote').send({
      poll_id: pollId,
      option_id: optionId,
      user_id: userId
    });

    expect(voteResponse.status).toBe(201);

    const resultsResponse = await request(app).get(`/api/polls/${pollId}/results`);
    expect(resultsResponse.status).toBe(200);
    expect(resultsResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ option_id: optionId, votes: 3 })
      ])
    );
  });

  it('Should count the votes correctly', async () => {
    const pollId = 1;

    const resultsResponse = await request(app).get(`/api/polls/${pollId}/results`);
    expect(resultsResponse.status).toBe(200);
    expect(resultsResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ option_id: 1, votes: 2 }),
        expect.objectContaining({ option_id: 2, votes: 1 })
      ])
    );
  });

  it('Should return 404 when trying to set options for a non-existent poll', async () => {
    const pollId = 999;
    const userId = 1;
    const options = ['Option 1', 'Option 2'];

    const response = await request(app).post(`/api/polls/${pollId}/options`).send({
      poll_id: pollId,
      user_id: userId,
      options
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Poll not found' });
  });

  it('Should return 403 when trying to set options for a poll owned by another user', async () => {
    const pollId = 1;
    const userId = 2; 
    const options = ['Option 1', 'Option 2'];

    const response = await request(app).post(`/api/polls/${pollId}/options`).send({
      poll_id: pollId,
      user_id: userId,
      options
    });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'You are not authorized to set options for this poll' });
  });

});