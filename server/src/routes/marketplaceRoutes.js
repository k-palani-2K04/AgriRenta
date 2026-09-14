import express from 'express';
import Service from '../models/Service.js';
import { protect } from '../middleware/authMiddleware.js';
import { calculateHaversineDistance, getCoordinatesForDistrict } from '../utils/haversine.js';

const router = express.Router();

// Optional protect middleware so both logged-in and guest users can browse marketplace
// If user is logged in via Bearer token, we extract user location for distance calculations
router.get('/services', async (req, res) => {
  try {
    const {
      taskType,
      category,
      pricingUnit,
      maxPrice,
      status,
      district,
      search,
      userLat,
      userLng,
      maxDistanceKm
    } = req.query;

    // Build MongoDB query filter
    const filter = {};

    if (taskType && taskType !== 'all') {
      filter.taskType = taskType;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (pricingUnit && pricingUnit !== 'all') {
      filter.pricingUnit = pricingUnit;
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      filter.priceInRupees = { $lte: Number(maxPrice) };
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    // Only apply hard district filter if spatial coordinates are NOT provided
    if ((!userLat || !userLng) && district && district !== 'all') {
      filter.district = district;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { taskType: searchRegex },
        { district: searchRegex },
        { village: searchRegex }
      ];
    }

    // Fetch services and populate provider user info
    const services = await Service.find(filter)
      .populate('providerId', 'name phone village district location role upiId')
      .sort({ createdAt: -1 });

    // Determine reference coordinates for Haversine distance calculation
    let refLat = userLat ? Number(userLat) : null;
    let refLng = userLng ? Number(userLng) : null;

    // Fallback to district coordinates if coordinates not provided
    if ((!refLat || !refLng) && district && district !== 'all') {
      const coords = getCoordinatesForDistrict(district);
      refLat = coords.latitude;
      refLng = coords.longitude;
    } else if (!refLat || !refLng) {
      // Default central Guntur reference
      refLat = 16.3067;
      refLng = 80.4365;
    }

    // Attach Haversine distance to each service item
    let formattedServices = services.map((service) => {
      const sObj = service.toObject();

      const districtFallback = getCoordinatesForDistrict(sObj.district || sObj.providerId?.district || 'Guntur');

      const serviceLat = (sObj.location && typeof sObj.location.latitude === 'number')
        ? sObj.location.latitude
        : (sObj.providerId?.location && typeof sObj.providerId.location.latitude === 'number')
        ? sObj.providerId.location.latitude
        : districtFallback.latitude;

      const serviceLng = (sObj.location && typeof sObj.location.longitude === 'number')
        ? sObj.location.longitude
        : (sObj.providerId?.location && typeof sObj.providerId.location.longitude === 'number')
        ? sObj.providerId.location.longitude
        : districtFallback.longitude;

      const distanceKm = calculateHaversineDistance(refLat, refLng, serviceLat, serviceLng);
      sObj.distanceKm = distanceKm;

      // Always populate location object on output
      sObj.location = { latitude: serviceLat, longitude: serviceLng };

      return sObj;
    });

    // Apply distance filter with +5 KM range threshold buffer (e.g. 16 km selected -> up to 21 km included)
    const baseDist = maxDistanceKm ? Number(maxDistanceKm) : 16;
    const maxDist = baseDist + 5;
    formattedServices = formattedServices.filter(s => s.distanceKm <= maxDist);

    return res.json({
      success: true,
      count: formattedServices.length,
      refLocation: { latitude: refLat, longitude: refLng },
      maxDistanceAppliedKm: maxDist,
      services: formattedServices
    });
  } catch (error) {
    console.error('[MarketplaceRoutes] Error fetching services:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching marketplace listings'
    });
  }
});

export default router;
