import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
} from '../controllers/products';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Public explore route
router.get('/', getProducts);

// Vendor-specific products (must be registered before /:id)
router.get('/my-products', protect, authorize('vendor'), getVendorProducts);

// Single product details
router.get('/:id', getProduct);

// CRUD operations
router.post('/', protect, authorize('vendor', 'admin'), createProduct);
router.put('/:id', protect, authorize('vendor', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);

export default router;
