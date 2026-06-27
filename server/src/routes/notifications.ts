import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  triggerEndingSoonAlerts
} from '../controllers/notifications';
import { protect, authorize } from '../middleware/auth';

const router = Router();


router.use(protect);

router.route('/')
  .get(getNotifications);

router.route('/read-all')
  .put(markAllAsRead);

router.route('/:id/read')
  .put(markAsRead);

router.route('/trigger-ending-soon')
  .post(authorize('admin'), triggerEndingSoonAlerts);

export default router;
