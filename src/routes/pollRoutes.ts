import { Router } from 'express';
import { getPolls, createPoll, votePoll, getPollResults, deletePoll } from '../controllers/pollController';

const router = Router();

router.get('/polls', getPolls);
router.post('/polls', createPoll);
router.post('/polls/vote', votePoll);
router.get('/polls/:poll_id/results', getPollResults);
router.delete('/polls/:poll_id', deletePoll);

export default router;