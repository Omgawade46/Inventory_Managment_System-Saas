// @ts-nocheck
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import http from 'http';

const API_PORT = 3000;
const API_HOST = 'localhost';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_HOST,
            port: API_PORT,
            path: `/api${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : null;
                    resolve({ status: res.statusCode, data: parsed, raw: data });
                } catch (e) {
                    resolve({ status: res.statusCode, data: null, raw: data });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function main() {
    console.log('🚀 Starting Verification Script (using http)...');

    // 1. Generate Token
    const token = jwt.sign(
        {
            id: 'test-script-user',
            role: 'OWNER',
            outletId: '33333333-3333-3333-3333-333333333333',
            businessId: 'test-business'
        },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
    console.log('🔑 Generated Test Token');

    try {
        // 2. Fetch Product
        console.log('\n📦 Fetching Products...');
        const productsRes = await request('GET', '/products', null, token);

        if (productsRes.status !== 200) {
            console.error(`❌ Failed to fetch products (Status: ${productsRes.status})`);
            return;
        }

        const products = productsRes.data;
        if (!products || products.length === 0) {
            console.error('❌ No products found. Please create a product first.');
            return;
        }
        const product = products[0];
        console.log(`   Found: ${product.name} (${product.id})`);

        // 3. Fetch Material
        console.log('\n🧱 Fetching Raw Materials...');
        const materialsRes = await request('GET', '/raw-materials', null, token);

        if (materialsRes.status !== 200) {
            console.error(`❌ Failed to fetch materials (Status: ${materialsRes.status})`);
            return;
        }

        const materials = materialsRes.data;
        if (!materials || materials.length === 0) {
            console.error('❌ No raw materials found. Please create a material first.');
            return;
        }
        const material = materials[0];
        console.log(`   Found: ${material.name} (${material.id})`);

        // 4. Create Recipe
        console.log('\n📝 Creating Recipe...');
        const recipePayload = {
            productId: product.id,
            ingredients: [
                {
                    rawMaterialId: material.id,
                    quantity: 1.5,
                    unitId: material.unitId
                }
            ],
            version: 1
        };

        console.log('   Payload:', JSON.stringify(recipePayload, null, 2));

        const createRes = await request('POST', '/recipes', recipePayload, token);

        if (createRes.status === 201 || createRes.status === 200) {
            console.log('\n✅ Recipe Created Successfully!');
            console.log('   ID:', createRes.data.id);
            console.log('   Ingredients Count:', createRes.data.ingredients ? createRes.data.ingredients.length : 'N/A');
        } else {
            console.error('\n❌ Failed to create recipe:');
            console.error('   Status:', createRes.status);
            console.error('   Response:', createRes.raw);
        }

    } catch (error) {
        console.error('\n❌ Unexpected Error:', error);
    }
}

main();
