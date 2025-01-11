import { DataSourceOptions } from 'typeorm';

const testConfig: DataSourceOptions = {
    type: 'sqlite',
    database: ':memory:',
    entities: ['src/entities/*.ts'],
    synchronize: true,
};

export default testConfig;