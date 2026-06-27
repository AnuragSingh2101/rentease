import { Request, Response } from 'express';
import { DamageClaim } from '../models/DamageClaim';
import { Rental } from '../models/Rental';
import { Product } from '../models/Product';


export const createDamageClaim = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only vendors or admins can report damage claims' });
      return;
    }

    const { rental: rentalId, description, severity, deductedAmount, penaltyAmount, inspectionNotes } = req.body;

    if (!rentalId || !description || !severity) {
      res.status(400).json({ success: false, message: 'Please provide rental ID, description, and severity' });
      return;
    }

    const rentalDoc = await Rental.findById(rentalId);
    if (!rentalDoc) {
      res.status(404).json({ success: false, message: 'Rental lease not found' });
      return;
    }


    const productDoc = await Product.findById(rentalDoc.product);
    if (!productDoc) {
      res.status(404).json({ success: false, message: 'Associated product not found' });
      return;
    }

    if (productDoc.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to file a claim for this rental' });
      return;
    }


    const existingClaim = await DamageClaim.findOne({ rental: rentalId });
    if (existingClaim) {
      res.status(400).json({ success: false, message: 'A damage claim has already been filed for this rental lease' });
      return;
    }


    if (Number(deductedAmount) > rentalDoc.deposit) {
      res.status(400).json({
        success: false,
        message: `Deducted deposit amount (₹${deductedAmount}) cannot exceed the rental deposit (₹${rentalDoc.deposit})`,
      });
      return;
    }

    const damageClaim = await DamageClaim.create({
      rental: rentalId,
      reportedBy: req.user._id,
      reportedTo: rentalDoc.user,
      description,
      severity,
      deductedAmount: Number(deductedAmount) || 0,
      penaltyAmount: Number(penaltyAmount) || 0,
      status: 'Pending',
      inspectionNotes: inspectionNotes || '',
    });

    res.status(201).json({
      success: true,
      data: damageClaim,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};


export const updateDamageClaimStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only administrators can update claim status' });
      return;
    }

    const { status, inspectionNotes } = req.body;
    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Settled'];

    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid claim status' });
      return;
    }

    const claim = await DamageClaim.findById(req.params.id);
    if (!claim) {
      res.status(404).json({ success: false, message: 'Damage claim not found' });
      return;
    }

    if (status !== undefined) {
      claim.status = status as any;
    }
    if (inspectionNotes !== undefined) {
      claim.inspectionNotes = inspectionNotes;
    }

    await claim.save();

    res.status(200).json({
      success: true,
      data: claim,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};


export const getMyClaims = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const claims = await DamageClaim.find({ reportedTo: req.user._id })
      .populate({
        path: 'rental',
        populate: {
          path: 'product',
          select: 'name category images monthlyRent deposit',
        },
      })
      .populate({
        path: 'reportedBy',
        select: 'name email phone',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};


export const getVendorClaims = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const query: any = {};
    if (req.user.role !== 'admin') {
      query.reportedBy = req.user._id;
    }

    const claims = await DamageClaim.find(query)
      .populate({
        path: 'rental',
        populate: {
          path: 'product',
          select: 'name category images monthlyRent deposit',
        },
      })
      .populate({
        path: 'reportedTo',
        select: 'name email phone',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};


export const getAdminClaims = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to view admin claims' });
      return;
    }

    const claims = await DamageClaim.find()
      .populate({
        path: 'rental',
        populate: {
          path: 'product',
          select: 'name category images monthlyRent deposit',
        },
      })
      .populate({
        path: 'reportedBy',
        select: 'name email phone',
      })
      .populate({
        path: 'reportedTo',
        select: 'name email phone',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
