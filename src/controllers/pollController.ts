import { Request, Response } from 'express';
import { pool } from '../config/dbConfig';


export const getPolls = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM polls');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const createPoll = async (req: Request, res: Response) => {
    const { title, description, poll_type_id, user_id } = req.body;

    if (!title || !description || !poll_type_id || !user_id) {
        res.status(400).json({ error: 'Invalid request' });
        return;
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO polls (title, description, poll_type_id, user_id) VALUES (?, ?, ?, ?)',
            [title, description, poll_type_id, user_id]
        );
        res.status(201).json({ id: (result as any).insertId });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const votePoll = async (req: Request, res: Response) => {
    const { poll_id, option_id, user_id } = req.body;

    if (!poll_id || !option_id || !user_id) {
        res.status(400).json({ error: 'Invalid request' });
        return;
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO votes (poll_id, option_id, user_id) VALUES (?, ?, ?)',
            [poll_id, option_id, user_id]
        );
        res.status(201).json({ id: (result as any).insertId });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getPollResults = async (req: Request, res: Response) => {
    const { poll_id } = req.params;

    try {
        const [rows] = await pool.query(
            'SELECT option_id, COUNT(*) as votes FROM votes WHERE poll_id = ? GROUP BY option_id',
            [poll_id]
        );
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};