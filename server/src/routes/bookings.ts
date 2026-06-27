import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getVendorBookings,
  updateBookingStatus,
} from '../controllers/bookings';
import { protect, authorize } from '../middleware/auth';

const router = Router();


router.use(protect);

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/vendor-bookings', authorize('vendor', 'admin'), getVendorBookings);
router.put('/:id/status', authorize('vendor', 'admin'), updateBookingStatus);

export default router;
