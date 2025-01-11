import { Router } from 'express';
import { addComment, getComments } from '../controllers/commentController';
import { DataSource } from 'typeorm';

const createCommentRoutes = (dataSource: DataSource) => {
    const router = Router();

    router.post('/comments', addComment(dataSource));
    router.get('/comments/:pollId', getComments(dataSource));

    return router;
};

export default createCommentRoutes;