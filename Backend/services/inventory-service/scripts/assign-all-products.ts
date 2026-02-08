
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Assigning ALL Products to Test Station ---');

        // 1. Get the Test Station Category
        const category = await prisma.kitchenCategory.findFirst({
            where: { name: 'Test Station' }
        });

        if (!category) {
            console.error('Test Station category not found. Run seed-chef-test.ts first.');
            return;
        }

        // 2. Update all products
        const updateResult = await prisma.product.updateMany({
            data: {
                kitchenCategoryId: category.id
            }
        });

        console.log(`Updated ${updateResult.count} products to be assigned to 'Test Station'.`);
        console.log('Now any product you order in POS will appear on the Chef Dashboard.');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
