import { Router } from 'express';
import {
    assignChefToCategory,
    createCategory,
    getCategories,
    getChefQueue,
    getReadyItems,
    markItemServed,
    updateItemStatus
} from '../controllers/kitchen.controller';

const router = Router();

// Setup
router.get('/kitchen/categories', getCategories);
router.post('/kitchen/categories', createCategory);
router.post('/kitchen/assign', assignChefToCategory);

// Chef Flow
router.get('/kitchen/queue', getChefQueue);
router.patch('/kitchen/items/:id/status', updateItemStatus);

// Staff Flow
router.get('/staff/ready-items', getReadyItems);
router.patch('/staff/items/:id/served', markItemServed);

export { router as kitchenRouter };
