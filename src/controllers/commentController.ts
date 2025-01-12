import { Request, Response } from 'express';
import { DataSource } from 'typeorm';

export const addComment = (dataSource: DataSource) => async (req: Request, res: Response) => {
  const { pollId, user_id, content } = req.body;
  try {
    if (!pollId || !user_id || !content) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    const result = await dataSource.query(
      'INSERT INTO comments (poll_id, user_id, content, created_at) VALUES (?, ?, ?, ?)',
      [pollId, user_id, content, new Date()]
    );
    const newId = result?.insertId ?? result;
    res.status(201).json({
      id: newId,
      pollId,
      user_id,
      content,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};


export const getComments = (dataSource: DataSource) => async (req: Request, res: Response) => {
  const pollId = req.params.pollId;
  try {
    const results = await dataSource.query(
      'SELECT * FROM comments WHERE poll_id = ?',
      [pollId]
    );
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
