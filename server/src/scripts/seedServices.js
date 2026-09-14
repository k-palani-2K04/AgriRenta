import mongoose from 'mongoose';
import User from '../models/User.js';
import Service from '../models/Service.js';

const seedListings = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrirenta';
    await mongoose.connect(mongoUri);
    console.log('[SeedScript] Connected to MongoDB at:', mongoUri);

    let provider = await User.findOne({ phone: '9876543211' });
    if (!provider) {
      provider = await User.create({
        name: 'Srinivas Rao',
        phone: '9876543211',
        password: 'password123',
        role: 'provider',
        upiId: '7912889876@upi',
        state: 'Andhra Pradesh',
        district: 'Guntur',
        village: 'Tenali',
        location: { latitude: 16.3067, longitude: 80.4365 }
      });
    } else {
      provider.state = 'Andhra Pradesh';
      provider.district = 'Guntur';
      provider.village = 'Tenali';
      provider.location = { latitude: 16.3067, longitude: 80.4365 };
      await provider.save();
    }

    // Ensure at least 1 listing (Farmtrac 50 tractor With Rotavator) exists in available status
    const existing = await Service.findOne({ title: /Farmtrac 50/i });
    if (!existing) {
      await Service.create({
        providerId: provider._id,
        title: 'Farmtrac 50 tractor With Rotavator',
        category: 'machine',
        taskType: 'ploughing',
        pricingUnit: 'per_hour',
        priceInRupees: 1200,
        status: 'available',
        state: 'Andhra Pradesh',
        district: 'Guntur',
        village: 'Tenali',
        location: { latitude: 16.3067, longitude: 80.4365 },
        description: 'We provide best ploughing services for you'
      });
      console.log('[SeedScript] Created Farmtrac 50 tractor listing in Guntur');
    } else {
      existing.status = 'available';
      existing.state = 'Andhra Pradesh';
      existing.district = 'Guntur';
      existing.village = 'Tenali';
      existing.location = { latitude: 16.3067, longitude: 80.4365 };
      await existing.save();
      console.log('[SeedScript] Reset Farmtrac 50 tractor listing to Available in Guntur');
    }

    console.log('[SeedScript] Listings seeding finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[SeedScript] Error seeding listings:', err);
    process.exit(1);
  }
};

seedListings();
