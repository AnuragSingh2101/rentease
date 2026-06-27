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


router.get('/', getProducts);


router.get('/my-products', protect, authorize('vendor'), getVendorProducts);


router.get('/:id', getProduct);


router.post('/', protect, authorize('vendor', 'admin'), createProduct);
router.put('/:id', protect, authorize('vendor', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);

export default router;
