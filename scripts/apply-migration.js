const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dns = require('dns');
const { promisify } = require('util');

const PROJECT_REF = 'nancqltlgxcsxrtuttmh';
const MIGRATION_FILE = path.join(__dirname, '../supabase/APPLY_ALL_MIGRATIONS.sql');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\x1b[36m%s\x1b[0m', '=== Winning Code Lab Migration Tool ===');
console.log('This script will apply the database migrations to your Supabase project.');
console.log(`Project Ref: ${PROJECT_REF}`);

rl.question('\nPlease enter your Database Password: ', async (password) => {
    if (!password) {
        console.error('Password is required.');
        rl.close();
        process.exit(1);
    }



    // The issue is likely network related. Let's try to use the direct connection string with a slight modification
    // or provide better error handling.
    // Actually, let's try to disable IPv6 lookup in node for this process if possible, 
    // but easier is to just catch this specific error and suggest the Dashboard.

    // Try to use the pooler host which usually has better IPv4 support
    // Based on previous CLI logs: aws-1-us-east-1.pooler.supabase.com
    // aws-0 returned "Tenant not found", so aws-1 is likely the correct cluster for this project.
    const hostname = 'aws-1-us-east-1.pooler.supabase.com';
    // Note: The CLI log said aws-1, but aws-0 is the main public pooler. Let's try aws-0 first.
    // Also, for pooler, we need to use the correct database name and user format:
    // user: postgres.nancqltlgxcsxrtuttmh
    // db: postgres

    console.log(`Connecting to ${hostname}...`);

    // Connection string for pooler: postgres://[user].[project]:[pass]@[host]:6543/[db]
    // Using port 6543 (transaction mode) as it is more reliable for IPv4 access.
    const connectionString = `postgres://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@${hostname}:6543/postgres`;

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000
    });

    try {
        await client.connect();
        console.log('Connected successfully!');
        console.log('Reading migration file...');

        const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');

        console.log('Applying migrations (this may take a few seconds)...');

        await client.query(sql);

        console.log('\x1b[32m%s\x1b[0m', '\nSUCCESS: All migrations applied successfully!');
        console.log('You can now use the application without errors.');

        await client.end();
        rl.close();
        process.exit(0);

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', '\nERROR: Failed to apply migrations.');
        if (err.code === '28P01') {
            console.error('Authentication failed. Please check your password.');
        } else {
            console.error(err.message);
            console.error(err);
        }
        rl.close();
        process.exit(1);
    }
});
