"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_enum_1 = require("../shared/enums/database.enum");
dotenv_1.default.config();
const databaseUrl = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
const useSsl = process.env.DB_SSL === 'true' || (databaseUrl === null || databaseUrl === void 0 ? void 0 : databaseUrl.searchParams.get('sslmode')) === 'require';
class DatabaseConfig {
    static getSequelizeConfig() {
        const dialect = (process.env.DB_CONNECTION || (databaseUrl === null || databaseUrl === void 0 ? void 0 : databaseUrl.protocol.replace(':', '')));
        switch (dialect) {
            case database_enum_1.DatabaseEnum.MYSQL:
            case database_enum_1.DatabaseEnum.POSTGRES:
                return Object.assign(Object.assign({}, DatabaseConfig.commonConfig), { dialect });
            default:
                throw new Error('Invalid or unsupported database dialect');
        }
    }
}
DatabaseConfig.commonConfig = {
    host: (databaseUrl === null || databaseUrl === void 0 ? void 0 : databaseUrl.hostname) || process.env.DB_HOST,
    port: databaseUrl ? Number(databaseUrl.port) : Number(process.env.DB_PORT),
    username: databaseUrl ? decodeURIComponent(databaseUrl.username) : process.env.DB_USERNAME,
    password: databaseUrl ? decodeURIComponent(databaseUrl.password) : process.env.DB_PASSWORD,
    database: (databaseUrl === null || databaseUrl === void 0 ? void 0 : databaseUrl.pathname.replace(/^\//, '')) || process.env.DB_DATABASE,
    models: [__dirname + '/../models/**/*.model.{ts,js}'],
    logging: false,
    dialectOptions: useSsl ? {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    } : undefined,
};
exports.default = DatabaseConfig;
