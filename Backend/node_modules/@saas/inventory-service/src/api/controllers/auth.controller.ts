import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/db';
import { comparePassword } from '../utils/password.utils';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // 1. Find User by Email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // 2. Validate Password
        const isMatch = await comparePassword(password, (user as any).password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: 'Account is disabled' });
        }

        // 3. Generate Token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                outletId: user.outletId,
                businessId: user.businessId
            },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 4. Return User & Token
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user as any;

        res.json({
            user: userWithoutPassword,
            token
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};
