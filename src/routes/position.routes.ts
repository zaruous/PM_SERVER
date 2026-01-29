import { Router } from 'express';
import { positionLevelController } from '../controllers/position.controller';

const router = Router();

router.get('/', positionLevelController.getAllPositionLevels);

export default router;
