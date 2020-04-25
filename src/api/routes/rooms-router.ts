import { Router } from 'express';
import * as controller from '../controllers/rooms-controller';

const router: Router = Router();

router.post('/create', controller.create);
export default router;
