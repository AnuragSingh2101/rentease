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


router.use(protect);

router.route('/')
  .post(createRentals);

router.route('/my-rentals')
  .get(getMyRentals);


router.route('/vendor-rentals')
  .get(authorize('vendor', 'admin'), getVendorRentals);

router.route('/:id/status')
  .put(updateRentalStatus);

router.route('/:id/extend')
  .post(extendRental);

export default router;
