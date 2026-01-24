import { Request, Response, NextFunction } from 'express';

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

export const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const role = req.headers['x-mock-role'] as string;
    const userId = req.headers['x-mock-user-id'] as string;
    const businessId = req.headers['x-mock-business-id'] as string;
    const outletId = req.headers['x-mock-outlet-id'] as string;

    if (role && (role === 'OWNER' || role === 'MANAGER')) {
        req.user = {
            id: userId || 'mock-user-id',
            role: role as 'OWNER' | 'MANAGER',
            businessId: businessId || undefined,
            outletId: outletId || undefined
        };
        next();
    } else {
        // For now, we can either block or just proceed without user (public access?)
        // Let's block if strict auth is needed, but maybe just skip for now and let RBAC block
        next();
    }
};
