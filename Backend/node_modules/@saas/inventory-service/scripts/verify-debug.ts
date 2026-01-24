import http from 'http';

const BASE_URL = 'http://localhost:3000/api';
const HEADERS = {
    'Content-Type': 'application/json',
    'x-mock-role': 'OWNER',
    'x-mock-user-id': 'e2e-tester'
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
                        // Include useful info in rejection
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
        console.log('=== E2E VERIFICATION START ===');

        const timestamp = Date.now();

        // 1. Create Unit
        console.log('\n1. Creating Unit...');
        const unit = await request('POST', '/units', {
            name: `E2E_Unit_${timestamp}`,
            baseUnit: 'ml',
            conversionFactor: 1
        });
        console.log('   OK. Unit ID:', unit.id);

        // 2. Create Raw Material
        console.log('\n2. Creating Raw Material...');
        const material = await request('POST', '/raw-materials', {
            name: `E2E_Milk_${timestamp}`,
            unitId: unit.id,
            costPerUnit: 0.10,
            minStockLevel: 50
        });
        console.log('   OK. Material ID:', material.id);

        // 5. Stock In (Purchase)
        console.log('\n5. Stock In (Purchase +100)...');
        // Initial 0 + 100 = 100
        const purchase = await request('POST', '/stock-logs', {
            rawMaterialId: material.id,
            changeType: 'PURCHASE',
            changeQuantity: 100
        });
        console.log('   OK. New Stock:', purchase.newStock);

    } catch (e: any) {
        console.error('\n!!! E2E FAILED !!!');
        console.error(JSON.stringify(e, null, 2));
        process.exit(1);
    }
}

main();
