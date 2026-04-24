import { Dialect } from "sequelize";
import dotenv from 'dotenv';
import { DatabaseEnum } from "../shared/enums/database.enum";
dotenv.config();

const databaseUrl = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
const useSsl = process.env.DB_SSL === 'true' || databaseUrl?.searchParams.get('sslmode') === 'require';

class DatabaseConfig {
    private static commonConfig = {
        host: databaseUrl?.hostname || process.env.DB_HOST,
        port: databaseUrl ? Number(databaseUrl.port) : Number(process.env.DB_PORT),
        username: databaseUrl ? decodeURIComponent(databaseUrl.username) : process.env.DB_USERNAME,
        password: databaseUrl ? decodeURIComponent(databaseUrl.password) : process.env.DB_PASSWORD,
        database: databaseUrl?.pathname.replace(/^\//, '') || process.env.DB_DATABASE,
        models: [__dirname + '/../models/**/*.model.{ts,js}'],
        logging: false,
        dialectOptions: useSsl ? {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        } : undefined,
    };

    public static getSequelizeConfig() {
        const dialect = (process.env.DB_CONNECTION || databaseUrl?.protocol.replace(':', '')) as Dialect;
        switch (dialect) {
            case DatabaseEnum.MYSQL:
            case DatabaseEnum.POSTGRES:
                return {
                    ...DatabaseConfig.commonConfig,
                    dialect
                };
            default:
                throw new Error('Invalid or unsupported database dialect');
        }
    }
}

export default DatabaseConfig;
