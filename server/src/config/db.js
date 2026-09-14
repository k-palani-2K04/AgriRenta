import mongoose from 'mongoose';
import User from '../models/User.js';
import Service from '../models/Service.js';

export const seedDemoUsers = async () => {
  try {
    // 1. Seed Demo Farmer Account (Guntur: 16.3067, 80.4365)
    let farmer = await User.findOne({ phone: '9876543210' });
    if (!farmer) {
      farmer = await User.create({
        name: 'Ramesh Kumar',
        phone: '9876543210',
        password: 'password123',
        role: 'farmer',
        state: 'Andhra Pradesh',
        district: 'Guntur',
        village: 'Tenali',
        location: { latitude: 16.3067, longitude: 80.4365 }
      });
      console.log('[Seed] Demo Farmer account created (9876543210)');
    }

    // 2. Seed Demo Provider Account (Guntur: 16.3067, 80.4365)
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
      console.log('[Seed] Demo Provider account created (9876543211)');
    } else {
      // Ensure provider location is synced to Guntur
      provider.state = 'Andhra Pradesh';
      provider.district = 'Guntur';
      provider.village = 'Tenali';
      provider.location = { latitude: 16.3067, longitude: 80.4365 };
      await provider.save();
    }

    // 3. Seed Demo Admin Account (Phone: 9030585591 / Password: admin@123)
    let admin = await User.findOne({ $or: [{ phone: '9030585591' }, { role: 'admin' }] });
    if (!admin) {
      admin = await User.create({
        name: 'AgriRenta Admin',
        phone: '9030585591',
        password: 'admin@123',
        role: 'admin',
        upiId: '9030585591@ybl',
        state: 'Andhra Pradesh',
        district: 'Guntur',
        village: 'Guntur Central',
        location: { latitude: 16.3067, longitude: 80.4365 }
      });
      console.log('[Seed] Demo Admin account created (9030585591 / admin@123)');
    } else {
      admin.phone = '9030585591';
      admin.password = 'admin@123';
      admin.role = 'admin';
      await admin.save();
      console.log('[Seed] Demo Admin account synced (9030585591 / admin@123)');
    }

    // 3. Seed Demo Services for Provider (Only 1 single listing: Farmtrac 50 tractor With Rotavator)
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.create([
        {
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
        }
      ]);
      console.log('[Seed] Single default listing (Farmtrac 50 tractor With Rotavator) created');
    }

  } catch (error) {
    console.error('[Seed] Error seeding demo data:', error.message);
  }
};

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrirenta';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    await seedDemoUsers();
  } catch (error) {
    console.warn(`[MongoDB] Local connection failed (${error.message}). Attempting in-memory database fallback...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] In-Memory Database connected at ${memoryUri}`);
      await seedDemoUsers();
    } catch (fallbackError) {
      console.error(`[MongoDB] Database Connection Error: ${fallbackError.message}`);
    }
  }
};
