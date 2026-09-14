import express from 'express';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// @desc    Fetch Admin Analytics & Escrow Summary
// @route   GET /api/admin/stats
// @access  Private (Admin / Protected)
router.get('/stats', async (req, res) => {
  try {
    const allBookings = await Booking.find({});
    const totalServices = await Service.countDocuments({});
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalFarmers = await User.countDocuments({ role: 'farmer' });

    let totalEscrowCollected = 0;
    let totalAdminCommission = 0;
    let totalProviderDisbursement = 0;
    let totalReleasedPayouts = 0;
    let totalPendingPayouts = 0;

    allBookings.forEach((b) => {
      const tot = b.totalAmountInRupees || b.totalAmount || 0;
      const adv = b.advancePaidInRupees || Math.round(tot * 0.20);
      const comm = b.adminCommissionInRupees || Math.round(tot * 0.05);
      const provDisb = b.providerPayoutAmountInRupees || Math.round(tot * 0.15);

      if (b.paymentStatus === 'advance_paid' || b.paymentStatus === 'completed') {
        totalEscrowCollected += adv;
        totalAdminCommission += comm;
        totalProviderDisbursement += provDisb;

        if (b.escrowStatus === 'released_to_provider') {
          totalReleasedPayouts += provDisb;
        } else {
          totalPendingPayouts += provDisb;
        }
      }
    });

    return res.json({
      success: true,
      stats: {
        totalEscrowCollected,
        totalAdminCommission,
        totalProviderDisbursement,
        totalReleasedPayouts,
        totalPendingPayouts,
        totalBookings: allBookings.length,
        totalServices,
        totalProviders,
        totalFarmers
      }
    });
  } catch (error) {
    console.error('[AdminRoutes] Error fetching admin stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching admin stats'
    });
  }
});

// @desc    Fetch All Service Bookings across all providers for Admin Dashboard
// @route   GET /api/admin/bookings
// @access  Private (Admin / Protected)
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('serviceId')
      .populate('farmerId', 'name phone village district location')
      .populate('providerId', 'name phone village district location upiId')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('[AdminRoutes] Error fetching admin bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching admin bookings'
    });
  }
});

// @desc    Release Held Escrow Payout to Service Provider
// @route   PUT /api/admin/bookings/:id/release-payout
// @access  Private (Admin / Protected)
router.put('/bookings/:id/release-payout', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const { payoutTransactionId } = req.body;

    booking.escrowStatus = 'released_to_provider';
    booking.payoutReleaseDate = new Date();
    booking.payoutTransactionId = payoutTransactionId || `PAYOUT_UPI_${Date.now()}`;
    booking.providerPayoutAmount = booking.advancePaidInRupees || Math.round((booking.totalAmountInRupees || 0) * 0.20);
    booking.status = 'completed';

    await booking.save();

    // Mark the service as available again for future bookings
    if (booking.serviceId) {
      await Service.findByIdAndUpdate(booking.serviceId, { status: 'available' });
    }

    return res.json({
      success: true,
      message: 'Payout successfully released to provider via UPI & service marked available',
      booking
    });

  } catch (error) {
    console.error('[AdminRoutes] Error releasing payout:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error releasing payout'
    });
  }
});

// @desc    Delete a specific booking by ID (Admin)
// @route   DELETE /api/admin/bookings/:id
// @access  Private (Admin / Protected)
router.delete('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    return res.json({ success: true, message: 'Booking record deleted successfully' });
  } catch (error) {
    console.error('[AdminRoutes] Error deleting booking:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete booking record' });
  }
});

// @desc    Clear all bookings data (Admin)
// @route   DELETE /api/admin/clear-bookings
// @access  Private (Admin / Protected)
router.delete('/clear-bookings', async (req, res) => {
  try {
    const result = await Booking.deleteMany({});
    return res.json({
      success: true,
      message: `Cleared ${result.deletedCount} booking records from database`
    });
  } catch (error) {
    console.error('[AdminRoutes] Error clearing bookings:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear booking records' });
  }
});

// @desc    Clear all provider service listings (Admin)
// @route   DELETE /api/admin/clear-services
// @access  Private (Admin / Protected)
router.delete('/clear-services', async (req, res) => {
  try {
    const result = await Service.deleteMany({});
    return res.json({
      success: true,
      message: `Cleared ${result.deletedCount} provider service listings from database`
    });
  } catch (error) {
    console.error('[AdminRoutes] Error clearing services:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear provider services' });
  }
});

export default router;
