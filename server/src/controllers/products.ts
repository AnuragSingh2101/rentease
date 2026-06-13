import { Request, Response } from 'express';
import { Product } from '../models/Product';

/**
 * @desc    Get all products (public)
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, minRent, maxRent, availability, search, sort, page = '1', limit = '8' } = req.query;
    const query: any = {};

    // Category Filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Monthly Rent Range Filter
    if (minRent || maxRent) {
      query.monthlyRent = {};
      if (minRent) query.monthlyRent.$gte = Number(minRent);
      if (maxRent) query.monthlyRent.$lte = Number(maxRent);
    }

    // Availability Filter
    if (availability === 'true') {
      query.availableQuantity = { $gt: 0 };
    }

    // Keyword Search
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
      ];
    }

    // Sorting Options
    let sortQuery: any = { createdAt: -1 }; // default newest
    if (sort === 'priceAsc') {
      sortQuery = { monthlyRent: 1 };
    } else if (sort === 'priceDesc') {
      sortQuery = { monthlyRent: -1 };
    }

    // Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 8;
    const skipNum = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skipNum)
      .limit(limitNum)
      .populate('vendor', 'name email phone');

    res.status(200).json({
      success: true,
      count: total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Get single product details (public)
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'name email phone');

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Create new product listing
 * @route   POST /api/products
 * @access  Private (Vendor or Admin)
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    let vendorId = req.user._id;
    if (req.user.role === 'admin' && req.body.vendor) {
      vendorId = req.body.vendor;
    }

    const productData = {
      ...req.body,
      vendor: vendorId,
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Update product details
 * @route   PUT /api/products/:id
 * @access  Private (Vendor or Admin)
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Check ownership
    if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to update this product',
      });
      return;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Vendor or Admin)
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Check ownership
    if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this product',
      });
      return;
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Get products owned by logged in vendor
 * @route   GET /api/products/my-products
 * @access  Private (Vendor only)
 */
export const getVendorProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const products = await Product.find({ vendor: req.user._id });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
