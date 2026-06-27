import { Router } from 'express';
import {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getVendorListings,
} from '../controllers/listings';
import { protect, authorize } from '../middleware/auth';

const router = Router();


router.get('/', getListings);


router.get('/my-listings', protect, authorize('vendor'), getVendorListings);


router.get('/:id', getListing);


router.post('/', protect, authorize('vendor', 'admin'), createListing);
router.put('/:id', protect, authorize('vendor', 'admin'), updateListing);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteListing);

export default router;
