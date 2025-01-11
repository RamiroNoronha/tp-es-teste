import { Request, Response } from 'express';
import { dataSource } from '../config/dbConfig';
import { ResultSetHeader } from 'mysql2/promise';
import { DataSource } from 'typeorm';

interface Poll {
    user_id: number;
    expiration_date: Date;
}

export const getPolls = (dataSource: DataSource) => async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await dataSource.query('SELECT * FROM polls');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const createPoll = (dataSource: DataSource) => async (req: Request, res: Response): Promise<void> => {
    const { title, description, poll_type_id, user_id } = req.body;

    if (!title || !description || !poll_type_id || !user_id) {
        res.status(400).json({ error: 'Invalid request' });
        return;
    }

    try {
        const [result] = await dataSource.query(
            'INSERT INTO polls (title, description, poll_type_id, user_id) VALUES (?, ?, ?, ?)',
            [title, description, poll_type_id, user_id]
        );
        res.status(201).json({ id: (result as any).insertId });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const votePoll = (dataSource: DataSource) => async (req: Request, res: Response): Promise<void> => {
    const { poll_id, option_id, user_id } = req.body;

    if (!poll_id || !option_id || !user_id) {
        res.status(400).json({ error: 'Invalid request' });
        return;
    }

    try {
        const [poll] = await dataSource.query(
            'SELECT expiration_date FROM polls WHERE id = ?',
            [poll_id]
        );

        if (!poll) {
            res.status(404).json({ error: 'Poll not found' });
            return;
        }


        const expiration = (poll as any).expiration_date;
        const currentDate = new Date();
        if (expiration && new Date(expiration) < currentDate) {
            res.status(400).json({ error: 'Poll has expired' });
            return;
        }

        const [result] = await dataSource.query(
            'INSERT INTO votes (poll_id, option_id, user_id) VALUES (?, ?, ?)',
            [poll_id, option_id, user_id]
        );
        res.status(201).json({ id: (result as any).insertId });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getPollResults = (dataSource: DataSource) => async (req: Request, res: Response): Promise<void> => {
    const { poll_id } = req.params;

    try {
        const [rows] = await dataSource.query(
            'SELECT option_id, COUNT(*) as votes FROM votes WHERE poll_id = ? GROUP BY option_id',
            [poll_id]
        );
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const deletePoll = (dataSource: DataSource) => async (req: Request, res: Response): Promise<void> => {
    const { poll_id } = req.params;
    const { user_id } = req.body;

    try {
        if (!poll_id || !user_id) {
            res.status(400).json({ message: 'Poll ID and User ID are required' });
            return;
        }

        const pollIdNum = Number(poll_id);
        const userIdNum = Number(user_id);

        const [pollRows] = await dataSource.query(
            'SELECT user_id FROM polls WHERE id = ?',
            [pollIdNum]
        );

        const polls = pollRows as Poll[];

        if (polls.length === 0) {
            res.status(404).json({ message: 'Poll not found' });
            return;
        }

        const poll = polls[0];
        if (poll.user_id !== userIdNum) {
            res.status(403).json({ message: 'You are not authorized to delete this poll' });
            return;
        }

        await dataSource.query(
            'DELETE FROM polls WHERE id = ?',
            [pollIdNum]
        );

        res.status(200).json({ message: 'Poll deleted successfully' });
    } catch (error) {
        console.error('Delete poll error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
};

export const setPollExpiration = (dataSource: DataSource) => async (req: Request, res: Response): Promise<void> => {
    const { poll_id } = req.params;
    const { user_id, expiration_date } = req.body;

    try {
        if (!poll_id || !user_id || !expiration_date) {
            res.status(400).json({ message: 'Poll ID, User ID, and Expiration Date are required' });
            return;
        }

        const pollIdNum = Number(poll_id);
        const userIdNum = Number(user_id);

        const [result] = await dataSource.query(
            'SELECT user_id FROM polls WHERE id = ?',
            [pollIdNum]
        ) as any[];

        if (!result) {
            res.status(404).json({ message: 'Poll not found' });
            return;
        }

        if (result.user_id !== userIdNum) {
            res.status(403).json({ message: 'You are not authorized to update this poll' });
            return;
        }

        await dataSource.query(
            'UPDATE polls SET expiration_date = ? WHERE id = ?',
            [expiration_date, pollIdNum]
        );

        res.status(200).json({ message: 'Poll expiration date set successfully' });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};