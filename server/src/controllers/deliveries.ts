import { Request, Response } from 'express';
import { Delivery } from '../models/Delivery';
import { Rental } from '../models/Rental';
import { Notification } from '../models/Notification';

/**
 * @desc    Get deliveries received by vendor
 * @route   GET /api/deliveries/vendor
 * @access  Private (Vendor/Admin only)
 */
export const getVendorDeliveries = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const query: any = {};
    if (req.user.role !== 'admin') {
      query.vendor = req.user._id;
    }

    const deliveries = await Delivery.find(query)
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
      count: deliveries.length,
      data: deliveries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Update delivery status & assignment
 * @route   PUT /api/deliveries/:id/status
 * @access  Private (Vendor/Admin only)
 */
export const updateDeliveryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { deliveryStatus, assignedTo, trackingNotes } = req.body;
    const validStatuses = ['Scheduled', 'Assigned', 'Delivered'];

    if (deliveryStatus && !validStatuses.includes(deliveryStatus)) {
      res.status(400).json({ success: false, message: 'Invalid delivery status' });
      return;
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      res.status(404).json({ success: false, message: 'Delivery record not found' });
      return;
    }

    // Verify vendor or admin ownership
    if (delivery.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to modify this delivery' });
      return;
    }

    if (deliveryStatus !== undefined) {
      delivery.deliveryStatus = deliveryStatus as any;
    }
    if (assignedTo !== undefined) {
      delivery.assignedTo = assignedTo;
    }
    if (trackingNotes !== undefined) {
      delivery.trackingNotes = trackingNotes;
    }

    await delivery.save();

    // Trigger Notification for Customer Owner
    try {
      await Notification.create({
        user: delivery.customer,
        type: 'DeliveryUpdate',
        title: `Delivery Status: ${deliveryStatus || 'Assigned'}`,
        message: `The delivery for your rental item has been updated to: ${deliveryStatus || 'Assigned'}. notes: ${trackingNotes || 'No notes added'}.`,
        isRead: false
      });
    } catch (notifErr) {
      console.error('[Notification Trigger Error] Failed to create delivery alert:', notifErr);
    }
 
    // If marked as Delivered, activate the lease on the associated Rental document
    if (deliveryStatus === 'Delivered') {
      const rental = await Rental.findById(delivery.rental);
      if (rental) {
        // Activate rental
        rental.status = 'Active';
        
        // Dynamically adjust start date to today (actual delivery) and compute new end date
        const today = new Date();
        rental.startDate = today;
        
        const endDate = new Date(today);
        endDate.setMonth(today.getMonth() + rental.tenure);
        rental.endDate = endDate;
        
        await rental.save();
      }
    }

    res.status(200).json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Get deliveries for the logged-in customer
 * @route   GET /api/deliveries/my-deliveries
 * @access  Private
 */
export const getMyDeliveries = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const deliveries = await Delivery.find({ customer: req.user._id })
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
      count: deliveries.length,
      data: deliveries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
