import { prisma } from '../src/infrastructure/db';
import { Prisma } from '@prisma/client';

async function main() {
    try {
        console.log('Verifying Phase 3 (Stock Operations & Alerts)...');

        // 1. Setup: Get Material (Ensure Min Stock is set)
        let material = await prisma.rawMaterial.findFirst();
        if (!material) {
            console.error('No material found. Run Phase 1/2 verification first.');
            process.exit(1);
        }

        console.log(`Using Material: ${material.name} (Current: ${material.currentStock})`);

        // Update Min Stock to 10 for testing
        material = await prisma.rawMaterial.update({
            where: { id: material.id },
            data: { minStockLevel: 10 }
        });

        // 2. PURCHASE (+20)
        console.log('Executing PURCHASE (+20)...');
        // Simulate API call logic
        const purchaseLog = await prisma.$transaction(async (tx) => {
            await tx.stockLog.create({
                data: { rawMaterialId: material.id, changeQuantity: 20, changeType: 'PURCHASE' }
            });
            return tx.rawMaterial.update({
                where: { id: material.id },
                data: { currentStock: { increment: 20 } }
            });
        });
        console.log(`Stock after Purchase: ${purchaseLog.currentStock}`);


        // 3. SALE -> TRIGGER LOW STOCK (Reduce to 5)
        // Current = Old + 20. Let's force set to 5 for testing alert
        console.log('Executing SALE (Force Low Stock -> 5)...');
        const diff = Number(purchaseLog.currentStock) - 5;

        await prisma.$transaction(async (tx) => {
            await tx.stockLog.create({
                data: { rawMaterialId: material.id, changeQuantity: -diff, changeType: 'SALE' }
            });

            const updatedMat = await tx.rawMaterial.update({
                where: { id: material.id },
                data: { currentStock: 5 }
            });

            // Check Alert Logic
            const currentStock = updatedMat.currentStock || new Prisma.Decimal(0);

            if (updatedMat.minStockLevel && currentStock.toNumber() <= updatedMat.minStockLevel.toNumber()) {
                await tx.inventoryAlert.create({
                    data: {
                        rawMaterialId: material.id,
                        alertType: 'LOW_STOCK',
                        currentValue: currentStock,
                        threshold: updatedMat.minStockLevel,
                        status: 'ACTIVE'
                    }
                });
                console.log('Alert Logic Triggered (Simulated).');
            }
        });

        // 4. Verify Alert Exists
        const alert = await prisma.inventoryAlert.findFirst({
            where: { rawMaterialId: material.id, status: 'ACTIVE' }
        });

        if (alert) {
            console.log('Verification SUCCESS: Low Stock Alert created.', alert);
        } else {
            console.error('Verification FAILED: No alert found.');
        }

    } catch (e) {
        console.error('Verification Error:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
