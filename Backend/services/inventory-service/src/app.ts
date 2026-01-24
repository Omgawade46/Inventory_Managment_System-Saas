import express from 'express';
import { healthRouter } from './api/routes/health.routes';
import { businessRouter } from './api/routes/business.routes';
import { userRouter } from './api/routes/user.routes';
import { unitRouter } from './api/routes/unit.routes';
import { rawMaterialRouter } from './api/routes/raw-material.routes';
import { productRouter } from './api/routes/product.routes';
import { recipeRouter } from './api/routes/recipe.routes';
import { stockLogRouter } from './api/routes/stock-log.routes';
import { inventoryAlertRouter } from './api/routes/inventory-alert.routes';
import { authRouter } from './api/routes/auth.routes';
import { authenticateJWT } from './api/middlewares/jwt.middleware';
import cors from 'cors';

// ... imports ...

const app = express();

app.use(cors());
app.use(express.json());

// Public Routes
app.use('/api', authRouter);
app.use(healthRouter);

// Protected Routes
app.use('/api', authenticateJWT, businessRouter);
app.use('/api', authenticateJWT, userRouter);
app.use('/api', authenticateJWT, unitRouter);
app.use('/api', authenticateJWT, rawMaterialRouter);
app.use('/api', authenticateJWT, productRouter);
app.use('/api', authenticateJWT, recipeRouter);
app.use('/api', authenticateJWT, stockLogRouter);
app.use('/api', authenticateJWT, inventoryAlertRouter);


// app.use(errorHandler);

export { app };
