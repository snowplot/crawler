import * as path from 'path';

const env = process.env.NODE_ENV || 'development';

process.env.NODE_ENV = env;

require('dotenv').config({
  path: path.resolve(__dirname, '..', env ? `.env.${env}` : '.env')
});
