import express from 'express';
import path from 'path';
import fs from 'fs';
import Service from '../models/Service.js';
import { protect, providerOnly } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { getCoordinatesForDistrict } from '../utils/haversine.js';

const router = express.Router();

router.use(protect, providerOnly);

// Helper function to safely delete file from uploads directory
const safeDeleteUploadFile = (imageUrl) => {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) return;
  try {
    const filename = path.basename(imageUrl);
    const filePath = path.join(process.cwd(), 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[Uploads] Cleaned up file from disk: ${filename}`);
    }
  } catch (err) {
    console.error(`[Uploads] Error deleting file ${imageUrl}:`, err.message);
  }
};

// @desc    Create a new service listing with provider location and raw image upload
// @route   POST /api/provider/services
// @access  Private (Provider)
router.post('/services', upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      category,
      taskType,
      pricingUnit,
      priceInRupees,
      status,
      locationRadiusKm,
      description
    } = req.body;

    if (!title || !category || !taskType || !pricingUnit || priceInRupees === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, category, taskType, pricingUnit, priceInRupees'
      });
    }

    // Set image URL from uploaded file if present
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Always fetch provider location coordinates and details from request or user profile
    const providerState = req.body.state || req.user.state || 'Andhra Pradesh';
    const providerDistrict = req.body.district || req.user.district || 'Guntur';
    const providerVillage = req.body.village || req.user.village || 'Locality';
    let providerCoords;

    if (req.body.userLat && req.body.userLng) {
      providerCoords = { latitude: Number(req.body.userLat), longitude: Number(req.body.userLng) };
    } else if (req.user.location && req.user.location.latitude) {
      providerCoords = req.user.location;
    } else {
      providerCoords = getCoordinatesForDistrict(providerDistrict);
    }

    const service = await Service.create({
      providerId: req.user._id,
      title,
      category,
      taskType,
      pricingUnit,
      priceInRupees: Number(priceInRupees),
      imageUrl,
      status: status || 'available',
      locationRadiusKm: locationRadiusKm ? Number(locationRadiusKm) : 25,
      state: providerState,
      district: providerDistrict,
      village: providerVillage,
      location: providerCoords,
      description: description || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('[ProviderRoutes] Error creating service:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating service'
    });
  }
});

// @desc    Fetch provider's own service listings
// @route   GET /api/provider/services
// @access  Private (Provider)
router.get('/services', async (req, res) => {
  try {
    let services = await Service.find({ providerId: req.user._id }).sort({ createdAt: -1 });

    // Fallback: If provider has no listings yet, return all available listings so they can manage/view them
    if (services.length === 0) {
      services = await Service.find({}).sort({ createdAt: -1 });
    }

    return res.json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    console.error('[ProviderRoutes] Error fetching services:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching services'
    });
  }
});

// @desc    Update service or toggle status with optional raw image upload & automatic old image cleanup
// @route   PUT /api/provider/services/:id
// @access  Private (Provider)
router.put('/services/:id', upload.single('image'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service listing not found'
      });
    }

    const {
      title,
      category,
      taskType,
      pricingUnit,
      priceInRupees,
      status,
      locationRadiusKm,
      description,
      state,
      district,
      village,
      userLat,
      userLng
    } = req.body;

    if (title !== undefined) service.title = title;
    if (category !== undefined) service.category = category;
    if (taskType !== undefined) service.taskType = taskType;
    if (pricingUnit !== undefined) service.pricingUnit = pricingUnit;
    if (priceInRupees !== undefined) service.priceInRupees = Number(priceInRupees);
    if (status !== undefined) service.status = status;
    if (locationRadiusKm !== undefined) service.locationRadiusKm = Number(locationRadiusKm);
    if (description !== undefined) service.description = description;

    // Reassign providerId to current active user if editing
    service.providerId = req.user._id;

    // Attach provider location details
    if (state) service.state = state;
    if (district) service.district = district;
    else if (req.user.district) service.district = req.user.district;

    if (village) service.village = village;
    else if (req.user.village) service.village = req.user.village;

    if (userLat && userLng) {
      service.location = { latitude: Number(userLat), longitude: Number(userLng) };
    } else if (!service.location || !service.location.latitude) {
      service.location = getCoordinatesForDistrict(service.district);
    }

    // Update image if new raw file uploaded, and delete previous image from disk!
    if (req.file) {
      if (service.imageUrl) {
        safeDeleteUploadFile(service.imageUrl);
      }
      service.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedService = await service.save();

    return res.json({
      success: true,
      message: 'Service updated successfully',
      service: updatedService
    });
  } catch (error) {
    console.error('[ProviderRoutes] Error updating service:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating service'
    });
  }
});

// @desc    Delete a service listing & delete image file from disk
// @route   DELETE /api/provider/services/:id
// @access  Private (Provider)
router.delete('/services/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service listing not found'
      });
    }

    // Delete image file from disk if uploaded
    if (service.imageUrl) {
      safeDeleteUploadFile(service.imageUrl);
    }

    await service.deleteOne();

    return res.json({
      success: true,
      message: 'Service deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('[ProviderRoutes] Error deleting service:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting service'
    });
  }
});

export default router;
