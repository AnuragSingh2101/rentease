import { Router } from 'express';
import { getVendorDeliveries, updateDeliveryStatus, getMyDeliveries } from '../controllers/deliveries';
import { protect, authorize } from '../middleware/auth';

const router = Router();


router.use(protect);


router.route('/my-deliveries')
  .get(getMyDeliveries);


router.use(authorize('vendor', 'admin'));

router.route('/vendor')
  .get(getVendorDeliveries);

router.route('/:id/status')
  .put(updateDeliveryStatus);

export default router;
