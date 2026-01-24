import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();

router.post('/users', UserController.createUser);
router.get('/users', UserController.getUsers);

export { router as userRouter };
