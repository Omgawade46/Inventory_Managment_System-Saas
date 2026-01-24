import { Router } from 'express';
import { getAlerts, acknowledgeAlert } from '../controllers/inventory-alert.controller';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/alerts', requireRole(['OWNER', 'MANAGER']), getAlerts);
router.patch('/alerts/:id/acknowledge', requireRole(['OWNER', 'MANAGER']), acknowledgeAlert);

export { router as inventoryAlertRouter };
