import { Pool } from 'pg';
import dotenv from 'dotenv';
import { execFileSync } from 'child_process';

dotenv.config({ override: true });

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
        connectionTimeoutMillis: 5000,
        family: 4,
        options: `endpoint=${endpointId}`
    };
}

const pool = new Pool(buildDatabaseConfig());

async function testConnection() {
    try {
        console.log('\n🔍 Testing NeonDB Connection...\n');
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Found' : '✗ Missing');
        
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not set');
        }

        console.log('Attempting connection...');
        const result = await pool.query('SELECT NOW()');
        console.log('\n✓ Connection successful!');
        console.log('Database time:', result.rows[0].now);
        console.log('\n✓ NeonDB is accessible\n');
        process.exit(0);
    } catch (error) {
        console.error('\n✗ Connection failed');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('\n⚠️  Possible causes:');
        console.error('  - Network connectivity issue');
        console.error('  - Database credentials are incorrect');
        console.error('  - Database server is down');
        console.error('  - Firewall blocking the connection');
        console.error('\n');
        process.exit(1);
    }
}

testConnection();
