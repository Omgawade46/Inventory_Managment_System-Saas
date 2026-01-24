import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/db';

export const createMaterial = async (req: Request, res: Response) => {
    try {
        const { name, category, unitId, costPerUnit, minStockLevel, supplierName, outletId } = req.body;
        const userOutletId = req.user?.outletId;
        const createdBy = req.user?.id;

        // Basic validation
        if (!name || !unitId) {
            return res.status(400).json({ error: 'Name and Unit ID are required' });
        }

        // Use outlet from user context if not provided in body
        const finalOutletId = outletId || userOutletId || null;

        const material = await prisma.rawMaterial.create({
            data: {
                name,
                category,
                unitId,
                costPerUnit,
                minStockLevel,
                supplierName,
                outletId: finalOutletId,
                createdBy: createdBy || null
            },
        });
        res.status(201).json(material);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create raw material' });
    }
};

export const getMaterials = async (req: Request, res: Response) => {
    try {
        const userOutletId = req.user?.outletId;

        // Filter by outlet if user has outlet context (outlet-level isolation)
        const whereClause: any = { isActive: true };
        if (userOutletId) {
            whereClause.outletId = userOutletId;
        }

        const materials = await prisma.rawMaterial.findMany({
            where: whereClause,
            include: { unit: true, outlet: true, creator: true }
        });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch raw materials' });
    }
};

export const updateMaterial = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const material = await prisma.rawMaterial.update({
            where: { id },
            data: data
        });
        res.json(material);
    } catch (error: any) {
        console.error('Update Material Error:', error);
        res.status(500).json({ error: 'Failed to update raw material', details: error.message, code: error.code });
    }
}

export const deleteMaterial = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.rawMaterial.update({
            where: { id },
            data: { isActive: false }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete raw material' });
    }
}
