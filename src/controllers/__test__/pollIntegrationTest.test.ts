import { formatDateForComparison } from '../../utils/formatString';
import { DataSource } from 'typeorm';
import request from 'supertest';
import bodyParser from 'body-parser';
import express from 'express';
import pollRoutes from '../../routes/pollRoutes';
import { beforeAll, afterAll, describe, expect, it } from '@jest/globals';
import { Polls } from '../../entities/poll';
import testConfig from '../../config/dbConfigTest';
import pollsTable from './__slug__/pollsTable';

const app = express();
app.use(bodyParser.json());

describe('Integration tests - Polls', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource(testConfig);
    await dataSource.initialize();
    app.use('/api', pollRoutes(dataSource));

    const pollRepository = dataSource.getRepository(Polls);
    for (const poll of pollsTable) {
      const newPoll = pollRepository.create(poll);
      await pollRepository.save(newPoll);
    }
  });

  afterAll(async () => {
    await dataSource.destroy();
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
});