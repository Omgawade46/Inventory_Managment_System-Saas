import { Router } from 'express';
import { createMaterial, getMaterials, updateMaterial, deleteMaterial } from '../controllers/raw-material.controller';

const router = Router();

router.post('/raw-materials', createMaterial);
router.get('/raw-materials', getMaterials);
router.put('/raw-materials/:id', updateMaterial);
router.delete('/raw-materials/:id', deleteMaterial);

export { router as rawMaterialRouter };
