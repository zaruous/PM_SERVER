import { Router } from 'express';
import projectRoutes from './project.routes';
import memberRoutes from './member.routes';
import assignmentRoutes from './assignment.routes';
import positionLevelRoutes from './position.routes';

const router = Router();

router.use('/projects', projectRoutes);
router.use('/members', memberRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/position-levels', positionLevelRoutes);

export default router;
