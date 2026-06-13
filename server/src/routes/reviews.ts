import { Router } from 'express';
import {
  createReview,
  getProductReviews
} from '../controllers/reviews';
import { protect } from '../middleware/auth';

const router = Router();

router.route('/')
  .post(protect, createReview);

router.route('/product/:productId')
  .get(getProductReviews);

export default router;
