import { Router } from 'express';
import { getVendorDeliveries, updateDeliveryStatus, getMyDeliveries } from '../controllers/deliveries';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Secure all routes
router.use(protect);

// Customer deliveries tracking route
router.route('/my-deliveries')
  .get(getMyDeliveries);

// Only vendors and admins can manage/view vendor/status deliveries
router.use(authorize('vendor', 'admin'));

router.route('/vendor')
  .get(getVendorDeliveries);

router.route('/:id/status')
  .put(updateDeliveryStatus);

export default router;
