// ===========================================================================>> Core Library
import { SequelizeModuleOptions } from '@nestjs/sequelize';

// ===========================================================================>> Third Party Library
import * as dotenv from 'dotenv';
import { Dialect } from 'sequelize';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
const useSsl = process.env.DB_SSL === 'true' || databaseUrl?.searchParams.get('sslmode') === 'require';

/** @MySQL and @Postgresql */
const sequelizeConfig: SequelizeModuleOptions = {
    dialect     : (process.env.DB_CONNECTION || databaseUrl?.protocol.replace(':', '') || 'mysql') as Dialect,
    host        : databaseUrl?.hostname || process.env.DB_HOST,
    port        : databaseUrl ? Number(databaseUrl.port) : Number(process.env.DB_PORT),
    username    : databaseUrl ? decodeURIComponent(databaseUrl.username) : process.env.DB_USERNAME,
    password    : databaseUrl ? decodeURIComponent(databaseUrl.password) : process.env.DB_PASSWORD,
    database    : databaseUrl?.pathname.replace(/^\//, '') || process.env.DB_DATABASE,
    timezone    : process.env.DB_TIMEZONE || 'Asia/Phnom_Penh',
    models      : [__dirname + '/../app/models/**/*.model.{ts,js}'],
    logging     : false,
    dialectOptions: useSsl ? {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    } : undefined,
};

export default sequelizeConfig;
