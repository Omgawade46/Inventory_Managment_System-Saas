import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/db';
import { Prisma } from '@prisma/client';

export const createStockLog = async (req: Request, res: Response) => {
    try {
        const { rawMaterialId, changeQuantity, changeType, reason, outletId, unitId } = req.body;
        const performedBy = req.body.performedBy || req.user?.id;
        const userOutletId = req.user?.outletId;

        if (!rawMaterialId || changeQuantity === undefined || !changeType) {
            return res.status(400).json({ error: 'Missing required fields: rawMaterialId, changeQuantity, changeType' });
        }

        if (changeType !== 'PURCHASE' && changeType !== 'SALE' && changeType !== 'CORRECTION' && !reason) {
            return res.status(400).json({ error: 'Reason is required for non-standard operations' });
        }

        // Use outlet from user context if not provided in body
        const finalOutletId = outletId || userOutletId || null;

        const qty = Number(changeQuantity);

        // Transaction: Log + Stock Update + Alert Check
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Log
            const log = await tx.stockLog.create({
                data: {
                    rawMaterialId,
                    changeQuantity: qty,
                    changeType,
                    reason,
                    outletId: finalOutletId,
                    unitId, // Optional, can default to material's unit
                    performedBy
                }
            });

            // 2. Update Raw Material Stock
            const material = await tx.rawMaterial.update({
                where: { id: rawMaterialId },
                data: {
                    currentStock: { increment: qty }
                }
            });

            // 3. Check for Low Stock Alert
            const currentStock = material.currentStock || new Prisma.Decimal(0);

            if (material.minStockLevel && currentStock.toNumber() <= material.minStockLevel.toNumber()) {
                // Check if active alert exists
                const existingAlert = await tx.inventoryAlert.findFirst({
                    where: {
                        rawMaterialId: material.id,
                        status: 'ACTIVE',
                        alertType: 'LOW_STOCK'
                    }
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
                    // Update existing alert with current value
                    await tx.inventoryAlert.update({
                        where: { id: existingAlert.id },
                        data: { currentValue: currentStock }
                    });
                }
            } else {
                // Auto-Resolve if stock > threshold
                if (material.minStockLevel && currentStock.toNumber() > material.minStockLevel.toNumber()) {
                    await tx.inventoryAlert.updateMany({
                        where: { rawMaterialId: material.id, status: 'ACTIVE', alertType: 'LOW_STOCK' },
                        data: { status: 'ACKNOWLEDGED' }
                    });
                }
            }

            // 4. Fetch the full log with relationships
            const fullLog = await tx.stockLog.findUnique({
                where: { id: log.id },
                include: {
                    rawMaterial: true,
                    unit: true,
                    performer: true
                }
            });

            return { log: fullLog, newStock: material.currentStock };
        });

        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process stock operation' });
    }
};

export const getStockLogs = async (req: Request, res: Response) => {
    try {
        const { rawMaterialId, changeType, limit, page } = req.query;
        const userOutletId = req.user?.outletId;

        const whereClause: any = {};
        if (rawMaterialId) whereClause.rawMaterialId = String(rawMaterialId);
        if (changeType) whereClause.changeType = String(changeType);

        // Filter by outlet if user has outlet context (outlet-level isolation)
        if (userOutletId) {
            whereClause.outletId = userOutletId;
        }

        const take = limit ? Number(limit) : undefined;
        const skip = (page && limit) ? (Number(page) - 1) * Number(limit) : undefined;

        const logs = await prisma.stockLog.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take,
            skip,
            include: {
                rawMaterial: true,
                unit: true,
                outlet: true,
                performer: true
            }
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock logs' });
    }
};
