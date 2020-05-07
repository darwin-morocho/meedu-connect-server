import { Router } from 'express';
import * as controller from '../controllers/rooms-controller';
import { userAuth } from '../../middlewares/auth';

const router: Router = Router();

router.post('/create', userAuth, controller.create);
export default router;
