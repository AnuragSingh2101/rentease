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

// Public explore route
router.get('/', getListings);

// Vendor-specific listings (must be registered before /:id)
router.get('/my-listings', protect, authorize('vendor'), getVendorListings);

// Single listing details
router.get('/:id', getListing);

// CRUD operations
router.post('/', protect, authorize('vendor', 'admin'), createListing);
router.put('/:id', protect, authorize('vendor', 'admin'), updateListing);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteListing);

export default router;
