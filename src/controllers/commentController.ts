import { Request, Response } from 'express';
import { pool } from '../config/dbConfig';

export const addComment = async (req: Request, res: Response) => {
  const { pollId, userId, content } = req.body;
  try {
    if (!pollId || !userId || !content) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    const [results] = await pool.query(
      'INSERT INTO comments (poll_id, user_id, content) VALUES (?, ?, ?)',
      [pollId, userId, content]
    );

    res.status(201).json({
      id: (results as any).insertId,
      pollId,
      userId,
      content,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};


export const getComments = async (req: Request, res: Response) => {
  const pollId = req.params.pollId;
  try {
    const [results] = await pool.query(
      'SELECT * FROM comments WHERE poll_id = ?',
      [pollId]
    );
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
