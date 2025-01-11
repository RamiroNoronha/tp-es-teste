import { Request, Response } from 'express';
import { DataSource } from 'typeorm';

export const getUsers = (dataSource: DataSource) => async (req: Request, res: Response) => {
    try {
        const [rows] = await dataSource.query('SELECT * FROM users');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const createUser = (dataSource: DataSource) => async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: 'Invalid request' });
        return;
    }

    try {

        const [result] = await dataSource.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, password]
        );
        res.status(201).json({ id: (result as any).insertId });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getUserById = (dataSource: DataSource) => async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [rows] = await dataSource.query<any[]>('SELECT * FROM users WHERE id = ?', [id]);
        if ((rows as any).length === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.status(200).json(rows[0]);
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updateUser = (dataSource: DataSource) => async (req: Request, res: Response) => {
    const { id } = req.params;
    const { username, password } = req.body;

    if (!username && !password) {
        res.status(400).json({ error: 'Invalid request' });
        return
    }

    try {
        const [result] = await dataSource.query(
            'UPDATE users SET username = ?, password = ? WHERE id = ?',
            [username, password, id]
        );
        if ((result as any).affectedRows === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.status(200).json({ message: 'User updated successfully' });
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const deleteUser = (dataSource: DataSource) => async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [result] = await dataSource.query('DELETE FROM users WHERE id = ?', [id]);
        if ((result as any).affectedRows === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.status(200).json({ message: 'User deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};