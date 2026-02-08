
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Verifying Backend Response for Chef Name ---');

        // 1. Get Test Data
        const chef = await prisma.user.findUnique({ where: { email: 'chef@example.com' } });
        if (!chef) throw new Error('Chef not found');

        const product = await prisma.product.findFirst({ where: { kitchenCategory: { name: 'Test Station' } } });
        if (!product) throw new Error('Test Product not found');

        const outlet = await prisma.outlet.findFirst();

        // 2. Create Fresh Order
        const order = await prisma.order.create({
            data: {
                outletId: outlet?.id,
                tableNumber: 88,
                status: 'RECEIVED',
                items: {
                    create: {
                        productId: product.id,
                        quantity: 1,
                        itemStatus: 'RECEIVED',
                        kitchenCategoryId: product.kitchenCategoryId
                    }
                }
            },
            include: { items: true }
        });
        const itemId = order.items[0].id;
        console.log(`Created Item: ${itemId}`);

        // 3. Simulate "Start Cooking" (Update Status & Assign)
        // This mimics what PUT /kitchen/items/:id/status does
        await prisma.orderItem.update({
            where: { id: itemId },
            data: {
                itemStatus: 'PREPARING',
                assignedToUserId: chef.id // This is what the controller does now
            }
        });
        console.log('Moved to PREPARING and Assigned to Chef');

        // 4. Simulate Fetching Queue (what the frontend calls)
        // This mimics KitchenController.getChefQueue
        const queueItems = await prisma.orderItem.findMany({
            where: { id: itemId },
            include: {
                product: true,
                order: { select: { tableNumber: true, createdAt: true } },
                assignedTo: { select: { name: true, id: true } } // CRITICAL CHECK
            }
        });

        const fetchedItem = queueItems[0];
        console.log('\n--- API Response Preview ---');
        console.log(JSON.stringify(fetchedItem.assignedTo, null, 2));

        if (fetchedItem.assignedTo && fetchedItem.assignedTo.name) {
            console.log(`SUCCESS: Found assignedTo.name = "${fetchedItem.assignedTo.name}"`);
        } else {
            console.error('FAILURE: assignedTo is missing or empty!');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
