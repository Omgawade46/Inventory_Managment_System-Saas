import { prisma } from '../src/infrastructure/db';

// Simple fetch wrapper since we can't easily modify the running server's req headers from a script 
// except by actually making HTTP requests.
// BUT this script runs node process, distinct from the express server process unless we import app and use supertest.
// Let's assume the user has the server running (npm run dev) as per metadata.
// We will use standard `fetch` (available in Node 18+) to hit localhost:3000.

const BASE_URL = 'http://localhost:3000/api';

async function main() {
    try {
        console.log('Verifying Phase 4 (RBAC)...');

        // 1. Unauthorized Request (No Headers) -> Should Fail 401/403
        // Targeting Protected Route: POST /stock-logs
        console.log('Test 1: Public Request (No Headers) -> Should be 401/403');
        const res1 = await fetch(`${BASE_URL}/stock-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        if (res1.status === 401 || res1.status === 403) {
            console.log(`Success: Blocked with status ${res1.status}`);
        } else {
            console.error(`Failed: Expected 401/403, got ${res1.status}`);
            // Proceeding solely for demo, usually exit(1)
        }

        // 2. Authorized Request (Mock Header: OWNER) -> Should Pass (or at least hit 400 Bad Request validation from Controller, NOT 403)
        console.log('Test 2: Authorized Request (Role: OWNER) -> Should pass Auth');
        const res2 = await fetch(`${BASE_URL}/stock-logs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-mock-role': 'OWNER',
                'x-mock-user-id': 'test-owner'
            },
            body: JSON.stringify({}) // Empty body to trigger validation error, proving we passed Auth
        });

        // If we get 400, it means we passed RBAC and hit Controller validation. If we get 403, RBAC failed.
        if (res2.status === 400) {
            console.log('Success: Passed RBAC, hit Controller validation (400).');
        } else {
            console.error(`Failed: Expected 400, got ${res2.status}`);
        }

        console.log('RBAC Verification Complete.');

    } catch (e) {
        console.error('Verification Error:', e);
        process.exit(1);
    }
}

main();
