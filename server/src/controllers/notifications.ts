import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { Rental } from '../models/Rental';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const triggerEndingSoonAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized as admin' });
      return;
    }

    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);


    const endingRentals = await Rental.find({
      status: 'Active',
      endDate: { $gte: now, $lte: threeDaysLater },
    }).populate({
      path: 'product',
      select: 'name',
    });

    let createdCount = 0;

    for (const rental of endingRentals) {
      const prodName = (rental.product as any)?.name || 'your rented product';
      const existing = await Notification.findOne({
        user: rental.user,
        type: 'RentalEndingSoon',
        message: { $regex: rental._id.toString() },
      });

      if (!existing) {
        await Notification.create({
          user: rental.user,
          type: 'RentalEndingSoon',
          title: 'Rental Agreement Ending Soon',
          message: `Your rental lease for ${prodName} (Lease ID: #${rental._id.toString().slice(-6).toUpperCase()}) ends soon on ${new Date(rental.endDate).toLocaleDateString()}. Please prepare for returning or extend the lease.`,
          isRead: false,
        });
        createdCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Trigger check complete. Dispatched ${createdCount} ending-soon alerts.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
