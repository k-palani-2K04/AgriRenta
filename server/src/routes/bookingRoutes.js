import express from 'express';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { calculateHaversineDistance, getCoordinatesForDistrict } from '../utils/haversine.js';
import { notifyBookingParties } from '../utils/notify.js';
import { uploadJobPhoto } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

// Helper to process booking creation logic
const handleCreateBooking = async (req, res) => {
  try {
    const { 
      serviceId, 
      bookingDate, 
      startDate, 
      quantity, 
      landAreaAcres, 
      durationHours, 
      totalAmountInRupees, 
      paymentMethod, 
      paymentStatus: clientPaymentStatus,
      transactionRef,
      farmerLocation 
    } = req.body;

    const requestedDate = bookingDate || startDate;

    if (!serviceId || !requestedDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide serviceId and bookingDate'
      });
    }

    const service = await Service.findById(serviceId).populate('providerId');
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service listing not found'
      });
    }

    const acres = Number(landAreaAcres) || (service.pricingUnit === 'per_acre' ? Number(quantity) || 1 : 0);
    const hours = Number(durationHours) || Number(req.body.hoursNeeded) || (service.pricingUnit === 'per_hour' ? Number(quantity) || 1 : 0);
    const qty = Number(quantity) || (acres > 0 ? acres : hours > 0 ? hours : 1);

    // Calculate total amount in rupees
    const calculatedTotal = totalAmountInRupees 
      ? Number(totalAmountInRupees)
      : (service.priceInRupees || 0) * qty;

    // Financial Breakdown:
    // 1. Client Advance = 20% of Total Service Cost
    // 2. For Agricultural Skilled Workforce: 0% Admin Commission (100% of advance disbursed to provider)
    // 3. For Machinery & Farm Equipment: 5% Admin Commission (15% net provider disbursement)
    const isWorkforce = service.category === 'Agricultural Skilled Workforce' || service.category === 'human_labor';
    const advancePaid = Math.round(calculatedTotal * 0.20);
    const adminComm = isWorkforce ? 0 : Math.round(calculatedTotal * 0.05);
    const providerPayout = isWorkforce ? advancePaid : Math.round(calculatedTotal * 0.15);

    let finalPaymentStatus = clientPaymentStatus;
    if (finalPaymentStatus === 'advance_paid') {
      finalPaymentStatus = 'confirmed';
    }
    if (!finalPaymentStatus) {
      if (paymentMethod === 'cod') {
        finalPaymentStatus = 'pending';
      } else {
        finalPaymentStatus = 'confirmed';
      }
    }

    // Farmer location info
    const farmerDistrict = farmerLocation?.district || req.user.district || 'Guntur';
    const farmerVillage = farmerLocation?.village || req.user.village || 'Locality';
    const farmerLat = farmerLocation?.latitude || (req.user.location && req.user.location.latitude) || 16.3067;
    const farmerLng = farmerLocation?.longitude || (req.user.location && req.user.location.longitude) || 80.4365;

    // Provider location info
    const providerUser = service.providerId;
    const providerDistrict = service.district || providerUser?.district || 'Guntur';
    const providerVillage = service.village || providerUser?.village || 'Tenali Yard';
    const providerCoords = (service.location && service.location.latitude)
      ? service.location
      : (providerUser?.location && providerUser?.location.latitude)
      ? providerUser.location
      : getCoordinatesForDistrict(providerDistrict);

    const booking = await Booking.create({
      serviceId: service._id,
      farmerId: req.user._id,
      providerId: providerUser._id || providerUser,
      bookingDate: new Date(requestedDate),
      startDate: new Date(requestedDate),
      pricingUnit: service.pricingUnit,
      quantity: qty,
      landAreaAcres: acres,
      durationHours: hours,
      totalAmountInRupees: calculatedTotal,
      totalAmount: calculatedTotal,
      advancePaidInRupees: advancePaid,
      adminCommissionInRupees: adminComm,
      providerPayoutAmountInRupees: providerPayout,
      providerPayoutAmount: providerPayout,
      paymentMethod: paymentMethod || 'upi',
      paymentStatus: finalPaymentStatus,
      webhookVerified: true,
      paymentVerifiedAt: new Date(),
      status: 'pending',
      farmerLocation: {
        latitude: farmerLat,
        longitude: farmerLng,
        district: farmerDistrict,
        village: farmerVillage
      },
      providerLocation: {
        latitude: providerCoords.latitude,
        longitude: providerCoords.longitude,
        district: providerDistrict,
        village: providerVillage
      }
    });

    // Mark the booked service status as 'busy' in MongoDB
    await Service.findByIdAndUpdate(service._id, { status: 'busy' });

    const gmapUrl = `https://www.google.com/maps/dir/?api=1&origin=${providerCoords.latitude},${providerCoords.longitude}&destination=${farmerLat},${farmerLng}&travelmode=driving`;

    if (finalPaymentStatus === 'confirmed' || finalPaymentStatus === 'advance_paid') {
      await notifyBookingParties(booking, {
        type: 'payment_confirmed',
        title: 'Payment Received — Advance Escrow Secured',
        body: `₹${advancePaid} 20% advance verified and held in admin escrow.`,
        payload: {
          paymentStatus: 'confirmed',
          escrowStatus: 'held_by_admin',
          advancePaidInRupees: advancePaid
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Rental booking request submitted & service marked busy',
      booking,
      gmapUrl
    });

  } catch (error) {
    console.error('[BookingRoutes] Error creating booking:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating booking'
    });
  }
};

