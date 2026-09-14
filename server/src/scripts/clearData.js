import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';

const clearDatabaseData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrirenta';
    await mongoose.connect(mongoUri);
    console.log('[ClearScript] Connected to MongoDB at:', mongoUri);

    const deletedBookings = await Booking.deleteMany({});
    console.log(`[ClearScript] Deleted ${deletedBookings.deletedCount} booking records.`);

    const deletedServices = await Service.deleteMany({});
    console.log(`[ClearScript] Deleted ${deletedServices.deletedCount} service listing records.`);

    console.log('[ClearScript] Database cleared successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[ClearScript] Error clearing database:', err);
    process.exit(1);
  }
};

clearDatabaseData();
