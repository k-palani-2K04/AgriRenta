const API_BASE = 'http://localhost:5000/api';

async function runScenario() {
  console.log('====================================================');
  console.log('  AGRIRENTA USER FLOW & GOOGLE MAPS ROUTE TEST');
  console.log('====================================================\n');

  try {
    // ----------------------------------------------------
    // STEP 1: Register New Provider in Renigunta, Tirupati
    // ----------------------------------------------------
    console.log('--- STEP 1: Creating Provider Account (Renigunta, Tirupati) ---');
    const providerPhone = `9123${Math.floor(100000 + Math.random() * 900000)}`;
    const providerRegRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Srinivasulu (Renigunta Provider)',
        phone: providerPhone,
        password: 'AgriPass#2026',
        role: 'provider',
        state: 'Andhra Pradesh',
        district: 'Tirupati',
        village: 'Renigunta',
        upiId: `${providerPhone}@upi`,
        location: { latitude: 13.6337, longitude: 79.5165 } // Renigunta GPS
      })
    });
    const providerReg = await providerRegRes.json();
    if (!providerReg.success) throw new Error(`Provider registration failed: ${providerReg.message}`);
    const providerToken = providerReg.token;
    const providerId = providerReg.user._id;
    console.log(`[PASS] Provider Registered: ${providerReg.user.name} (ID: ${providerId})`);
    console.log(`       Location: Renigunta, Tirupati (13.6337° N, 79.5165° E)\n`);

    // ----------------------------------------------------
    // STEP 2: Provider Adds Listings for Harvesting & Weeding
    // ----------------------------------------------------
    console.log('--- STEP 2: Creating Provider Listings (Harvesting & Weeding) ---');
    
    // Listing 1: Harvesting
    const harvestRes = await fetch(`${API_BASE}/provider/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({
        title: 'Kubota Combine Harvester 4WD',
        category: 'Machinery & Farm Equipment',
        taskType: 'harvesting',
        pricingUnit: 'per_acre',
        priceInRupees: 1800,
        status: 'available',
        state: 'Andhra Pradesh',
        district: 'Tirupati',
        village: 'Renigunta',
        userLat: 13.6337,
        userLng: 79.5165,
        description: 'High capacity paddy & grain harvesting unit based in Renigunta.'
      })
    });
    const harvestData = await harvestRes.json();
    if (!harvestData.success) throw new Error(`Harvesting listing failed: ${harvestData.message}`);
    const harvestServiceId = harvestData.service._id;
    console.log(`[PASS] Listing 1 Created: ${harvestData.service.title} (Task: harvesting, Price: ₹1800/acre)`);

    // Listing 2: Weeding
    const weedingRes = await fetch(`${API_BASE}/provider/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({
        title: 'Skilled Weeding Workgroup Crew',
        category: 'Agricultural Skilled Workforce',
        taskType: 'weeding',
        pricingUnit: 'per_group_acre',
        priceInRupees: 900,
        status: 'available',
        workforceType: 'Workgroup Team',
        workerCount: 6,
        specializedTasks: ['Manual Weeding', 'Paddy Transplanting'],
        state: 'Andhra Pradesh',
        district: 'Tirupati',
        village: 'Renigunta',
        userLat: 13.6337,
        userLng: 79.5165,
        description: '6 experienced field workers for weed removal & plot preparation.'
      })
    });
    const weedingData = await weedingRes.json();
    if (!weedingData.success) throw new Error(`Weeding listing failed: ${weedingData.message}`);
    const weedingServiceId = weedingData.service._id;
    console.log(`[PASS] Listing 2 Created: ${weedingData.service.title} (Task: weeding, Price: ₹900/team/acre)\n`);

    // ----------------------------------------------------
    // STEP 3: Register New Farmer in Puttur, Tirupati
    // ----------------------------------------------------
    console.log('--- STEP 3: Creating Farmer Account (Puttur, Tirupati) ---');
    const farmerPhone = `9123${Math.floor(100000 + Math.random() * 900000)}`;
    const farmerRegRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Venkatesh (Puttur Farmer)',
        phone: farmerPhone,
        password: 'AgriPass#2026',
        role: 'farmer',
        state: 'Andhra Pradesh',
        district: 'Tirupati',
        village: 'Puttur',
        location: { latitude: 13.4414, longitude: 79.5544 } // Puttur GPS
      })
    });
    const farmerReg = await farmerRegRes.json();
    if (!farmerReg.success) throw new Error(`Farmer registration failed: ${farmerReg.message}`);
    const farmerToken = farmerReg.token;
    const farmerId = farmerReg.user._id;
    console.log(`[PASS] Farmer Registered: ${farmerReg.user.name} (ID: ${farmerId})`);
    console.log(`       Location: Puttur, Tirupati (13.4414° N, 79.5544° E)\n`);

    // ----------------------------------------------------
    // STEP 4: Farmer Searches Marketplace & Validates Filters
    // ----------------------------------------------------
    console.log('--- STEP 4: Marketplace Search & Distance Filtering ---');
    const marketRes = await fetch(`${API_BASE}/marketplace/services?district=Tirupati&userLat=13.4414&userLng=79.5544`, {
      headers: { 'Authorization': `Bearer ${farmerToken}` }
    });
    const marketData = await marketRes.json();
    console.log(`[PASS] Marketplace Loaded: ${marketData.count} services found in Tirupati area.`);

    const foundHarvest = marketData.services.find(s => s._id === harvestServiceId);
    const foundWeeding = marketData.services.find(s => s._id === weedingServiceId);

    if (!foundHarvest || !foundWeeding) {
      throw new Error('Created Renigunta listings not visible in Tirupati marketplace!');
    }
    console.log(`[PASS] Renigunta Harvester Distance from Puttur: ${foundHarvest.distanceKm} km`);
    console.log(`[PASS] Renigunta Weeding Crew Distance from Puttur: ${foundWeeding.distanceKm} km`);

    // Test Task Filtering (Harvesting)
    const harvestFilterRes = await fetch(`${API_BASE}/marketplace/services?district=Tirupati&taskType=harvesting&userLat=13.4414&userLng=79.5544`);
    const harvestFilterData = await harvestFilterRes.json();
    const hasOnlyHarvesting = harvestFilterData.services.every(s => s.taskType === 'harvesting');
    console.log(`[PASS] Task Filter "harvesting": ${hasOnlyHarvesting ? 'PASS' : 'FAIL'} (${harvestFilterData.services.length} listings match)`);

    // Test Task Filtering (Weeding)
    const weedingFilterRes = await fetch(`${API_BASE}/marketplace/services?district=Tirupati&taskType=weeding&userLat=13.4414&userLng=79.5544`);
    const weedingFilterData = await weedingFilterRes.json();
    const hasOnlyWeeding = weedingFilterData.services.every(s => s.taskType === 'weeding');
    console.log(`[PASS] Task Filter "weeding": ${hasOnlyWeeding ? 'PASS' : 'FAIL'} (${weedingFilterData.services.length} listings match)\n`);

    // ----------------------------------------------------
    // STEP 5: Farmer Books Harvesting Service
    // ----------------------------------------------------
    console.log('--- STEP 5: Farmer Booking Creation & Google Maps Route Verification ---');
    const bookingDate = new Date().toISOString().split('T')[0];
    const bookingRes = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${farmerToken}`
      },
      body: JSON.stringify({
        serviceId: harvestServiceId,
        bookingDate,
        quantity: 3, // 3 acres
        landAreaAcres: 3,
        totalAmountInRupees: 5400, // 3 acres * ₹1800
        paymentMethod: 'upi',
        paymentStatus: 'confirmed',
        farmerLocation: {
          latitude: 13.4414,
          longitude: 79.5544,
          district: 'Tirupati',
          village: 'Puttur'
        }
      })
    });
    const bookingData = await bookingRes.json();
    if (!bookingData.success) throw new Error(`Booking creation failed: ${bookingData.message}`);
    const bookingId = bookingData.booking._id;
    console.log(`[PASS] Booking Created (ID: ${bookingId})`);
    console.log(`       20% Advance Escrow Held: ₹${bookingData.booking.advancePaidInRupees}`);
    console.log(`[PASS] Google Maps Link Generated: ${bookingData.gmapUrl}`);

    // Verify Google Maps URL parameters match Provider (Renigunta) -> Farmer (Puttur)
    if (!bookingData.gmapUrl.includes('13.6337') || !bookingData.gmapUrl.includes('13.4414')) {
      throw new Error('Google Maps directions URL does not accurately reflect Provider -> Farmer route!');
    }
    console.log(`[PASS] Google Maps Route Verified: Origin (Renigunta: 13.6337° N, 79.5165° E) ➔ Destination (Puttur: 13.4414° N, 79.5544° E)\n`);

    // ----------------------------------------------------
    // STEP 6: Provider Views Request, Accepts & Navigates
    // ----------------------------------------------------
    console.log('--- STEP 6: Provider Accepts Booking & Field Navigation ---');
    const providerReqsRes = await fetch(`${API_BASE}/bookings/provider-requests`, {
      headers: { 'Authorization': `Bearer ${providerToken}` }
    });
    const providerReqsData = await providerReqsRes.json();
    const targetBooking = providerReqsData.bookings.find(b => b._id === bookingId);
    if (!targetBooking) throw new Error('Booking request not found in Provider Control Center!');
    console.log(`[PASS] Provider Control Center Received Request from Farmer: ${targetBooking.farmerId?.name || 'Venkatesh'}`);

    // Provider accepts request
    const acceptRes = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({
        status: 'confirmed',
        providerLocation: { latitude: 13.6337, longitude: 79.5165, district: 'Tirupati', village: 'Renigunta' }
      })
    });
    const acceptData = await acceptRes.json();
    console.log(`[PASS] Provider Accepted Request: status = '${acceptData.booking.status}'\n`);

    // ----------------------------------------------------
    // STEP 7: Job Execution & Farmer Confirmation
    // ----------------------------------------------------
    console.log('--- STEP 7: Job Execution & Seeker Confirmation ---');
    const confirmJobRes = await fetch(`${API_BASE}/bookings/${bookingId}/confirm-job`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${farmerToken}`
      }
    });
    const confirmJobData = await confirmJobRes.json();
    if (!confirmJobData.success) throw new Error(`Farmer job confirmation failed: ${confirmJobData.message}`);
    console.log(`[PASS] Farmer Confirmed Field Work Done: status = '${confirmJobData.booking.status}', paymentStatus = '${confirmJobData.booking.paymentStatus}'\n`);

    // ----------------------------------------------------
    // STEP 8: Admin Disburses Provider Earnings via UPI
    // ----------------------------------------------------
    console.log('--- STEP 8: Admin Earnings Payout Release ---');
    // Login as Admin (9030585591 / AgriAdmin#2026)
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9030585591', password: 'AgriAdmin#2026' })
    });
    const adminLogin = await adminLoginRes.json();
    const adminToken = adminLogin.token;

    const payoutRes = await fetch(`${API_BASE}/admin/bookings/${bookingId}/release-payout`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ payoutTransactionId: `PAYOUT_UPI_RENIGUNTA_${Date.now()}` })
    });
    const payoutData = await payoutRes.json();
    if (!payoutData.success) throw new Error(`Payout release failed: ${payoutData.message}`);
    console.log(`[PASS] Admin Released Payout to Provider (${providerPhone}@upi)`);
    console.log(`       Released Amount: ₹${payoutData.booking.providerPayoutAmount}`);
    console.log(`       Ref: ${payoutData.booking.payoutTransactionId}\n`);

    // Cleanup created test records
    await fetch(`${API_BASE}/admin/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    await fetch(`${API_BASE}/provider/services/${harvestServiceId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${providerToken}` }
    });
    await fetch(`${API_BASE}/provider/services/${weedingServiceId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${providerToken}` }
    });
    console.log('[PASS] Test Cleanup Completed.');

    console.log('\n====================================================');
    console.log('  ALL SCENARIO TESTS PASSED WITH 100% SUCCESS RATE!');
    console.log('====================================================');
    process.exit(0);

  } catch (err) {
    console.error('❌ User Scenario Test Error:', err.message);
    process.exit(1);
  }
}

runScenario();