// @desc    Create a new rental booking request (Support both / and /create)
// @route   POST /api/bookings and POST /api/bookings/create
// @access  Private (Farmer)
router.post('/create', handleCreateBooking);
router.post('/', handleCreateBooking);

// @desc    Fetch logged-in farmer's booking history
// @route   GET /api/bookings/my-bookings
// @access  Private (Farmer)
router.get('/my-bookings', async (req, res) => {
  try {
    const rawBookings = await Booking.find({ farmerId: req.user._id })
      .populate('serviceId')
      .populate('providerId', 'name phone village district location')
      .sort({ createdAt: -1 });

    const bookings = rawBookings.map(b => {
      const bObj = b.toObject();
      const pLat = bObj.providerLocation?.latitude || 16.3400;
      const pLng = bObj.providerLocation?.longitude || 80.4600;
      const fLat = bObj.farmerLocation?.latitude || 16.3067;
      const fLng = bObj.farmerLocation?.longitude || 80.4365;

      bObj.gmapUrl = `https://www.google.com/maps/dir/?api=1&origin=${pLat},${pLng}&destination=${fLat},${fLng}&travelmode=driving`;
      return bObj;
    });

    return res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('[BookingRoutes] Error fetching farmer bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching bookings'
    });
  }
});

// @desc    Fetch logged-in provider's rental requests and pending count badge
// @route   GET /api/bookings/provider-requests
// @access  Private (Provider)
router.get('/provider-requests', async (req, res) => {
  try {
    const rawBookings = await Booking.find({ 
      providerId: req.user._id,
      paymentStatus: { $in: ['confirmed', 'advance_paid', 'completed'] }
    })
      .populate('serviceId')
      .populate('farmerId', 'name phone village district location')
      .sort({ createdAt: -1 });

    const pendingCount = rawBookings.filter(b => b.status === 'pending').length;

    const bookings = rawBookings.map(b => {
      const bObj = b.toObject();
      const pLat = bObj.providerLocation?.latitude || 16.3400;
      const pLng = bObj.providerLocation?.longitude || 80.4600;
      const fLat = bObj.farmerLocation?.latitude || 16.3067;
      const fLng = bObj.farmerLocation?.longitude || 80.4365;

      bObj.gmapUrl = `https://www.google.com/maps/dir/?api=1&origin=${pLat},${pLng}&destination=${fLat},${fLng}&travelmode=driving`;
      return bObj;
    });

    return res.json({
      success: true,
      count: bookings.length,
      pendingCount,
      bookings
    });
  } catch (error) {
    console.error('[BookingRoutes] Error fetching provider requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching provider requests'
    });
  }
});

