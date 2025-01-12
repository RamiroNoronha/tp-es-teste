import { Request, Response } from 'express';
import { DataSource } from 'typeorm';

interface Poll {
    user_id: number;
    closed_at: Date;
}

export const getPolls = (dataSource: DataSource) => async (req: Request, res: Response): Promise<void> => {
    try {
        const rows = await dataSource.query('SELECT * FROM polls');
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
        const result = await dataSource.query(
            'INSERT INTO polls (title, description, poll_type_id, user_id) VALUES (?, ?, ?, ?)',
            [title, description, poll_type_id, user_id]
        );
        res.status(201).json({ id: (result as any).insertId });
    } catch (error) {
        console.error('Error creating poll:', error);
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
        const poll = await dataSource.query(
            'SELECT closed_at FROM polls WHERE id = ?',
            [poll_id]
        );

        if (!poll) {
            res.status(404).json({ error: 'Poll not found' });
            return;
        }


        const expiration = (poll as any).closed_at;
        const currentDate = new Date();

        if (expiration && new Date(expiration) < currentDate) {
            res.status(400).json({ error: 'Poll has expired' });
            return;
        }

        const result = await dataSource.query(
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
        const rows = await dataSource.query(
            'SELECT option_id, COUNT(option_id) as votes FROM votes WHERE poll_id = ? GROUP BY option_id',
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
        const user_idNum = Number(user_id);

        const pollRows = await dataSource.query(
            'SELECT user_id FROM polls WHERE id = ?',
            [pollIdNum]
        );

        const polls = pollRows as Poll[];

        if (polls.length === 0) {
            res.status(404).json({ message: 'Poll not found' });
            return;
        }

        const poll = polls[0];
        if (poll.user_id !== user_idNum) {
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
    const { user_id, closed_at } = req.body;

    try {
        if (!poll_id || !user_id || !closed_at) {
            res.status(400).json({ message: 'Poll ID, User ID, and Expiration Date are required' });
            return;
        }

        const pollIdNum = Number(poll_id);
        const user_idNum = Number(user_id);

        const result = await dataSource.query(
            'SELECT user_id FROM polls WHERE id = ?',
            [pollIdNum]
        ) as any[];

        if (!result) {
            res.status(404).json({ message: 'Poll not found' });
            return;
        }

        if (result[0].user_id !== user_idNum) {
            res.status(403).json({ message: 'You are not authorized to update this poll' });
            return;
        }

        await dataSource.query(
            'UPDATE polls SET closed_at = ? WHERE id = ?',
            [closed_at, pollIdNum]
        );

        res.status(200).json({ message: 'Poll expiration date set successfully' });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const setPollOptions = (dataSource: DataSource) => async (req: Request, res: Response): Promise<void> => {
    const { poll_id } = req.params;
    const { user_id, options } = req.body;

    if (!poll_id || !user_id || !options || !Array.isArray(options) || options.length === 0) {
        res.status(400).json({ message: 'Poll ID, User ID, and options are required' });
        return;
    }

    try {
        const pollIdNum = Number(poll_id);
        const user_idNum = Number(user_id);

        const pollRows = await dataSource.query(
            'SELECT user_id, closed_at FROM polls WHERE id = ?',
            [pollIdNum]
        );

        if (!pollRows || pollRows.length === 0) {
            res.status(404).json({ message: 'Poll not found' });
            return;
        }

        const poll = pollRows[0] as Poll;
        if (poll.user_id !== user_idNum) {
            res.status(403).json({ message: 'You are not authorized to set options for this poll' });
            return;
        }

        const currentDate = new Date();
        if (poll.closed_at && new Date(poll.closed_at) < currentDate) {
            res.status(400).json({ message: 'Poll has expired' });
            return;
        }

        await dataSource.query(
            'DELETE FROM poll_options WHERE poll_id = ?',
            [pollIdNum]
        );

        const insertQueries = options.map(option => {
            return dataSource.query(
                'INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)',
                [pollIdNum, option]
            );
        });

        await Promise.all(insertQueries);

        res.status(200).json({ message: 'Poll options set successfully' });
    } catch (error) {
        console.error('Error setting poll options:', error);
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getPollOptions = (dataSource: DataSource) => async (req: Request, res: Response): Promise<void> => {
    const { poll_id } = req.params;

    try {
        const pollIdNum = Number(poll_id);

        const options = await dataSource.query(
            'SELECT * FROM poll_options WHERE poll_id = ?',
            [pollIdNum]
        );

        if (!options || options.length === 0) {
            res.status(404).json({ message: 'No options found for this poll' });
            return;
        }

        res.status(200).json(options);
    } catch (error) {
        console.error('Error getting poll options:', error);
        res.status(500).json({ error: (error as Error).message });
    }
};