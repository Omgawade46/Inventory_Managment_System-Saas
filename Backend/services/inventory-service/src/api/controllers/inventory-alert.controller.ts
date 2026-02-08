import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/db';

export const getAlerts = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const whereClause: any = {};
        if (status) whereClause.status = String(status);

        const alerts = await prisma.inventoryAlert.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: { rawMaterial: true }
        });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
};

export const acknowledgeAlert = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        //@ts-ignore
        const userId = req.user?.id;

        const alert = await prisma.inventoryAlert.update({
            where: { id },
            data: {
                status: 'ACKNOWLEDGED',
                acknowledgedBy: userId
            }
        });
        res.json(alert);
    } catch (error) {
        res.status(500).json({ error: 'Failed to acknowledge alert' });
    }
}
