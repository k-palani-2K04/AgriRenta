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
      // Strip emojis and normalize category search
      const cleanCat = String(category)
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .trim();

      if (cleanCat.toLowerCase().includes('machinery') || cleanCat.toLowerCase().includes('machine')) {
        filter.category = { $in: ['Machinery & Farm Equipment', 'machine'] };
      } else if (cleanCat.toLowerCase().includes('workforce') || cleanCat.toLowerCase().includes('labor') || cleanCat.toLowerCase().includes('human_labor')) {
        filter.category = { $in: ['Agricultural Skilled Workforce', 'human_labor'] };
      } else if (cleanCat) {
        filter.category = cleanCat;
      }
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

      let serviceLat = districtFallback.latitude;
      let serviceLng = districtFallback.longitude;

      if (sObj.location && typeof sObj.location.latitude === 'number' && typeof sObj.location.longitude === 'number') {
        const rawLat = sObj.location.latitude;
        const rawLng = sObj.location.longitude;
        // Check if stored coordinates match district area (within ~30km). If stale provider profile coords were stored, override with accurate district coords
        const devKm = calculateHaversineDistance(districtFallback.latitude, districtFallback.longitude, rawLat, rawLng);
        if (devKm <= 30) {
          serviceLat = rawLat;
          serviceLng = rawLng;
        }
      }

      const distanceKm = calculateHaversineDistance(refLat, refLng, serviceLat, serviceLng);
      sObj.distanceKm = distanceKm;

      // Always populate location object on output
      sObj.location = { latitude: serviceLat, longitude: serviceLng };

      return sObj;
    });

    // Apply generous distance buffer on server (e.g., maxDistance + 50km or max 150km) 
    // so client-side Haversine distance calculations have full data to filter dynamically
    if (maxDistanceKm && !isNaN(Number(maxDistanceKm))) {
      const baseDist = Number(maxDistanceKm);
      const serverMaxDist = Math.max(baseDist + 50, 150); // Generous buffer to prevent accidental drop of local services
      formattedServices = formattedServices.filter(s => s.distanceKm <= serverMaxDist || (district && (s.district === district || s.providerId?.district === district)));
    }

    return res.json({
      success: true,
      count: formattedServices.length,
      refLocation: { latitude: refLat, longitude: refLng },
      maxDistanceAppliedKm: Number(maxDistanceKm) || 16,
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
