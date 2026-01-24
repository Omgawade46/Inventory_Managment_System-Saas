import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/db';

export class BusinessController {
    static async createBusiness(req: Request, res: Response) {
        try {
            const { name, ownerId } = req.body;
            const business = await prisma.business.create({
                data: {
                    name,
                    ownerId,
                },
            });
            res.status(201).json(business);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create business' });
        }
    }

    static async getBusiness(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const business = await prisma.business.findUnique({
                where: { id },
                include: { outlets: true }
            });
            if (!business) return res.status(404).json({ error: 'Business not found' });
            res.json(business);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch business' });
        }
    }
}

export class OutletController {
    static async createOutlet(req: Request, res: Response) {
        try {
            const { businessId, name, address } = req.body;
            const outlet = await prisma.outlet.create({
                data: {
                    businessId,
                    name,
                    address,
                },
            });
            res.status(201).json(outlet);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create outlet' });
        }
    }

    static async getOutlets(req: Request, res: Response) {
        try {
            const { businessId } = req.query;
            if (!businessId) return res.status(400).json({ error: 'Business ID is required' });

            const outlets = await prisma.outlet.findMany({
                where: { businessId: String(businessId) }
            });
            res.json(outlets);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch outlets' });
        }
    }
}
