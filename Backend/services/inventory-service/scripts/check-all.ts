import { execSync } from 'child_process';

const SCRIPTS = [
    'scripts/verify-all.ts',
    'scripts/verify-rbac-strict.ts'
];

console.log('🚀 Starting MASTER VERIFICATION (Inventory Service)...\n');

let failed = false;

for (const script of SCRIPTS) {
    console.log(`--------------------------------------------------`);
    console.log(`▶ Running: ${script}`);
    console.log(`--------------------------------------------------`);
    try {
        execSync(`npx ts-node ${script}`, { stdio: 'inherit' });
        console.log(`\n✅ ${script} PASSED\n`);
    } catch (e) {
        console.error(`\n❌ ${script} FAILED\n`);
        failed = true;
        // Proceed to next script to see full picture? Or stop? 
        // Let's stop on first failure for strictness.
        break;
    }
}

console.log(`--------------------------------------------------`);
if (failed) {
    console.log('💥 MASTER VERIFICATION FAILED');
    process.exit(1);
} else {
    console.log('✨ ALL SYSTEMS GO: MASTER VERIFICATION PASSED ✨');
    process.exit(0);
}
