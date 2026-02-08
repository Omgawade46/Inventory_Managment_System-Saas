
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Creating Test Order for Chef Flow ---');

        // 1. Get Outlet
        const outlet = await prisma.outlet.findFirst();
        if (!outlet) {
            console.error('No outlet found');
            return;
        }

        // 2. Get the Test Station Category
        const category = await prisma.kitchenCategory.findFirst({
            where: { name: 'Test Station' }
        });

        if (!category) {
            console.error('Test Station category not found. Run seed-chef-test.ts first.');
            return;
        }

        // 3. Find or Create a Product for this Station
        let product = await prisma.product.findFirst({
            where: {
                name: 'Chef Special Burger',
                outletId: outlet.id
            }
        });

        if (!product) {
            product = await prisma.product.create({
                data: {
                    name: 'Chef Special Burger',
                    outletId: outlet.id,
                    sellingPrice: 15.00,
                    kitchenCategoryId: category.id // CRITICAL: Assign to Station
                }
            });
            console.log('Created Product: Chef Special Burger (Assigned to Test Station)');
        } else {
            // Ensure connection
            if (product.kitchenCategoryId !== category.id) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: { kitchenCategoryId: category.id }
                });
                console.log('Updated Product: Chef Special Burger -> Assigned to Test Station');
            } else {
                console.log('Found Product: Chef Special Burger (Correctly Assigned)');
            }
        }

        // 4. Create an Order
        const order = await prisma.order.create({
            data: {
                outletId: outlet.id,
                tableNumber: 99,
                status: 'RECEIVED',
                items: {
                    create: {
                        productId: product.id,
                        quantity: 2,
                        kitchenCategoryId: category.id, // Explicitly linking for good measure, though controller does it
                        itemStatus: 'RECEIVED'
                    }
                }
            }
        });

        console.log(`Created Order #${order.id} for Table 99`);
        console.log('Check the Chef Dashboard now!');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
