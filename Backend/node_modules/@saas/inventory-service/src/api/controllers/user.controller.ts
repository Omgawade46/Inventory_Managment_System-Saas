import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/db';

import { hashPassword } from '../utils/password.utils';

export class UserController {
    static async createUser(req: Request, res: Response) {
        try {
            const { businessId, outletId, name, email, role, password } = req.body;
            const hashedPassword = await hashPassword(password || 'password123');

            const user = await prisma.user.create({
                data: {
                    businessId,
                    outletId,
                    name,
                    email,
                    password: hashedPassword,
                    role, // 'OWNER' | 'MANAGER'
                },
            });
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create user' });
        }
    }

    static async getUsers(req: Request, res: Response) {
        try {
            const { businessId, outletId } = req.query;
            const where: any = {};
            if (businessId) where.businessId = String(businessId);
            if (outletId) where.outletId = String(outletId);

            const users = await prisma.user.findMany({ where });
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }
}
