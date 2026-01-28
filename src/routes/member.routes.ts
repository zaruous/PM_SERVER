import { Router } from 'express';
import { memberController } from '../controllers/member.controller';

const router = Router();

router.get('/', memberController.getAllMembers);
router.get('/:id', memberController.getMemberById);
router.post('/', memberController.createMember);
router.put('/:id', memberController.updateMember);
router.delete('/:id', memberController.deleteMember);

export default router;
