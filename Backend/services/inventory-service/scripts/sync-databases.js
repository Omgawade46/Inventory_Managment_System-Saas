
const { execSync } = require('child_process');

// Define the databases
// NOTE: Supabase password 'NewHorizon@2024' is encoded to 'NewHorizon%402024' to handle the '@' symbol.
const databases = [
    {
        name: 'Neon (Current/Cloud)',
        url: 'postgresql://neondb_owner:npg_k3avh9RiOjEy@ep-spring-rice-aheeg4zw-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    },
    {
        name: 'Supabase (Friend) - Pooler (Manual)',
        // Correcting URL encoding: 'NewHorizon@2024' -> 'NewHorizon%402024'
        // Using pooler host: aws-1-ap-south-1.pooler.supabase.com (As provided by user)
        url: 'postgresql://postgres.uoccclkwzuwqtrvokemc:NewHorizon%402024@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
    },
    {
        name: 'Local (Desktop)',
        url: 'postgresql://postgres:1993@localhost:5432/inventory_saas'
    }
];

console.log('🔄 STARTING MULTI-DATABASE SYNC 🔄');
console.log('-----------------------------------');

databases.forEach(db => {
    console.log(`\n👉 Targeting: ${db.name}`);
    console.log(`   URL: ${db.url.replace(/:([^:@]+)@/, ':****@')}`); // Log masked URL

    try {
        console.log('   Exec: npx prisma migrate deploy');
        execSync('npx prisma migrate deploy', {
            stdio: 'inherit',
            env: { ...process.env, DATABASE_URL: db.url }
        });
        console.log(`✅ SUCCESS: ${db.name} is now synced.`);
    } catch (error) {
        console.error(`❌ FAILURE: Could not sync ${db.name}.`);
        console.error('   Check connection string or network access.');
    }
    console.log('-----------------------------------');
});

console.log('\n🏁 SYNC PROCESS COMPLETE 🏁');
