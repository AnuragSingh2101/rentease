import { Request, Response } from 'express';
import { Maintenance } from '../models/Maintenance';
import { Product } from '../models/Product';
import { Listing } from '../models/Listing';
import { Rental } from '../models/Rental';
import { Booking } from '../models/Booking';
import { Notification } from '../models/Notification';

/**
 * @desc    Submit a new maintenance request
 * @route   POST /api/maintenance
 * @access  Private
 */
export const createRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { itemType, listing, product, rental, booking, title, description, images } = req.body;

    if (!title || !description || !itemType) {
      res.status(400).json({ success: false, message: 'Please provide a title, description, and item type' });
      return;
    }

    const maintenanceData: any = {
      user: req.user._id,
      itemType,
      title,
      description,
      images: images || [],
      status: 'Open',
      comments: []
    };

    // Auto-populate item context links if contract objects are provided
    if (itemType === 'product') {
      if (product) {
        maintenanceData.product = product;
      }
      if (rental) {
        maintenanceData.rental = rental;
        const rentalDoc = await Rental.findById(rental);
        if (rentalDoc && !product) {
          maintenanceData.product = rentalDoc.product;
        }
      }
    } else if (itemType === 'listing') {
      if (listing) {
        maintenanceData.listing = listing;
      }
      if (booking) {
        maintenanceData.booking = booking;
        const bookingDoc = await Booking.findById(booking);
        if (bookingDoc && !listing) {
          maintenanceData.listing = bookingDoc.listing;
        }
      }
    }

    const request = await Maintenance.create(maintenanceData);

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Get maintenance requests submitted by current customer
 * @route   GET /api/maintenance/my-requests
 * @access  Private
 */
export const getMyRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const requests = await Maintenance.find({ user: req.user._id })
      .populate('product', 'name category images monthlyRent')
      .populate('listing', 'title category location price image')
      .populate('rental', 'status startDate endDate quantity')
      .populate('booking', 'status startDate endDate duration')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Get maintenance requests submitted against vendor's items
 * @route   GET /api/maintenance/vendor-requests
 * @access  Private (Vendor/Admin only)
 */
export const getVendorRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Retrieve vendor's products & listings to filter tickets
    const vendorProducts = await Product.find({ vendor: req.user._id }).select('_id');
    const vendorListings = await Listing.find({ vendor: req.user._id }).select('_id');

    const productIds = vendorProducts.map((p) => p._id);
    const listingIds = vendorListings.map((l) => l._id);

    const requests = await Maintenance.find({
      $or: [
        { product: { $in: productIds } },
        { listing: { $in: listingIds } }
      ]
    })
      .populate('user', 'name email phone')
      .populate('product', 'name category images')
      .populate('listing', 'title location category')
      .populate('rental', 'status startDate endDate quantity')
      .populate('booking', 'status startDate endDate duration')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Get all maintenance requests globally (Admin)
 * @route   GET /api/maintenance/admin-requests
 * @access  Private (Admin only)
 */
export const getAdminRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const requests = await Maintenance.find({})
      .populate('user', 'name email phone')
      .populate('product', 'name category images vendor')
      .populate('listing', 'title location category vendor')
      .populate('rental', 'status startDate endDate quantity')
      .populate('booking', 'status startDate endDate duration')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Get detailed single maintenance ticket
 * @route   GET /api/maintenance/:id
 * @access  Private
 */
export const getRequestDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const request = await Maintenance.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('product', 'name category images vendor')
      .populate('listing', 'title location category vendor')
      .populate('rental', 'status startDate endDate quantity')
      .populate('booking', 'status startDate endDate duration');

    if (!request) {
      res.status(404).json({ success: false, message: 'Maintenance ticket not found' });
      return;
    }

    // Verify authorized access (Customer, vendor of item, or admin)
    const isAdmin = req.user.role === 'admin';
    const isCustomerOwner = (request.user as any).toString() === req.user._id.toString();

    let isVendorOwner = false;
    if (request.product && (request.product as any).vendor) {
      isVendorOwner = (request.product as any).vendor.toString() === req.user._id.toString();
    } else if (request.listing && (request.listing as any).vendor) {
      isVendorOwner = (request.listing as any).vendor.toString() === req.user._id.toString();
    }

    if (!isAdmin && !isCustomerOwner && !isVendorOwner) {
      res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
      return;
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Update maintenance request status
 * @route   PUT /api/maintenance/:id/status
 * @access  Private (Vendor/Admin only)
 */
export const updateRequestStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { status } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Resolved'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid maintenance status' });
      return;
    }

    const ticket = await Maintenance.findById(req.params.id)
      .populate('product', 'vendor')
      .populate('listing', 'vendor');

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Maintenance ticket not found' });
      return;
    }

    // Check vendor ownership or admin
    let isAuthorized = req.user.role === 'admin';
    if (!isAuthorized) {
      if (ticket.product && (ticket.product as any).vendor.toString() === req.user._id.toString()) {
        isAuthorized = true;
      } else if (ticket.listing && (ticket.listing as any).vendor.toString() === req.user._id.toString()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Not authorized to change this ticket status' });
      return;
    }

    ticket.status = status as any;
    await ticket.save();

    // Trigger Notification to Customer Owner
    try {
      await Notification.create({
        user: ticket.user,
        type: 'MaintenanceUpdate',
        title: 'Maintenance Ticket Updated',
        message: `Your maintenance request "${ticket.title}" has been updated to: ${status}.`,
        isRead: false
      });
    } catch (notifErr) {
      console.error('[Notification Trigger Error] Failed to create maintenance status alert:', notifErr);
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Add comment reply to maintenance ticket
 * @route   POST /api/maintenance/:id/comments
 * @access  Private
 */
export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      res.status(400).json({ success: false, message: 'Please provide comment text' });
      return;
    }

    const ticket = await Maintenance.findById(req.params.id)
      .populate('product', 'vendor')
      .populate('listing', 'vendor');

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Maintenance ticket not found' });
      return;
    }

    // Verify authorized access (Customer owner, vendor owner, or admin)
    const isAdmin = req.user.role === 'admin';
    const isCustomerOwner = ticket.user.toString() === req.user._id.toString();

    let isVendorOwner = false;
    if (ticket.product && (ticket.product as any).vendor) {
      isVendorOwner = (ticket.product as any).vendor.toString() === req.user._id.toString();
    } else if (ticket.listing && (ticket.listing as any).vendor) {
      isVendorOwner = (ticket.listing as any).vendor.toString() === req.user._id.toString();
    }

    if (!isAdmin && !isCustomerOwner && !isVendorOwner) {
      res.status(403).json({ success: false, message: 'Not authorized to comment on this ticket' });
      return;
    }

    ticket.comments.push({
      user: req.user._id as any,
      name: req.user.name,
      text: text.trim(),
      createdAt: new Date()
    });

    await ticket.save();

    // Trigger Notification for Recipient
    try {
      const isCommenterCustomer = req.user._id.toString() === ticket.user.toString();
      const recipient = isCommenterCustomer 
        ? ((ticket.product as any)?.vendor || (ticket.listing as any)?.vendor || req.user._id)
        : ticket.user;

      await Notification.create({
        user: recipient,
        type: 'MaintenanceUpdate',
        title: 'New Reply on Maintenance Ticket',
        message: `New message reply on maintenance ticket "${ticket.title}": "${text.slice(0, 50)}..."`,
        isRead: false
      });
    } catch (notifErr) {
      console.error('[Notification Trigger Error] Failed to create maintenance comment alert:', notifErr);
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
