import { Request, Response } from 'express';
import { Listing } from '../models/Listing';

/**
 * @desc    Get all listings (public)
 * @route   GET /api/listings
 * @access  Public
 */
export const getListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, location, search, page = '1', limit = '8' } = req.query;
    const query: any = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (location) {
      query.location = { $regex: location as string, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
        { location: { $regex: search as string, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 8;
    const skipNum = (pageNum - 1) * limitNum;

    const total = await Listing.countDocuments(query);
    const listings = await Listing.find(query)
      .skip(skipNum)
      .limit(limitNum)
      .populate('vendor', 'name email phone');

    res.status(200).json({
      success: true,
      count: total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Get single listing (public)
 * @route   GET /api/listings/:id
 * @access  Public
 */
export const getListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const listing = await Listing.findById(req.params.id).populate('vendor', 'name email phone');

    if (!listing) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Create new listing
 * @route   POST /api/listings
 * @access  Private (Vendor or Admin)
 */
export const createListing = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is logged in
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Add vendor field
    // If admin is creating, allow setting custom vendor, otherwise default to logged in user ID
    let vendorId = req.user._id;
    if (req.user.role === 'admin' && req.body.vendor) {
      vendorId = req.body.vendor;
    }

    const listingData = {
      ...req.body,
      vendor: vendorId,
    };

    const listing = await Listing.create(listingData);

    res.status(201).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Update listing
 * @route   PUT /api/listings/:id
 * @access  Private (Vendor or Admin)
 */
export const updateListing = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }

    // Make sure user is listing owner or admin
    if (listing.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: `User ${req.user._id} is not authorized to update this listing`,
      });
      return;
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Delete listing
 * @route   DELETE /api/listings/:id
 * @access  Private (Vendor or Admin)
 */
export const deleteListing = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      res.status(404).json({ success: false, message: 'Listing not found' });
      return;
    }

    // Make sure user is listing owner or admin
    if (listing.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: `User ${req.user._id} is not authorized to delete this listing`,
      });
      return;
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Listing removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Get listings owned by logged in vendor
 * @route   GET /api/listings/my-listings
 * @access  Private (Vendor only)
 */
export const getVendorListings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const listings = await Listing.find({ vendor: req.user._id });

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
