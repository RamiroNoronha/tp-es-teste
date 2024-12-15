import express from 'express';
import { addComment, getComments } from '../controllers/commentController';

const router = express.Router();

router.post('/comments', addComment);
router.get('/comments/:pollId', getComments);

export default router;