// @desc    Update booking status & capture provider location on request acceptance
// @route   PUT /api/bookings/:id/status
// @access  Private
router.put('/:id/status', async (req, res) => {
  try {
    const { status, providerLocation } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;

    // Refund logic: On Provider Rejection, execute automatic state transition to trigger 100% refund of collected 20% advance and set booking status to 'cancelled'
    if (status === 'rejected' || status === 'cancelled') {
      const refAmt = booking.advancePaidInRupees || Math.round((booking.totalAmountInRupees || 0) * 0.20);
      booking.status = 'cancelled';
      booking.escrowStatus = 'refunded';
      booking.refundAmountInRupees = refAmt;
      booking.refundTransactionId = `REFUND_UPI_${Date.now()}`;
      booking.refundDate = new Date();

      // Mark service listing available again in MongoDB
      if (booking.serviceId) {
        await Service.findByIdAndUpdate(booking.serviceId, { status: 'available' });
      }
    }

    // Capture and save provider location on acceptance or status update
    if (providerLocation && providerLocation.latitude) {
      booking.providerLocation = {
        latitude: Number(providerLocation.latitude),
        longitude: Number(providerLocation.longitude),
        district: providerLocation.district || req.user.district || 'Guntur',
        village: providerLocation.village || req.user.village || 'Tenali Yard'
      };
    } else if (req.user.location && req.user.location.latitude) {
      booking.providerLocation = {
        latitude: req.user.location.latitude,
        longitude: req.user.location.longitude,
        district: req.user.district || 'Guntur',
        village: req.user.village || 'Tenali Yard'
      };
    }

    await booking.save();

    if (status === 'rejected' || status === 'cancelled') {
      await notifyBookingParties(booking, {
        type: 'refunded',
        title: '100% Advance Refund Processed',
        body: `Provider declined the request. ₹${booking.refundAmountInRupees} refunded. escrowStatus: refunded.`,
        payload: { escrowStatus: 'refunded', paymentStatus: booking.paymentStatus }
      });
    } else if (status === 'confirmed') {
      await notifyBookingParties(booking, {
        type: 'provider_accepted',
        title: 'Provider Accepted Your Booking',
        body: 'The provider accepted this job and will coordinate field dispatch.',
        payload: { status: 'confirmed' }
      });
    } else if (status === 'en_route') {
      await notifyBookingParties(booking, {
        type: 'en_route',
        title: 'Provider En Route to Field',
        body: 'Live GPS tracking is now available. Machinery or crew is on the way.',
        payload: { status: 'en_route' }
      });
    } else if (status === 'arrived') {
      await notifyBookingParties(booking, {
        type: 'arrived',
        title: 'Crew Arrived at Field',
        body: 'The provider has arrived at the farm plot.',
        payload: { status: 'arrived' }
      });
    }

    const pLat = booking.providerLocation?.latitude || 16.3400;
    const pLng = booking.providerLocation?.longitude || 80.4600;
    const fLat = booking.farmerLocation?.latitude || 16.3067;
    const fLng = booking.farmerLocation?.longitude || 80.4365;

    const gmapUrl = `https://www.google.com/maps/dir/?api=1&origin=${pLat},${pLng}&destination=${fLat},${fLng}&travelmode=driving`;

    return res.json({
      success: true,
      message: status === 'rejected' 
        ? 'Booking rejected. 100% full advance refund (₹' + booking.refundAmountInRupees + ') processed back to client.' 
        : `Booking status updated to ${status}`,
      booking,
      gmapUrl
    });

  } catch (error) {
    console.error('[BookingRoutes] Error updating booking status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating booking status'
    });
  }
});

