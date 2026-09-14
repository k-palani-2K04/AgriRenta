import mongoose from 'mongoose';
import Service from './src/models/Service.js';
import Booking from './src/models/Booking.js';
import User from './src/models/User.js';

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrirenta';

async function cleanupTestData() {
  try {
    await mongoose.connect(mongoUri);
    console.log('[Cleanup] Connected to MongoDB:', mongoUri);

    // 1. Delete all test services (matching test titles or created by test providers)
    const testServiceQuery = {
      $or: [
        { title: { $regex: /John Deere/i } },
        { title: { $regex: /Paddy Transplanting Skilled Crew/i } },
        { title: { $regex: /Test/i } }
      ]
    };

    const testServices = await Service.find(testServiceQuery);
    const testServiceIds = testServices.map(s => s._id);

    const deletedServicesRes = await Service.deleteMany({ _id: { $in: testServiceIds } });
    console.log(`✔ Deleted ${deletedServicesRes.deletedCount} test service listing(s) from database.`);

    // 2. Delete test users (Seeker Farmer, Provider Srinivas, or phone starting with 910/920/9988)
    const testUsersQuery = {
      $or: [
        { name: { $regex: /Seeker Farmer/i } },
        { name: { $regex: /Provider Srinivas/i } },
        { name: { $regex: /Test/i } },
        { phone: { $regex: /^9(10|20|988)/ } }
      ]
    };

    const testUsers = await User.find(testUsersQuery);
    const testUserIds = testUsers.map(u => u._id);

    const deletedUsersRes = await User.deleteMany({ _id: { $in: testUserIds } });
    console.log(`✔ Deleted ${deletedUsersRes.deletedCount} test user account(s) from database.`);

    // 3. Delete any test bookings associated with deleted test services or test users
    const deletedBookingsRes = await Booking.deleteMany({
      $or: [
        { serviceId: { $in: testServiceIds } },
        { farmerId: { $in: testUserIds } },
        { providerId: { $in: testUserIds } }
      ]
    });
    console.log(`✔ Deleted ${deletedBookingsRes.deletedCount} test booking record(s) from database.`);

    // 4. Verify remaining database counts
    const remainingServices = await Service.countDocuments();
    const remainingUsers = await User.countDocuments();
    const remainingBookings = await Booking.countDocuments();

    console.log('\n--- VERIFICATION OF DATABASE STATE ---');
    console.log(`Remaining Service Listings in DB: ${remainingServices}`);
    console.log(`Remaining User Accounts in DB: ${remainingUsers}`);
    console.log(`Remaining Booking Records in DB: ${remainingBookings}`);

    console.log('\n✔ Test listings & associated test data successfully deleted and verified in MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up test listings:', error);
    process.exit(1);
  }
}

cleanupTestData();
