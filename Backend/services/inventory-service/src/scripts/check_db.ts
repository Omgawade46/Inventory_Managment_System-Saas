import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

console.log('TEST: Loading .env');
console.log('TEST: DATABASE_URL is ' + (process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED'));

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('TEST: Connecting to DB...');
    try {
        await prisma.$connect();
        console.log('TEST: Connected successfully!');

        console.log('TEST: Querying Product details...');
        const products = await prisma.product.findMany({ take: 1 });
        if (products.length > 0) {
            console.log('TEST: Product[0]:', products[0]);
        } else {
            console.log('TEST: No products found in DB.');
        }

    } catch (e) {
        console.error('TEST: Connection Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
