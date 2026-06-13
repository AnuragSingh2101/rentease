import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Listing } from '../models/Listing';
import { Product } from '../models/Product';

/**
 * @desc    Create new booking/reservation
 * @route   POST /api/bookings
 * @access  Private
 */
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { bookingType, listing, product, startDate, duration, quantity = 1 } = req.body;

    if (!bookingType || !startDate || !duration) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    let vendorId;
    let totalPrice = 0;
    let endDate;

    if (bookingType === 'listing') {
      if (!listing) {
        res.status(400).json({ success: false, message: 'Please provide a listing ID' });
        return;
      }

      const listingDoc = await Listing.findById(listing);
      if (!listingDoc) {
        res.status(404).json({ success: false, message: 'Listing not found' });
        return;
      }

      vendorId = listingDoc.vendor;
      totalPrice = listingDoc.price * Number(duration);
      
      const start = new Date(startDate);
      endDate = new Date(start.getTime() + Number(duration) * 24 * 60 * 60 * 1000);
    } else if (bookingType === 'product') {
      if (!product) {
        res.status(400).json({ success: false, message: 'Please provide a product ID' });
        return;
      }

      const productDoc = await Product.findById(product);
      if (!productDoc) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }

      vendorId = productDoc.vendor;
      // Total price is deposit + 1st month rent as calculated in UI, or total duration rent.
      // Let's set it to 1st month rent + deposit * quantity
      totalPrice = (productDoc.deposit + productDoc.monthlyRent) * Number(quantity);
    } else {
      res.status(400).json({ success: false, message: 'Invalid booking type' });
      return;
    }

    // Prevent booking your own listings
    if (vendorId.toString() === req.user._id.toString() && req.user.role !== 'admin') {
      res.status(400).json({ success: false, message: 'You cannot book your own listing' });
      return;
    }

    const booking = await Booking.create({
      user: req.user._id,
      vendor: vendorId,
      bookingType,
      listing,
      product,
      startDate: new Date(startDate),
      endDate,
      duration: Number(duration),
      totalPrice,
      quantity: Number(quantity),
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Get bookings made by logged-in customer/user
 * @route   GET /api/bookings/my-bookings
 * @access  Private
 */
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'listing',
        select: 'title location price image category'
      })
      .populate({
        path: 'product',
        select: 'name monthlyRent deposit images category'
      })
      .populate({
        path: 'vendor',
        select: 'name email phone'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Get bookings received by vendor
 * @route   GET /api/bookings/vendor-bookings
 * @access  Private (Vendor/Admin only)
 */
export const getVendorBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const query: any = {};
    if (req.user.role !== 'admin') {
      query.vendor = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'listing',
        select: 'title location price image category'
      })
      .populate({
        path: 'product',
        select: 'name monthlyRent deposit images category'
      })
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Update booking status (confirm or cancel)
 * @route   PUT /api/bookings/:id/status
 * @access  Private (Vendor/Admin only)
 */
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Make sure user is owner vendor or admin
    if (booking.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to modify this booking' });
      return;
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
