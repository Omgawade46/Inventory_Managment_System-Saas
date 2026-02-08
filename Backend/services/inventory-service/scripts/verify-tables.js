
const { Client } = require('pg');

const databases = [
    {
        name: 'Neon (Cloud)',
        url: 'postgresql://neondb_owner:npg_k3avh9RiOjEy@ep-spring-rice-aheeg4zw-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
        ssl: { rejectUnauthorized: false }
    },
    {
        name: 'Supabase (Friend)',
        url: 'postgresql://postgres.uoccclkwzuwqtrvokemc:NewHorizon%402024@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
        ssl: { rejectUnauthorized: false }
    },
    {
        name: 'Local (Desktop)',
        url: 'postgresql://postgres:1993@localhost:5432/inventory_saas'
    }
];

async function checkTables() {
    console.log('🔍 VERIFYING TABLES...');

    for (const db of databases) {
        console.log(`\n-----------------------------------`);
        console.log(`Checking: ${db.name}`);

        const config = { connectionString: db.url };
        if (db.ssl) config.ssl = db.ssl;

        const client = new Client(config);

        try {
            await client.connect();
            const res = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            `);

            const tableNames = res.rows.map(r => r.table_name);
            const chefTable = tableNames.includes('chef_category_assignments');

            if (chefTable) {
                console.log(`✅ CHEF TABLES FOUND!`);
            } else {
                console.log(`❌ CHEF TABLES MISSING!`);
            }

            console.log('   All Tables:');
            console.log(`   ${tableNames.join(', ')}`);

        } catch (err) {
            console.error(`❌ Connection Failed: ${err.message}`);
        } finally {
            await client.end();
        }
    }
    console.log(`\n-----------------------------------`);
}

checkTables();
