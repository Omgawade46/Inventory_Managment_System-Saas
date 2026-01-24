import { Router } from 'express';
import { createStockLog, getStockLogs } from '../controllers/stock-log.controller';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.post('/stock-logs', requireRole(['OWNER', 'MANAGER']), createStockLog);
router.get('/stock-logs', getStockLogs);

export { router as stockLogRouter };
