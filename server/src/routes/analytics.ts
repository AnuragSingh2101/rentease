import { Router } from 'express';
import { getAdminAnalytics } from '../controllers/analytics';
import { protect, authorize } from '../middleware/auth';

const router = Router();


router.use(protect);
router.use(authorize('admin'));

router.route('/admin')
  .get(getAdminAnalytics);

export default router;
