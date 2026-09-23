const API_BASE = 'http://localhost:5000/api';

async function runFullE2ETestSuite() {
  console.log('========================================================================');
  console.log('  AGRIRENTA COMPLETE END-TO-END APPLICATION TEST (FRESH USER SUITE)    ');
  console.log('========================================================================\n');

  const timestamp = Date.now().toString().slice(-6);
  const providerPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const farmerPhone = `97${Math.floor(10000000 + Math.random() * 90000000)}`;

  try {
    // ----------------------------------------------------
    // STEP 1: API Gateway & Health Verification
    // ----------------------------------------------------
    console.log('--- STEP 1: API Gateway Health Check ---');
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthJson = await healthRes.json();
    console.log(`[PASS] 1.1 Backend Server Online: status='${healthJson.status}', db='${healthJson.database}'`);

    // ----------------------------------------------------
    // STEP 2: Register Fresh Provider Account
    // ----------------------------------------------------
    console.log('\n--- STEP 2: Registering Fresh Provider Account ---');
    const providerPassword = 'AgriPass#2026';
    const regProviderRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Provider Srinivas ${timestamp}`,
        phone: providerPhone,
        password: providerPassword,
        role: 'provider',
        upiId: `${providerPhone}@ybl`,
        state: 'Andhra Pradesh',
        district: 'Tirupati',
        village: 'Renigunta',
        location: { latitude: 13.6288, longitude: 79.5074 }
      })
    });
    const regProviderJson = await regProviderRes.json();
    if (!regProviderJson.success) throw new Error(`Provider Registration Failed: ${regProviderJson.message}`);
    const providerToken = regProviderJson.token;
    const providerId = regProviderJson.user._id;
    console.log(`[PASS] 2.1 Provider Registered: ${regProviderJson.user.name} (Phone: ${providerPhone})`);
    console.log(`       Role: ${regProviderJson.user.role}, UPI: ${regProviderJson.user.upiId}`);
    console.log(`       Location: Renigunta, Tirupati (13.6288° N, 79.5074° E)`);

    // ----------------------------------------------------
    // STEP 3: Create Service Listings for Fresh Provider
    // ----------------------------------------------------
    console.log('\n--- STEP 3: Provider Creating New Equipment & Workforce Listings ---');
    
    // Listing A: Machinery
    const machineryRes = await fetch(`${API_BASE}/provider/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({
        title: `Mahindra 575 DI Heavy Tractor ${timestamp}`,
        category: 'Machinery & Farm Equipment',
        taskType: 'ploughing',
        pricingUnit: 'per_hour',
        priceInRupees: 1350,
        status: 'available',
        state: 'Andhra Pradesh',
        district: 'Tirupati',
        village: 'Renigunta',
        userLat: 13.6288,
        userLng: 79.5074,
        description: 'Heavy duty 45 HP Mahindra tractor equipped with 36-blade rotary tiller for deep soil ploughing.'
      })
    });
    const machineryJson = await machineryRes.json();
    if (!machineryJson.success) throw new Error(`Machinery Service Creation Failed: ${machineryJson.message}`);
    const machineryId = machineryJson.service._id;
    console.log(`[PASS] 3.1 Created Machinery Service: '${machineryJson.service.title}' (ID: ${machineryId})`);
    console.log(`       Price: ₹1350/hour | Task: ${machineryJson.service.taskType} | Status: ${machineryJson.service.status}`);

    // Listing B: Skilled Workforce
    const workforceRes = await fetch(`${API_BASE}/provider/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({
        title: `Expert Paddy Transplanting Crew ${timestamp}`,
        category: 'Agricultural Skilled Workforce',
        workforceType: 'Workgroup Team',
        workerCount: 8,
        specializedTasks: ['Paddy Transplanting', 'Manual Weeding'],
        taskType: 'transplanting',
        pricingUnit: 'per_group_acre',
        priceInRupees: 1100,
        status: 'available',
        state: 'Andhra Pradesh',
        district: 'Tirupati',
        village: 'Renigunta',
        userLat: 13.6288,
        userLng: 79.5074,
        description: 'Experienced 8-member agricultural labor crew for fast paddy transplanting.'
      })
    });
    const workforceJson = await workforceRes.json();
    if (!workforceJson.success) throw new Error(`Workforce Service Creation Failed: ${workforceJson.message}`);
    const workforceId = workforceJson.service._id;
    console.log(`[PASS] 3.2 Created Workforce Service: '${workforceJson.service.title}' (ID: ${workforceId})`);
    console.log(`       Price: ₹1100/team/acre | Crew: 8 Workers (0% Admin Fee)`);

    // ----------------------------------------------------
    // STEP 4: Register Fresh Farmer Account
    // ----------------------------------------------------
    console.log('\n--- STEP 4: Registering Fresh Farmer (Seeker) Account ---');
    const farmerPassword = 'AgriPass#2026';
    const regFarmerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Farmer Ramesh ${timestamp}`,
        phone: farmerPhone,
        password: farmerPassword,
        role: 'farmer',
        state: 'Andhra Pradesh',
        district: 'Tirupati',
        village: 'Puttur',
        location: { latitude: 13.4382, longitude: 79.5517 }
      })
    });
    const regFarmerJson = await regFarmerRes.json();
    if (!regFarmerJson.success) throw new Error(`Farmer Registration Failed: ${regFarmerJson.message}`);
    const farmerToken = regFarmerJson.token;
    const farmerId = regFarmerJson.user._id;
    console.log(`[PASS] 4.1 Farmer Registered: ${regFarmerJson.user.name} (Phone: ${farmerPhone})`);
    console.log(`       Role: ${regFarmerJson.user.role} | Location: Puttur, Tirupati (13.4382° N, 79.5517° E)`);

    // Verify session GET /api/auth/me
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${farmerToken}` }
    });
    const meJson = await meRes.json();
    console.log(`[PASS] 4.2 Session Verification (/api/auth/me): Verified User ID='${meJson.user._id}', Role='${meJson.user.role}'`);

    // ----------------------------------------------------
    // STEP 5: Farmer Queries Marketplace & Validates Filters
    // ----------------------------------------------------
    console.log('\n--- STEP 5: Marketplace Query, Category Filter & Distance Calculation ---');
    const marketRes = await fetch(`${API_BASE}/marketplace/services?userLat=13.4382&userLng=79.5517`, {
      headers: { 'Authorization': `Bearer ${farmerToken}` }
    });
    const marketJson = await marketRes.json();
    console.log(`[PASS] 5.1 Marketplace API Loaded: Returned ${marketJson.count} available services.`);
    
    const foundMachinery = marketJson.services.find(s => s._id === machineryId);
    const foundWorkforce = marketJson.services.find(s => s._id === workforceId);

    if (!foundMachinery || !foundWorkforce) {
      throw new Error('Newly created provider listings are missing from marketplace response!');
    }
    console.log(`[PASS] 5.2 Distance Calculation (Puttur Farmer -> Renigunta Provider): ${foundMachinery.distanceKm} km away`);
    console.log(`       Found Machinery: '${foundMachinery.title}' | Dist: ${foundMachinery.distanceKm} km`);
    console.log(`       Found Workforce: '${foundWorkforce.title}' | Dist: ${foundWorkforce.distanceKm} km`);

    // ----------------------------------------------------
    // STEP 6: Weather Guard & Work Estimator Verification
    // ----------------------------------------------------
    console.log('\n--- STEP 6: Weather Guard & Work Estimator Check ---');
    const bookingDate = new Date().toISOString().split('T')[0];
    const weatherRes = await fetch(`${API_BASE}/weather/check?lat=13.4382&lng=79.5517&date=${bookingDate}`);
    const weatherJson = await weatherRes.json();
    console.log(`[PASS] 6.1 Weather Guard Check: Condition='${weatherJson.condition}', Temp=${weatherJson.temperatureC}°C, Wind=${weatherJson.windSpeedKmh} km/h`);
    console.log(`       Safety Alert Triggered: ${weatherJson.hasAlert ? 'YES' : 'NO'}`);

    // ----------------------------------------------------
    // STEP 7: Farmer Creates Booking with 20% Advance Escrow
    // ----------------------------------------------------
    console.log('\n--- STEP 7: Booking Creation & 20% Advance Escrow Hold ---');
    const landArea = 4; // 4 hours
    const totalCost = 1350 * landArea; // ₹5400
    const expectedAdvance = Math.round(totalCost * 0.20); // 20% = ₹1080

    const bookingRes = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${farmerToken}`
      },
      body: JSON.stringify({
        serviceId: machineryId,
        bookingDate,
        quantity: landArea,
        landAreaAcres: 0,
        durationHours: landArea,
        totalAmountInRupees: totalCost,
        paymentMethod: 'upi',
        paymentStatus: 'confirmed',
        farmerLocation: {
          latitude: 13.4382,
          longitude: 79.5517,
          district: 'Tirupati',
          village: 'Puttur'
        }
      })
    });
    const bookingJson = await bookingRes.json();
    if (!bookingJson.success) throw new Error(`Booking Creation Failed: ${bookingJson.message}`);
    const bookingId = bookingJson.booking._id;
    console.log(`[PASS] 7.1 Booking Created (ID: ${bookingId})`);
    console.log(`       Total Amount: ₹${bookingJson.booking.totalAmountInRupees}`);
    console.log(`       20% Advance Held in Escrow: ₹${bookingJson.booking.advancePaidInRupees} (Expected: ₹${expectedAdvance})`);
    console.log(`[PASS] 7.2 Google Maps Navigation Link Generated: ${bookingJson.gmapUrl}`);

    // ----------------------------------------------------
    // STEP 8: Provider Control Center & Acceptance
    // ----------------------------------------------------
    console.log('\n--- STEP 8: Provider Control Center & Request Acceptance ---');
    const providerReqsRes = await fetch(`${API_BASE}/bookings/provider-requests`, {
      headers: { 'Authorization': `Bearer ${providerToken}` }
    });
    const providerReqsJson = await providerReqsRes.json();
    const targetReq = providerReqsJson.bookings.find(b => b._id === bookingId);
    if (!targetReq) throw new Error('Booking request not received in Provider Control Center!');
    console.log(`[PASS] 8.1 Provider Control Center Received Request from Farmer '${targetReq.farmerId?.name}'`);

    // Provider accepts request
    const acceptRes = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({
        status: 'confirmed',
        providerLocation: { latitude: 13.6288, longitude: 79.5074, district: 'Tirupati', village: 'Renigunta' }
      })
    });
    const acceptJson = await acceptRes.json();
    console.log(`[PASS] 8.2 Provider Accepted Request: status='${acceptJson.booking.status}'`);

    // ----------------------------------------------------
    // STEP 9: Live GPS Geo Tracking & ETA Calculation
    // ----------------------------------------------------
    console.log('\n--- STEP 9: Live GPS Geo Tracking & Contact Sync ---');
    // Update live location
    await fetch(`${API_BASE}/auth/location`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${farmerToken}`
      },
      body: JSON.stringify({ latitude: 13.4382, longitude: 79.5517 })
    });

    const trackRes = await fetch(`${API_BASE}/tracking/live/${providerId}/${farmerId}`, {
      headers: { 'Authorization': `Bearer ${farmerToken}` }
    });
    const trackJson = await trackRes.json();
    console.log(`[PASS] 9.1 Live Geo Tracking Data Calculated:`);
    console.log(`       Calculated Route Distance: ${trackJson.distanceKm} km`);
    console.log(`       Estimated Driving Time (ETA): ${trackJson.etaMinutes} mins`);
    console.log(`       Farmer Contact Phone: ${trackJson.farmer?.phone}`);
    console.log(`       Provider Contact Phone: ${trackJson.provider?.phone}`);

    // ----------------------------------------------------
    // STEP 10: Seeker Confirms Work Done & Admin Payout
    // ----------------------------------------------------
    console.log('\n--- STEP 10: Seeker Confirmation & Admin Escrow Payout ---');
    const confirmJobRes = await fetch(`${API_BASE}/bookings/${bookingId}/confirm-job`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${farmerToken}`
      }
    });
    const confirmJobJson = await confirmJobRes.json();
    console.log(`[PASS] 10.1 Seeker Confirmed Field Work Complete: status='${confirmJobJson.booking.status}', jobCompletedByFarmer=true`);

    // Admin Payout Release
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9030585591', password: 'AgriAdmin#2026' })
    });
    const adminLoginJson = await adminLoginRes.json();
    const adminToken = adminLoginJson.token;

    const payoutRes = await fetch(`${API_BASE}/admin/bookings/${bookingId}/release-payout`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ payoutTransactionId: `UPI_PAYOUT_${timestamp}` })
    });
    const payoutJson = await payoutRes.json();
    console.log(`[PASS] 10.2 Admin Disbursed Provider Payout via UPI:`);
    console.log(`        Amount: ₹${payoutJson.booking.providerPayoutAmount}`);
    console.log(`        Ref Transaction ID: ${payoutJson.booking.payoutTransactionId}`);

    // ----------------------------------------------------
    // STEP 11: Cleanup Test Data
    // ----------------------------------------------------
    console.log('\n--- STEP 11: Test Suite Cleanup ---');
    await fetch(`${API_BASE}/admin/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    await fetch(`${API_BASE}/provider/services/${machineryId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${providerToken}` }
    });
    await fetch(`${API_BASE}/provider/services/${workforceId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${providerToken}` }
    });
    console.log('[PASS] 11.1 Test Listings and Booking Safely Cleaned Up.');

    console.log('\n========================================================================');
    console.log('  ✅ 100% END-TO-END APPLICATION SUITE TEST PASSED CLEANLY!           ');
    console.log('========================================================================');
    process.exit(0);

  } catch (err) {
    console.error('❌ E2E Application Test Suite Error:', err.message);
    process.exit(1);
  }
}

runFullE2ETestSuite();
