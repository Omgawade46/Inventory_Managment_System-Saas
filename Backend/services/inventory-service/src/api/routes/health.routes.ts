import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
    res.send({ status: 'OK' });
});

export { router as healthRouter };
