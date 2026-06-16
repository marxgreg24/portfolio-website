require('dotenv').config({ override: true });
const { execFileSync } = require('child_process');
const { Pool } = require('pg');

function resolveIpv4Host(hostname) {
  try {
    const output = execFileSync('getent', ['ahostsv4', hostname], { encoding: 'utf8' }).trim();
    const firstLine = output.split('\n')[0];
    return firstLine.split(/\s+/)[0];
  } catch (error) {
    return hostname;
  }
}

function buildDatabaseConfig() {
  const rawUrl = process.env.DATABASE_URL;

  if (!rawUrl) {
    return { connectionString: rawUrl };
  }

  const databaseUrl = new URL(rawUrl);
  const endpointId = databaseUrl.hostname.split('.')[0].replace(/-pooler$/, '');

  return {
    host: resolveIpv4Host(databaseUrl.hostname),
    port: Number(databaseUrl.port || 5432),
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database: databaseUrl.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
    family: 4,
    options: `endpoint=${endpointId}`,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20
  };
}

const pool = new Pool(buildDatabaseConfig());

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
  // Don't exit - allow the app to continue in degraded mode
});

module.exports = pool;
