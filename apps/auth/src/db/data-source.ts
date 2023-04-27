import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from '../../../../libs/shared/src/entities/user.entity';

const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const POSTGRES_DB = process.env.POSTGRES_DB;

export const dataSourceOption: DataSourceOptions = {
  type: 'postgres',
  url: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}`,
  entities: [UserEntity],
  migrations: ['dist/apps/auth/db/migrations/*.js'],
};

export const dataSource = new DataSource(dataSourceOption);
