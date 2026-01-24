import { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized: No user found' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: `Forbidden: Requires one of [${allowedRoles.join(', ')}]` });
        }

        next();
    };
};

/* 
// Future: Granular Permission Check
export const requirePermission = (permission: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Fetch role_permissions table based on req.user.role and check specific column
    }
}
*/
