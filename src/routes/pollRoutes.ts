import { Router } from 'express';
import { getPolls, createPoll, votePoll, getPollResults, deletePoll, setPollExpiration, setPollOptions, getPollOptions } from '../controllers/pollController';
import { DataSource } from 'typeorm';

const createPollRoutes = (dataSource: DataSource) => {
    const router = Router();

    router.get('/polls', getPolls(dataSource));
    router.post('/polls', createPoll(dataSource));
    router.post('/polls/vote', votePoll(dataSource));
    router.get('/polls/:poll_id/results', getPollResults(dataSource));
    router.post('/polls/expire/:poll_id', setPollExpiration(dataSource));
    router.delete('/polls/:poll_id', deletePoll(dataSource));
    router.post('/polls/:poll_id/options', setPollOptions(dataSource));
    router.get('/polls/:poll_id/options', getPollOptions(dataSource)); // New route for getting poll options

    return router;
};

export default createPollRoutes;