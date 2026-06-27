import { Request, Response } from 'express';
import { Rental } from '../models/Rental';
import { Product } from '../models/Product';
import { Cart } from '../models/Cart';
import { Delivery } from '../models/Delivery';
import { Notification } from '../models/Notification';


export const createRentals = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { items, deliveryDate, deliveryAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Please provide items to checkout' });
      return;
    }

    if (!deliveryDate || !deliveryAddress) {
      res.status(400).json({ success: false, message: 'Please provide a delivery date and shipping address' });
      return;
    }

    const createdRentals = [];


    for (const item of items) {
      const productDoc = await Product.findById(item.product);
      if (!productDoc) {
        res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
        return;
      }

      if (productDoc.vendor.toString() === req.user._id.toString() && req.user.role !== 'admin') {
        res.status(400).json({ success: false, message: `You cannot rent your own product: ${productDoc.name}` });
        return;
      }
      if (productDoc.availableQuantity < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${productDoc.name}. Available: ${productDoc.availableQuantity}, Requested: ${item.quantity}`
        });
        return;
      }
    }


    for (const item of items) {
      const productDoc = await Product.findById(item.product);
      if (!productDoc) continue;


      productDoc.availableQuantity -= Number(item.quantity);
      await productDoc.save();


      const startDate = new Date(deliveryDate);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + Number(item.tenure));


      const monthlyRent = productDoc.monthlyRent;
      const deposit = productDoc.deposit;
      const totalPrice = (monthlyRent + deposit) * Number(item.quantity);

      const rental = await Rental.create({
        user: req.user._id,
        product: item.product,
        quantity: Number(item.quantity),
        tenure: Number(item.tenure),
        deliveryDate: new Date(deliveryDate),
        deliveryAddress,
        startDate,
        endDate,
        monthlyRent,
        deposit,
        totalPrice,
        status: 'Pending'
      });


      await Delivery.create({
        rental: rental._id,
        vendor: productDoc.vendor,
        customer: req.user._id,
        deliveryDate: new Date(deliveryDate),
        deliveryAddress,
        deliveryStatus: 'Scheduled'
      });

      createdRentals.push(rental);
    }


    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(201).json({
      success: true,
      data: createdRentals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};


export const getMyRentals = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const rentals = await Rental.find({ user: req.user._id })
      .populate({
        path: 'product',
        select: 'name category monthlyRent deposit images vendor'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};


export const getVendorRentals = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }


    let rentalFilter: any = {};
    if (req.user.role !== 'admin') {
      const vendorProducts = await Product.find({ vendor: req.user._id }).select('_id');
      const productIds = vendorProducts.map((p) => p._id);
      if (productIds.length === 0) {
        res.status(200).json({ success: true, count: 0, data: [] });
        return;
      }
      rentalFilter = { product: { $in: productIds } };
    }

    const rentals = await Rental.find(rentalFilter)
      .populate({
        path: 'product',
        select: 'name category monthlyRent deposit images'
      })
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};


export const updateRentalStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { status } = req.body;
    const validStatuses = ['Pending', 'Approved', 'Delivered', 'Active', 'Returned', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid rental status' });
      return;
    }

    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      res.status(404).json({ success: false, message: 'Rental not found' });
      return;
    }


    const productDoc = await Product.findById(rental.product);
    if (!productDoc) {
      res.status(404).json({ success: false, message: 'Associated product not found' });
      return;
    }

    if (productDoc.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to modify this rental status' });
      return;
    }

    const oldStatus = rental.status;
    const isReturningOrCancelling = ['Returned', 'Cancelled'].includes(status);
    const wasRestocked = ['Returned', 'Cancelled'].includes(oldStatus);


    if (isReturningOrCancelling && !wasRestocked) {

      productDoc.availableQuantity += rental.quantity;
      await productDoc.save();
    } else if (!isReturningOrCancelling && wasRestocked) {

      if (productDoc.availableQuantity < rental.quantity) {
        res.status(400).json({
          success: false,
          message: `Cannot change status to ${status}. Insufficient stock to re-claim. Available: ${productDoc.availableQuantity}`
        });
        return;
      }
      productDoc.availableQuantity -= rental.quantity;
      await productDoc.save();
    }

    rental.status = status as any;
    await rental.save();


    try {
      await Notification.create({
        user: rental.user,
        type: status === 'Approved' ? 'RentalApproved' : 'General',
        title: status === 'Approved' ? 'Rental Booking Approved!' : `Rental Status: ${status}`,
        message: `Your rental agreement for "${productDoc.name}" has been updated to ${status}.`,
        isRead: false
      });
    } catch (notifErr) {
      console.error('[Notification Trigger Error] Failed to create rental update alert:', notifErr);
    }

    res.status(200).json({
      success: true,
      data: rental
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};


export const extendRental = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { extendedByMonths } = req.body;

    if (!extendedByMonths || Number(extendedByMonths) < 1) {
      res.status(400).json({ success: false, message: 'Please provide a valid number of months to extend (minimum 1)' });
      return;
    }

    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      res.status(404).json({ success: false, message: 'Rental not found' });
      return;
    }


    if (rental.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to extend this rental' });
      return;
    }

    if (rental.status !== 'Active') {
      res.status(400).json({ success: false, message: 'Only active rentals can be extended' });
      return;
    }

    const previousEndDate = new Date(rental.endDate);
    const newEndDate = new Date(previousEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + Number(extendedByMonths));

    const extraPaidAmount = rental.monthlyRent * Number(extendedByMonths) * rental.quantity;


    rental.endDate = newEndDate;
    rental.tenure += Number(extendedByMonths);
    rental.totalPrice += extraPaidAmount;


    if (!rental.extensionHistory) {
      rental.extensionHistory = [];
    }

    rental.extensionHistory.push({
      extendedByMonths: Number(extendedByMonths),
      previousEndDate,
      newEndDate,
      extraPaidAmount,
      createdAt: new Date()
    });

    await rental.save();

    res.status(200).json({
      success: true,
      data: rental
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
