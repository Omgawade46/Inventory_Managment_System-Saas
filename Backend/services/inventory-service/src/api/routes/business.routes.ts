import { Router } from 'express';
import { BusinessController, OutletController } from '../controllers/business.controller';

const router = Router();

router.post('/businesses', BusinessController.createBusiness);
router.get('/businesses/:id', BusinessController.getBusiness);

router.post('/outlets', OutletController.createOutlet);
router.get('/outlets', OutletController.getOutlets);

export { router as businessRouter };
