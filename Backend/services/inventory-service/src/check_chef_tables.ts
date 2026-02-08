
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Chef tables...');

    try {
        const kitchenCategoriesCount = await prisma.kitchenCategory.count();
        console.log(`KitchenCategory table exists. Count: ${kitchenCategoriesCount}`);

        const chefAssignmentsCount = await prisma.chefCategoryAssignment.count();
        console.log(`ChefCategoryAssignment table exists. Count: ${chefAssignmentsCount}`);

        // List all tables in the database
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
        console.log('Tables in database:', tables);

    } catch (error) {
        console.error('Error accessing tables:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
