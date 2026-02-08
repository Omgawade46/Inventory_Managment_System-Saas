import { Request, Response } from 'express';
// Trigger restart
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- Categories ---
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.kitchenCategory.findMany({
            where: {
                //@ts-ignore - outletId is added by middleware
                outletId: req.user?.outletId,
                isActive: true
            },
            include: {
                chefAssignments: {
                    include: { user: true }
                }
            }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const category = await prisma.kitchenCategory.create({
            data: {
                name,
                //@ts-ignore
                outletId: req.user?.outletId,
            }
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
};

export const assignChefToCategory = async (req: Request, res: Response) => {
    try {
        const { userId, categoryId } = req.body;
        const assignment = await prisma.chefCategoryAssignment.create({
            data: {
                userId,
                kitchenCategoryId: categoryId
            }
        });
        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign chef' });
    }
};

// --- Chef Queue (Items) ---
export const getChefQueue = async (req: Request, res: Response) => {
    try {
        // 1. Get categories assigned to this chef (or View All for Owner/Manager)
        //@ts-ignore
        const userId = req.user?.id || req.user?.userId;
        //@ts-ignore
        const userRole = req.user?.role;

        let categoryFilter = {};

        if (userRole === 'OWNER' || userRole === 'MANAGER') {
            // Owner sees everything
            categoryFilter = {};
        } else {
            // Chef sees only assigned categories
            const assignments = await prisma.chefCategoryAssignment.findMany({
                where: { userId },
                select: { kitchenCategoryId: true }
            });
            const categoryIds = assignments.map(a => a.kitchenCategoryId);

            if (categoryIds.length === 0) {
                return res.json([]); // No assignments, no items
            }
            categoryFilter = { kitchenCategoryId: { in: categoryIds } };
        }

        // 2. Get items for these categories that are NOT served
        const items = await prisma.orderItem.findMany({
            where: {
                ...categoryFilter,
                itemStatus: { in: ['RECEIVED', 'PREPARING'] } // Chef only sees what needs work
            },
            include: {
                product: true,
                order: {
                    select: { tableNumber: true, createdAt: true }
                },
                assignedTo: {
                    select: { name: true, id: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch queue' });
    }
};

export const updateItemStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // PREPARING, READY
    //@ts-ignore
    const userId = req.user?.id || req.user?.userId;
    //@ts-ignore
    const userRole = req.user?.role;

    try {
        const updateData: any = { itemStatus: status };

        // If starting prep, assign to current user
        if (status === 'PREPARING') {
            updateData.assignedToUserId = userId;
        }

        const item = await prisma.orderItem.update({
            where: { id },
            data: updateData
        });

        // Log activity
        await prisma.kitchenActivityLog.create({
            data: {
                orderItemId: id,
                action: status,
                //@ts-ignore
                performedBy: req.user?.id || req.user?.userId
            }
        });

        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
};

// --- Staff View ---
export const getReadyItems = async (req: Request, res: Response) => {
    try {
        const items = await prisma.orderItem.findMany({
            where: {
                //@ts-ignore
                order: { outletId: req.user?.outletId },
                itemStatus: 'READY'
            },
            include: {
                product: true,
                order: { select: { tableNumber: true } }
            },
            orderBy: { updatedAt: 'asc' }
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ready items' });
    }
};

export const markItemServed = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const item = await prisma.orderItem.update({
            where: { id },
            data: { itemStatus: 'SERVED' }
        });

        // Check if all items in order are served
        const orderId = item.orderId;
        const unservedCount = await prisma.orderItem.count({
            where: {
                orderId: orderId,
                itemStatus: { not: 'SERVED' }
            }
        });

        if (unservedCount === 0) {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'SERVED' }
            });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Failed to serve item' });
    }
};
