import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying tables...');
    try {
        const categories = await prisma.kitchenCategory.count();
        console.log(`Kitchen Categories table exists. Count: ${categories}`);

        const orders = await prisma.order.count();
        console.log(`Orders table exists. Count: ${orders}`);

        const items = await prisma.orderItem.count();
        console.log(`Order Items table exists. Count: ${items}`);

        const assignments = await prisma.chefCategoryAssignment.count();
        console.log(`Chef Assignments table exists. Count: ${assignments}`);

        const logs = await prisma.kitchenActivityLog.count();
        console.log(`Kitchen Activity Logs table exists. Count: ${logs}`);

        console.log('✅ All kitchen tables verified successfully.');
    } catch (error) {
        console.error('❌ Error confirming tables:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
