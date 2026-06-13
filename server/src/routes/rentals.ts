import { Router } from 'express';
import {
  createRentals,
  getMyRentals,
  getVendorRentals,
  updateRentalStatus,
  extendRental
} from '../controllers/rentals';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Secure all routes
router.use(protect);

router.route('/')
  .post(createRentals);

router.route('/my-rentals')
  .get(getMyRentals);

// Only vendors and admins can access vendor-rentals
router.route('/vendor-rentals')
  .get(authorize('vendor', 'admin'), getVendorRentals);

router.route('/:id/status')
  .put(updateRentalStatus);

router.route('/:id/extend')
  .post(extendRental);

export default router;
