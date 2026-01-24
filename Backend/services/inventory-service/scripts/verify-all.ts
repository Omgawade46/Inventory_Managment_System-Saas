import http from 'http';
import { randomUUID } from 'crypto';

const BASE_URL = 'http://localhost:3000/api';

// Initial Headers (will update with real User ID)
let HEADERS = {
    'Content-Type': 'application/json',
    'x-mock-role': 'OWNER',
    'x-mock-user-id': 'temp-id'
};

// Helper: HTTP Request
function request(method: string, path: string, body?: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api' + path,
            method: method,
            headers: HEADERS
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = data ? JSON.parse(data) : {};
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(json);
                    } else {
                        reject({
                            status: res.statusCode,
                            path: path,
                            method: method,
                            reqBody: body,
                            resBody: json
                        });
                    }
                } catch (e) {
                    reject({ status: res.statusCode, error: data });
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    try {
        console.log('=== E2E VERIFICATION START (Full Hierarchy) ===');

        const timestamp = Date.now();
        const ownerExternalId = randomUUID(); // Simulate an Auth0 ID

        // 1. Create Business
        console.log('\n1. Creating Business...');
        const business = await request('POST', '/businesses', {
            name: `E2E_Business_${timestamp}`,
            ownerId: ownerExternalId
        });
        console.log('   OK. Business ID:', business.id);

        // 2. Create Outlet
        console.log('\n2. Creating Outlet...');
        const outlet = await request('POST', '/outlets', {
            businessId: business.id,
            name: `E2E_Outlet_HQ_${timestamp}`,
            address: '123 Test St, Silicon Valley'
        });
        console.log('   OK. Outlet ID:', outlet.id);

        // 3. Create User (Owner) linked to Business & Outlet
        console.log('\n3. Creating User (Owner Role)...');
        const user = await request('POST', '/users', {
            name: `Time_Traveler_${timestamp}`,
            email: `tester_${timestamp}@example.com`,
            role: 'OWNER',
            businessId: business.id,
            outletId: outlet.id
        });
        console.log('   OK. User ID:', user.id);

        // Update Headers with Real User ID for subsequent RBAC checks
        HEADERS['x-mock-user-id'] = user.id;

        // 4. Create Unit
        console.log('\n4. Creating Unit...');
        const unit = await request('POST', '/units', {
            name: `E2E_Unit_${timestamp}`,
            baseUnit: 'ml',
            conversionFactor: 1
        });
        console.log('   OK. Unit ID:', unit.id);

        // 5. Create Raw Material (Linked to Outlet)
        console.log('\n5. Creating Raw Material (Outlet Scoped)...');
        const material = await request('POST', '/raw-materials', {
            name: `E2E_Milk_${timestamp}`,
            unitId: unit.id,
            costPerUnit: 0.10,
            minStockLevel: 50,
            outletId: outlet.id // Important: Link to Outlet
        });
        console.log('   OK. Material ID:', material.id);

        // 6. Create Product (Linked to Outlet)
        console.log('\n6. Creating Product (Outlet Scoped)...');
        const product = await request('POST', '/products', {
            name: `E2E_Latte_${timestamp}`,
            sellingPrice: 5.50,
            outletId: outlet.id // Important: Link to Outlet
        });
        console.log('   OK. Product ID:', product.id);

        // 7. Create Recipe
        console.log('\n7. Creating Recipe...');
        const recipe = await request('POST', '/recipes', {
            productId: product.id,
            ingredients: [
                { rawMaterialId: material.id, quantity: 200, unitId: unit.id }
            ]
        });
        console.log('   OK. Recipe ID:', recipe.id);

        // 8. Stock In (Purchase)
        console.log('\n8. Stock In (Purchase +100)...');
        const purchase = await request('POST', '/stock-logs', {
            rawMaterialId: material.id,
            changeType: 'PURCHASE',
            changeQuantity: 100,
            outletId: outlet.id // Important: Link to Outlet
        });
        console.log('   OK. New Stock:', purchase.newStock);

        // 9. Stock Out (Sale/Wastage) -> Trigger Alert
        console.log('\n9. Stock Out (Sale -60) -> Expect Alert...');
        const sale = await request('POST', '/stock-logs', {
            rawMaterialId: material.id,
            changeType: 'SALE',
            changeQuantity: -60,
            reason: 'E2E Test Sale',
            outletId: outlet.id // Important: Link to Outlet
        });
        console.log('   OK. New Stock:', sale.newStock);

        // 10. Verify Alert
        console.log('\n10. Checking Alerts...');
        const alerts = await request('GET', '/alerts?status=ACTIVE');
        const myAlert = alerts.find((a: any) => a.rawMaterialId === material.id);

        if (myAlert) {
            console.log('   SUCCESS: Low Stock Alert found:', myAlert.id);
        } else {
            console.error('   FAILED: Expected alert not found.');
            process.exit(1);
        }

        console.log('\n=== E2E VERIFICATION PASSED (Full Hierarchy) ===');

    } catch (e: any) {
        console.error('\n!!! E2E FAILED !!!');
        console.error(JSON.stringify(e, null, 2));
        process.exit(1);
    }
}

main();
