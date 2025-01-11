import { DataSource, DataSourceOptions } from 'typeorm';

const dbConfig: DataSourceOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'book_poll_platform',
    synchronize: false, // Defina como true se quiser sincronizar automaticamente o esquema do banco de dados
    logging: false,
    entities: ['src/entities/*.ts'],
    migrations: ['src/migrations/*.ts'],
    subscribers: ['src/subscribers/*.ts'],
};

export const dataSource = new DataSource(dbConfig);