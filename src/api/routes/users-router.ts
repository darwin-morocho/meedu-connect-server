import { Router } from 'express';
import * as controller from '../controllers/users-controller';
import { thirdAuth } from '../../middlewares/auth';

const router: Router = Router();

router.post('/create-token', thirdAuth, controller.createUserToken);
export default router;
