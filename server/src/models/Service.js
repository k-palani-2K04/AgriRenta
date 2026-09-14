import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Machinery & Farm Equipment', 'Agricultural Skilled Workforce', 'machine', 'human_labor'],
      required: [true, 'Category is required']
    },
    workforceType: {
      type: String,
      enum: ['Individual Worker', 'Workgroup Team', null],
      default: null
    },
    workerCount: {
      type: Number,
      default: 1
    },
    workforceGenderComposition: {
      type: String,
      enum: ['Mixed Group', 'Female Workers', 'Male Workers', 'N/A'],
      default: 'N/A'
    },
    specializedTasks: {
      type: [String],
      default: []
    },
    taskType: {
      type: String,
      required: [true, 'Task type is required']
    },
    pricingUnit: {
      type: String,
      enum: ['per_hour', 'per_acre', 'per_day', 'per_worker_day', 'per_group_acre'],
      required: [true, 'Pricing unit is required']
    },
    priceInRupees: {
      type: Number,
      required: [true, 'Price in rupees is required'],
      min: [0, 'Price cannot be negative']
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['available', 'busy'],
      default: 'available'
    },
    locationRadiusKm: {
      type: Number,
      default: 25,
      min: [1, 'Location radius must be at least 1 km']
    },
    state: {
      type: String,
      default: 'Andhra Pradesh'
    },
    district: {
      type: String,
      default: 'Guntur'
    },
    village: {
      type: String,
      default: 'Tenali'
    },
    location: {
      latitude: { type: Number, default: 16.3067 },
      longitude: { type: Number, default: 80.4365 }
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Service = mongoose.model('Service', serviceSchema);
export default Service;
