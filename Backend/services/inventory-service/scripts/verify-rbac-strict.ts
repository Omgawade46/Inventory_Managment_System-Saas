import http from 'http';
import { randomUUID } from 'crypto';

// Helper: HTTP Request
function request(method: string, path: string, headers: any, body?: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api' + path,
            method: method,
            headers: { 'Content-Type': 'application/json', ...headers }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                const result = {
                    status: res.statusCode,
                    body: data ? JSON.parse(data) : {}
                };
                resolve(result);
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    try {
        console.log('=== STRICT RBAC VERIFICATION START ===');
        const timestamp = Date.now();

        // 1. Setup: Create Business & Outlet (as pseudo-admin/owner)
        // We need these IDs to create valid users
        const ownerExternalId = randomUUID();
        console.log('1. Setting up Environment (Business/Outlet)...');

        // Using temporary owner headers for setup
        const setupHeaders = { 'x-mock-role': 'OWNER', 'x-mock-user-id': 'setup-admin' };

        const businessRes = await request('POST', '/businesses', setupHeaders, {
            name: `RBAC_Biz_${timestamp}`, ownerId: ownerExternalId
        });
        const businessId = businessRes.body.id;

        const outletRes = await request('POST', '/outlets', setupHeaders, {
            businessId, name: `RBAC_Outlet_${timestamp}`, address: 'Auth St.'
        });
        const outletId = outletRes.body.id;
        console.log(`   Env Ready. Biz: ${businessId}, Outlet: ${outletId}`);


        // 2. Create Users: One MANAGER, One OWNER
        console.log('\n2. Creating Users...');

        const managerRes = await request('POST', '/users', setupHeaders, {
            name: 'Mr. Manager', email: `manager_${timestamp}@test.com`, role: 'MANAGER',
            businessId, outletId
        });
        const managerId = managerRes.body.id;
        console.log(`   Created MANAGER: ${managerId}`);

        const ownerRes = await request('POST', '/users', setupHeaders, {
            name: 'Mrs. Owner', email: `owner_${timestamp}@test.com`, role: 'OWNER',
            businessId, outletId
        });
        const ownerId = ownerRes.body.id;
        console.log(`   Created OWNER: ${ownerId}`);


        // 3. TEST: MANAGER tries to Create Product (Should fail 403)
        // Note: product.routes.ts has `requireRole(['OWNER'])` for POST /products
        console.log('\n3. TEST: MANAGER tries to Create Product (Restricted to OWNER)...');
        console.log('   Expected Result: 403 Forbidden');

        const managerHeaders = { 'x-mock-role': 'MANAGER', 'x-mock-user-id': managerId };
        const failRes = await request('POST', '/products', managerHeaders, {
            name: 'Forbidden Latte', sellingPrice: 10, outletId
        });

        if (failRes.status === 403) {
            console.log(`   SUCCESS: Request blocked with 403. Body:`, failRes.body);
        } else {
            console.error(`   FAILED: Expected 403, got ${failRes.status}`);
            process.exit(1);
        }

        // 4. TEST: OWNER tries to Create Product (Should pass 201)
        console.log('\n4. TEST: OWNER tries to Create Product (Allowed)...');
        console.log('   Expected Result: 201 Created');

        const ownerHeaders = { 'x-mock-role': 'OWNER', 'x-mock-user-id': ownerId };
        const passRes = await request('POST', '/products', ownerHeaders, {
            name: 'Allowed Latte', sellingPrice: 10, outletId
        });

        if (passRes.status === 201) {
            console.log(`   SUCCESS: Request succeeded with 201. Product ID:`, passRes.body.id);
        } else {
            console.error(`   FAILED: Expected 201, got ${passRes.status}`);
            console.error(passRes.body);
            process.exit(1);
        }

        console.log('\n=== STRICT RBAC VERIFICATION PASSED ===');

    } catch (e) {
        console.error('Test Failed:', e);
        process.exit(1);
    }
}

main();
