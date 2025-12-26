const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_HsodGt95Jjnc@ep-twilight-firefly-ad4egbva-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // required for cloud-hosted Postgres like Neon
  }
});

pool.connect()
  .then(() => console.log('Database connected via connection string'))
  .catch(err => console.error('Database connection error:', err));

module.exports = pool;


