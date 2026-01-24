import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: 'OWNER' | 'MANAGER';
                businessId?: string;
                outletId?: string;
            };
        }
    }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
            if (err) {
                return res.sendStatus(403); // Forbidden (Token invalid/expired)
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401); // Unauthorized (No token)
    }
};
