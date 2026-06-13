import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Rental } from '../models/Rental';
import { Product } from '../models/Product';

/**
 * @desc    Create a new product review
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      res.status(400).json({ success: false, message: 'Please provide productId, rating, and comment' });
      return;
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
      return;
    }

    // 1. Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // 2. Verify user has actually rented this product (status Active or Returned)
    const hasRented = await Rental.findOne({
      user: req.user._id,
      product: productId,
      status: { $in: ['Active', 'Returned'] }
    });

    if (!hasRented) {
      res.status(400).json({
        success: false,
        message: 'Access Denied: You can only review products that you have rented and received.'
      });
      return;
    }

    // 3. Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (alreadyReviewed) {
      res.status(400).json({ success: false, message: 'You have already reviewed this product' });
      return;
    }

    // 4. Create review
    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment: comment.trim()
    });

    // 5. Recalculate average rating for the product
    const productReviews = await Review.find({ product: productId });
    const avgRating = productReviews.reduce((sum, rev) => sum + rev.rating, 0) / productReviews.length;

    // Save average rating back to product if rating field is supported (we'll make sure it runs fine)
    try {
      await Product.findByIdAndUpdate(productId, { rating: Math.round(avgRating * 10) / 10 });
    } catch (dbErr) {
      console.warn('Could not update average rating on Product document (schema lacks field):', dbErr instanceof Error ? dbErr.message : dbErr);
    }

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Get all reviews for a product
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
