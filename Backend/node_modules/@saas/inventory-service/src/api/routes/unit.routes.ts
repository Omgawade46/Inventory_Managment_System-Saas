import { Router } from 'express';
import { createUnit, getUnits, updateUnit, deleteUnit } from '../controllers/unit.controller'; // .ts extension for now, will fix import if needed

const router = Router();

router.post('/units', createUnit);
router.get('/units', getUnits);
router.put('/units/:id', updateUnit);
router.delete('/units/:id', deleteUnit);

export { router as unitRouter };
