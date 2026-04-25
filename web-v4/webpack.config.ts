import { config } from 'dotenv';
import { EnvironmentPlugin } from 'webpack';
config();

module.exports = {
    plugins: [
        new EnvironmentPlugin({
            API_BASE_URL: 'https://api.luchtithvichea.com/api',
            FILE_BASE_URL: 'https://file.luchtithvichea.com/',
        })
    ]
}
