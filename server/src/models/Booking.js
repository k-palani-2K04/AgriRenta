import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookingDate: {
      type: Date,
      default: Date.now
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    pricingUnit: {
      type: String,
      enum: ['per_hour', 'per_acre', 'per_day', 'per_worker_day', 'per_group_acre'],
      default: 'per_hour'
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, 'Quantity must be at least 1']
    },
    landAreaAcres: {
      type: Number,
      default: 0
    },
    durationHours: {
      type: Number,
      default: 0
    },
    totalAmountInRupees: {
      type: Number,
      required: true,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    advancePaidInRupees: {
      type: Number,
      default: 0
    },
    adminCommissionInRupees: {
      type: Number,
      default: 0
    },
    providerPayoutAmountInRupees: {
      type: Number,
      default: 0
    },
    refundAmountInRupees: {
      type: Number,
      default: 0
    },
    refundTransactionId: {
      type: String,
      default: ''
    },
    refundDate: {
      type: Date
    },
    webhookVerified: {
      type: Boolean,
      default: true
    },
    paymentVerifiedAt: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'razorpay', 'cod'],
      default: 'upi'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'advance_paid', 'completed'],
      default: 'confirmed'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected', 'en_route', 'arrived'],
      default: 'pending'
    },
    escrowStatus: {
      type: String,
      enum: ['held_by_admin', 'released_to_provider', 'refunded'],
      default: 'held_by_admin'
    },
    jobCompletedByFarmer: {
      type: Boolean,
      default: false
    },
    farmerConfirmedAt: {
      type: Date
    },
    payoutReleaseDate: {
      type: Date
    },
    payoutTransactionId: {
      type: String,
      default: ''
    },
    providerPayoutAmount: {
      type: Number,
      default: 0
    },
    farmerLocation: {
      latitude: { type: Number, default: 16.3067 },
      longitude: { type: Number, default: 80.4365 },
      district: { type: String, default: 'Guntur' },
      village: { type: String, default: 'Tenali' }
    },
    providerLocation: {
      latitude: { type: Number, default: 18.4386 },
      longitude: { type: Number, default: 79.1288 },
      district: { type: String, default: 'Karimnagar' },
      village: { type: String, default: 'Manakondur' }
    }
  },
  {
    timestamps: true
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
