import { Request, Response } from 'express';
import { Pickup } from '../models/Pickup';
import { Rental } from '../models/Rental';
import { Product } from '../models/Product';

/**
 * @desc    Request a return pickup
 * @route   POST /api/pickups
 * @access  Private (Customer only)
 */
export const requestPickup = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { rental: rentalId, pickupDate, pickupAddress } = req.body;

    if (!rentalId || !pickupDate || !pickupAddress) {
      res.status(400).json({ success: false, message: 'Please provide rental ID, pickup date, and address' });
      return;
    }

    const rentalDoc = await Rental.findById(rentalId);
    if (!rentalDoc) {
      res.status(404).json({ success: false, message: 'Rental lease not found' });
      return;
    }

    // Verify user owns the rental
    if (rentalDoc.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to request pickup for this lease' });
      return;
    }

    // Check status
    if (rentalDoc.status !== 'Active' && rentalDoc.status !== 'Delivered') {
      res.status(400).json({ success: false, message: 'Only active or delivered rentals can be returned' });
      return;
    }

    // Check if a pickup is already requested/ongoing
    const existingPickup = await Pickup.findOne({ rental: rentalId, pickupStatus: { $ne: 'Completed' } });
    if (existingPickup) {
      res.status(400).json({ success: false, message: 'An active return pickup request already exists for this rental' });
      return;
    }

    const productDoc = await Product.findById(rentalDoc.product);
    if (!productDoc) {
      res.status(404).json({ success: false, message: 'Associated product not found' });
      return;
    }

    const pickup = await Pickup.create({
      rental: rentalId,
      vendor: productDoc.vendor,
      customer: req.user._id,
      pickupDate: new Date(pickupDate),
      pickupAddress,
      pickupStatus: 'Requested',
    });

    res.status(201).json({
      success: true,
      data: pickup,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Schedule return pickup
 * @route   PUT /api/pickups/:id/schedule
 * @access  Private (Vendor/Admin only)
 */
export const schedulePickup = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { pickupDate, assignedTo, trackingNotes } = req.body;

    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) {
      res.status(404).json({ success: false, message: 'Pickup request not found' });
      return;
    }

    // Verify vendor or admin ownership
    if (pickup.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to schedule this pickup' });
      return;
    }

    if (pickupDate) {
      pickup.pickupDate = new Date(pickupDate);
    }
    if (assignedTo !== undefined) {
      pickup.assignedTo = assignedTo;
    }
    if (trackingNotes !== undefined) {
      pickup.trackingNotes = trackingNotes;
    }

    pickup.pickupStatus = 'Scheduled';
    await pickup.save();

    res.status(200).json({
      success: true,
      data: pickup,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Update return pickup status
 * @route   PUT /api/pickups/:id/status
 * @access  Private (Vendor/Admin only)
 */
export const updatePickupStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { pickupStatus, assignedTo, trackingNotes } = req.body;
    const validStatuses = ['Requested', 'Scheduled', 'Picked Up', 'Completed'];

    if (pickupStatus && !validStatuses.includes(pickupStatus)) {
      res.status(400).json({ success: false, message: 'Invalid pickup status' });
      return;
    }

    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) {
      res.status(404).json({ success: false, message: 'Pickup request not found' });
      return;
    }

    // Verify vendor or admin ownership
    if (pickup.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to modify this pickup' });
      return;
    }

    const oldStatus = pickup.pickupStatus;

    if (pickupStatus !== undefined) {
      pickup.pickupStatus = pickupStatus as any;
    }
    if (assignedTo !== undefined) {
      pickup.assignedTo = assignedTo;
    }
    if (trackingNotes !== undefined) {
      pickup.trackingNotes = trackingNotes;
    }

    await pickup.save();

    // If pickup transitioned to Completed, mark associated rental as Returned and restore stock
    if (pickupStatus === 'Completed' && oldStatus !== 'Completed') {
      const rentalDoc = await Rental.findById(pickup.rental);
      if (rentalDoc && rentalDoc.status !== 'Returned') {
        const productDoc = await Product.findById(rentalDoc.product);
        if (productDoc) {
          productDoc.availableQuantity += rentalDoc.quantity;
          await productDoc.save();
        }
        rentalDoc.status = 'Returned';
        await rentalDoc.save();
      }
    }

    res.status(200).json({
      success: true,
      data: pickup,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Get return pickups for the logged-in customer
 * @route   GET /api/pickups/my-pickups
 * @access  Private
 */
export const getMyPickups = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const pickups = await Pickup.find({ customer: req.user._id })
      .populate({
        path: 'rental',
        populate: {
          path: 'product',
          select: 'name category images monthlyRent deposit',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pickups.length,
      data: pickups,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Get return pickups received by vendor/admin
 * @route   GET /api/pickups/vendor-pickups
 * @access  Private (Vendor/Admin only)
 */
export const getVendorPickups = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const query: any = {};
    if (req.user.role !== 'admin') {
      query.vendor = req.user._id;
    }

    const pickups = await Pickup.find(query)
      .populate({
        path: 'rental',
        populate: {
          path: 'product',
          select: 'name category images monthlyRent deposit',
        },
      })
      .populate({
        path: 'customer',
        select: 'name email phone',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pickups.length,
      data: pickups,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
