import { createPool } from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'book_poll_platform',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

export const pool = createPool(dbConfig);