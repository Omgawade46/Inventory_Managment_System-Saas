import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/db';

export const createUnit = async (req: Request, res: Response) => {
    try {
        const { name, baseUnit, conversionFactor } = req.body;
        const unit = await prisma.unit.create({
            data: { name, baseUnit, conversionFactor },
        });
        res.status(201).json(unit);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create unit' });
    }
};

export const getUnits = async (req: Request, res: Response) => {
    try {
        const units = await prisma.unit.findMany({ where: { isActive: true } });
        res.json(units);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch units' });
    }
};

export const updateUnit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, baseUnit, conversionFactor } = req.body;
        const unit = await prisma.unit.update({
            where: { id },
            data: { name, baseUnit, conversionFactor }
        });
        res.json(unit);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update unit' });
    }
}

export const deleteUnit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.unit.update({
            where: { id },
            data: { isActive: false }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete unit' });
    }
}