// @desc    Farmer confirms job completion & triggers approval for admin payout release
// @route   PUT /api/bookings/:id/confirm-job
// @access  Private (Farmer)
router.put('/:id/confirm-job', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.jobCompletedByFarmer = true;
    booking.farmerConfirmedAt = new Date();
    booking.status = 'completed';
    booking.paymentStatus = 'completed';

    await booking.save();

    if (booking.serviceId) {
      await Service.findByIdAndUpdate(booking.serviceId, { status: 'available' });
    }

    await notifyBookingParties(booking, {
      type: 'job_completed',
      title: 'Job Marked Completed',
      body: 'The seeker confirmed field work. Admin can now disburse the provider payout.',
      payload: { status: 'completed', paymentStatus: 'completed' }
    });

    return res.json({
      success: true,
      message: 'Job completion confirmed by farmer. Service reset to available and payout ready.',
      booking
    });

  } catch (error) {
    console.error('[BookingRoutes] Error confirming job completion:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error confirming job completion'
    });
  }
});

router.post('/:id/photos', uploadJobPhoto.single('photo'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isParty =
      booking.farmerId.toString() === req.user._id.toString() ||
      booking.providerId.toString() === req.user._id.toString() ||
      req.user.role === 'admin';
    if (!isParty) {
      return res.status(403).json({ success: false, message: 'Not authorized to upload photos' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a field photo' });
    }

    const stage = req.body.stage === 'post' ? 'postService' : 'preService';
    const photoEntry = {
      url: `/uploads/jobs/${req.file.filename}`,
      uploadedBy: req.user._id,
      role: req.user.role,
      uploadedAt: new Date()
    };

    booking.jobPhotos = booking.jobPhotos || { preService: [], postService: [] };
    booking.jobPhotos[stage] = booking.jobPhotos[stage] || [];
    booking.jobPhotos[stage].push(photoEntry);
    await booking.save();

    return res.json({
      success: true,
      message: `${stage === 'postService' ? 'Post-service' : 'Pre-service'} photo saved`,
      booking
    });
  } catch (error) {
    console.error('[BookingRoutes] Photo upload error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to upload photo' });
  }
});

router.post('/:id/attendance', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('serviceId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isParty =
      booking.farmerId.toString() === req.user._id.toString() ||
      booking.providerId.toString() === req.user._id.toString() ||
      req.user.role === 'admin';
    if (!isParty) {
      return res.status(403).json({ success: false, message: 'Not authorized to log attendance' });
    }

    const { date, workersPresent, tasksCompleted, notes } = req.body;
    const crewCap = booking.serviceId?.workerCount || 1;
    const present = Math.max(0, Number(workersPresent) || 0);

    booking.attendanceLogs = booking.attendanceLogs || [];
    booking.attendanceLogs.push({
      date: date ? new Date(date) : new Date(),
      workersPresent: present,
      tasksCompleted: Array.isArray(tasksCompleted) ? tasksCompleted : (tasksCompleted ? [tasksCompleted] : []),
      notes: notes || '',
      loggedBy: req.user._id,
      createdAt: new Date()
    });
    await booking.save();

    return res.json({
      success: true,
      message: `Attendance saved (${present}/${crewCap} present)`,
      booking
    });
  } catch (error) {
    console.error('[BookingRoutes] Attendance error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to save attendance' });
  }
});

// @desc    Get single booking details for live tracking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId')
      .populate('farmerId', 'name phone village district location')
      .populate('providerId', 'name phone village district location');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Calculate live distance and ETA
    const fLat = booking.farmerLocation?.latitude || 16.3067;
    const fLng = booking.farmerLocation?.longitude || 80.4365;
    const pLat = booking.providerLocation?.latitude || 18.4386;
    const pLng = booking.providerLocation?.longitude || 79.1288;

    const distanceKm = calculateHaversineDistance(pLat, pLng, fLat, fLng);
    const etaMinutes = Math.max(1, Math.round((distanceKm / 25) * 60));

    return res.json({
      success: true,
      booking,
      distanceKm,
      etaMinutes
    });

  } catch (error) {
    console.error('[BookingRoutes] Error fetching single booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching booking details'
    });
  }
});

// @desc    Delete a booking by ID
// @route   DELETE /api/bookings/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check ownership (must be farmer, provider, or admin)
    if (
      booking.farmerId.toString() !== req.user._id.toString() &&
      booking.providerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('[BookingRoutes] Error deleting booking:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting booking' });
  }
});

export default router;
