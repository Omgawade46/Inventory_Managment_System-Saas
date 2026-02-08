import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class StockService {
    /**
     * Deduct stock for a product based on its active recipe.
     * @param productId The ID of the product being sold
     * @param quantity The quantity being sold
     * @param outletId The outlet ID (optional)
     * @param performedBy The user ID performing the action (optional)
     * @param orderId Optional reference to an Order
     * @returns Object containing success status and deduction details
     */
    static async deductStockForProduct(
        productId: string,
        quantity: number,
        outletId?: string | null,
        performedBy?: string | null,
        orderId?: string | null,
        externalTx?: Prisma.TransactionClient // New optional parameter
    ) {
        // Use provided transaction or fall back to the main prisma client (we will wrap in transaction below if needed, but actually we should just respect the caller's context)
        // Better approach: If externalTx is provided, use it. If not, create a new transaction.

        const executeLogic = async (tx: Prisma.TransactionClient) => {
            // 1. Get Product & Recipe (Using tx to ensure consistency if locked, though product/recipe config is rarely aggressive)
            const product = await tx.product.findUnique({
                where: { id: productId, isActive: true },
                include: {
                    recipes: {
                        where: { isLocked: true },
                        include: {
                            ingredients: {
                                include: { rawMaterial: true, unit: true }
                            }
                        },
                        take: 1,
                        orderBy: { version: 'desc' }
                    }
                }
            });

            if (!product) throw new Error('Product not found or inactive');

            if (!product.recipes || product.recipes.length === 0) {
                console.warn(`[StockService] Warning: Product ${product.name} (${productId}) has no recipe. Skipping deduction.`);
                return { success: true, stockLogs: [], updatedMaterials: [] };
            }

            const recipe = product.recipes[0];

            // A. Check Availability
            const unavailableIngredients: any[] = [];

            for (const ingredient of recipe.ingredients) {
                if (!ingredient.rawMaterialId || !ingredient.rawMaterial) continue;

                const material = await tx.rawMaterial.findUnique({ where: { id: ingredient.rawMaterialId } });
                if (!material) continue;

                const requiredQty = Number(ingredient.quantity) * quantity;
                const yieldLoss = Number(ingredient.yieldLossPercent || 0) / 100;
                const adjustedRequiredQty = requiredQty * (1 + yieldLoss);
                const availableStock = Number(material.currentStock || 0);

                if (availableStock < adjustedRequiredQty) {
                    unavailableIngredients.push({
                        rawMaterialId: material.id,
                        rawMaterialName: material.name,
                        required: adjustedRequiredQty,
                        available: availableStock
                    });
                }
            }

            if (unavailableIngredients.length > 0) {
                // Return error but do NOT throw if we want to handle gracefully. 
                // However, usually we want to rollback. Returning success:false allows caller to decide (throw or not).
                return { success: false, error: 'Insufficient inventory', unavailableIngredients };
            }

            // B. Deduct Stock
            const stockLogs = [];
            const updatedMaterials = [];

            for (const ingredient of recipe.ingredients) {
                if (!ingredient.rawMaterialId || !ingredient.rawMaterial) continue;

                const requiredQty = Number(ingredient.quantity) * quantity;
                const yieldLoss = Number(ingredient.yieldLossPercent || 0) / 100;
                const adjustedRequiredQty = requiredQty * (1 + yieldLoss);
                const deductionQty = -Math.abs(adjustedRequiredQty);

                // Create Log
                const log = await tx.stockLog.create({
                    data: {
                        rawMaterialId: ingredient.rawMaterialId,
                        changeQuantity: deductionQty,
                        changeType: 'SALE',
                        reason: `Order: ${quantity}x ${product.name}`,
                        referenceId: orderId || null,
                        outletId: outletId || null,
                        unitId: ingredient.unitId,
                        performedBy: performedBy
                    }
                });

                // Update Stock
                const material = await tx.rawMaterial.update({
                    where: { id: ingredient.rawMaterialId },
                    data: { currentStock: { increment: deductionQty } }
                });

                // Check Low Stock Alert
                const currentStock = material.currentStock || new Prisma.Decimal(0);
                if (material.minStockLevel && currentStock.toNumber() <= material.minStockLevel.toNumber()) {
                    const existingAlert = await tx.inventoryAlert.findFirst({
                        where: { rawMaterialId: material.id, status: 'ACTIVE', alertType: 'LOW_STOCK' }
                    });
                    if (!existingAlert) {
                        await tx.inventoryAlert.create({
                            data: {
                                rawMaterialId: material.id,
                                alertType: 'LOW_STOCK',
                                currentValue: currentStock,
                                threshold: material.minStockLevel,
                                status: 'ACTIVE'
                            }
                        });
                    } else {
                        await tx.inventoryAlert.update({
                            where: { id: existingAlert.id },
                            data: { currentValue: currentStock }
                        });
                    }
                }

                stockLogs.push(log);
                updatedMaterials.push({ material: material.name, newStock: Number(material.currentStock) });
            }

            return { success: true, stockLogs, updatedMaterials };
        };

        // If external transaction is provided, use it. Otherwise, start a new one.
        if (externalTx) {
            return await executeLogic(externalTx);
        } else {
            return await prisma.$transaction(async (tx) => {
                return await executeLogic(tx);
            }, {
                timeout: 10000 // Increase default timeout just in case
            });
        }
    }
}
