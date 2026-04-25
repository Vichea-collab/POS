import { config } from 'dotenv';
import { EnvironmentPlugin } from 'webpack';
config();

const API_BASE_URL = process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || 'https://api.luchtithvichea.com/api';
const FILE_BASE_URL = process.env.FILE_BASE_URL || process.env.VITE_FILE_BASE_URL || 'https://file.luchtithvichea.com/';
const SOCKET_URL = process.env.SOCKET_URL || process.env.VITE_SOCKET_URL || 'https://api.luchtithvichea.com';

module.exports = {
    plugins: [
        new EnvironmentPlugin({
            API_BASE_URL,
            FILE_BASE_URL,
            SOCKET_URL,
        })
    ]
}
