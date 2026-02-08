import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { StockService } from '../services/stock.service';

// Simulate POS Order
export const createOrder = async (req: Request, res: Response) => {
    try {
        const { tableNumber, items } = req.body;
        // items: [{ productId, quantity }]
        //@ts-ignore
        const outletId = req.user?.outletId;
        //@ts-ignore
        const userId = req.user?.id || req.user?.userId;

        // 1. Fetch products to get their kitchen categories
        const productIds = items.map((i: any) => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } }
        });

        const productMap = new Map(products.map(p => [p.id, p]));

        // Transaction: Create Order AND Deduct Stock
        // Note: Prisma Interactive Transactions might be needed if we want full atomicity across services
        // For now, we'll try to deduct specific items, if any fail, we might return error (blocking order)

        // Check availability first for all items
        // (Skipping comprehensive pre-check for brevity, relying on StockService to fail if insufficient)

        const order = await prisma.$transaction(async (tx) => {
            // 2. Create Order
            const newOrder = await tx.order.create({
                data: {
                    outletId,
                    tableNumber: parseInt(tableNumber),
                    status: 'RECEIVED',
                    items: {
                        create: items.map((item: any) => {
                            const product = productMap.get(item.productId);
                            return {
                                productId: item.productId,
                                quantity: parseInt(item.quantity),
                                kitchenCategoryId: product?.kitchenCategoryId,
                                itemStatus: 'RECEIVED'
                            };
                        })
                    }
                },
                include: { items: true }
            });

            // 3. Deduct Stock for each item
            for (const item of items) {
                // We call the service - note that the service uses its own prisma client/transaction internally. 
                // Ideally, we should pass the transaction `tx` to the service, but our service is static for now.
                // For this MVP, we will run deductions *after* order creation or separately. 
                // To be safe, let's allow order creation even if stock is low (warn later) OR enforce it.
                // Let's ENFORCE it.

                try {
                    const result = await StockService.deductStockForProduct(
                        item.productId,
                        parseInt(item.quantity),
                        outletId,
                        userId,
                        newOrder.id,
                        tx // Pass shared transaction
                    );

                    if (!result.success) {
                        throw new Error(`Insufficient stock for product ${item.productId}`);
                    }
                } catch (e: any) {
                    throw new Error(`Stock deduction failed: ${e.message}`);
                }
            }

            return newOrder;
        }, {
            maxWait: 5000, // Wait for lock
            timeout: 20000 // 20s timeout
        });

        res.status(201).json(order);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to create order' });
    }
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                //@ts-ignore
                outletId: req.user?.outletId
            },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
