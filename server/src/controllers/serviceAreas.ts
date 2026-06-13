import { Request, Response } from 'express';
import { ServiceArea } from '../models/ServiceArea';

/**
 * @desc    Get all service areas
 * @route   GET /api/service-areas
 * @access  Public
 */
export const getServiceAreas = async (req: Request, res: Response): Promise<void> => {
  try {
    const areas = await ServiceArea.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: areas.length,
      data: areas,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Create a new service area
 * @route   POST /api/service-areas
 * @access  Private (Admin only)
 */
export const createServiceArea = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized as admin' });
      return;
    }

    const { name, city, state, postalCodes, isActive } = req.body;

    if (!name || !city || !state || !postalCodes || !Array.isArray(postalCodes) || postalCodes.length === 0) {
      res.status(400).json({ success: false, message: 'Please provide valid name, city, state, and list of postal codes' });
      return;
    }

    const area = await ServiceArea.create({
      name,
      city,
      state,
      postalCodes: postalCodes.map(pc => String(pc).trim()),
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      data: area,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Update a service area
 * @route   PUT /api/service-areas/:id
 * @access  Private (Admin only)
 */
export const updateServiceArea = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized as admin' });
      return;
    }

    const { name, city, state, postalCodes, isActive } = req.body;

    const area = await ServiceArea.findById(req.params.id);
    if (!area) {
      res.status(404).json({ success: false, message: 'Service area not found' });
      return;
    }

    if (name !== undefined) area.name = name;
    if (city !== undefined) area.city = city;
    if (state !== undefined) area.state = state;
    if (postalCodes !== undefined && Array.isArray(postalCodes)) {
      area.postalCodes = postalCodes.map(pc => String(pc).trim());
    }
    if (isActive !== undefined) area.isActive = isActive;

    await area.save();

    res.status(200).json({
      success: true,
      data: area,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

/**
 * @desc    Delete a service area
 * @route   DELETE /api/service-areas/:id
 * @access  Private (Admin only)
 */
export const deleteServiceArea = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized as admin' });
      return;
    }

    const area = await ServiceArea.findById(req.params.id);
    if (!area) {
      res.status(404).json({ success: false, message: 'Service area not found' });
      return;
    }

    await area.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service area removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
