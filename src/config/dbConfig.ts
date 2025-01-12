import { DataSource, DataSourceOptions } from 'typeorm';

const dbConfig: DataSourceOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'book_poll_platform',
    synchronize: true,
    logging: false,
};

export const dataSource = new DataSource(dbConfig);

dataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
    })
    .catch((err) => {
        console.error('Error during Data Source initialization:', err);
    });