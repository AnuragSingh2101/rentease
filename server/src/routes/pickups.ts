import { Router } from 'express';
import {
  requestPickup,
  schedulePickup,
  updatePickupStatus,
  getMyPickups,
  getVendorPickups
} from '../controllers/pickups';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Secure all routes
router.use(protect);

// Customer endpoints
router.route('/')
  .post(requestPickup);

router.route('/my-pickups')
  .get(getMyPickups);

// Only vendors and admins can schedule/update pickup statuses
router.use(authorize('vendor', 'admin'));

router.route('/vendor-pickups')
  .get(getVendorPickups);

router.route('/:id/schedule')
  .put(schedulePickup);

router.route('/:id/status')
  .put(updatePickupStatus);

export default router;
