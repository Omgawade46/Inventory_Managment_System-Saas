import { Router } from 'express';
import {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    checkProductAvailability,
    deductStockForSale,
    getProductCostBreakdown
} from '../controllers/product.controller';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// Allow Owner and Manager to manage products
router.post('/products', requireRole(['OWNER', 'MANAGER']), createProduct);
router.get('/products', getProducts);
router.put('/products/:id', requireRole(['OWNER', 'MANAGER']), updateProduct);
router.delete('/products/:id', requireRole(['OWNER', 'MANAGER']), deleteProduct);

// Inventory availability and stock deduction endpoints (for ordering system integration)
router.get('/products/:productId/check-availability', checkProductAvailability);
router.post('/products/:productId/deduct-stock', deductStockForSale);

// Cost calculation endpoint (for owner analytics)
router.get('/products/:productId/cost-breakdown', getProductCostBreakdown);

export { router as productRouter };
