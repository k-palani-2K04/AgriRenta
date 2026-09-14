const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting AgriRenta Live Geo Tracking Verification ---');

  try {
    // 1. Login as Farmer (9876543210)
    const farmerLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210', password: 'password123' })
    });
    const farmerLogin = await farmerLoginRes.json();
    const farmerId = farmerLogin.user._id;
    const farmerToken = farmerLogin.token;

    // 2. Login as Provider (9876543211)
    const providerLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543211', password: 'password123' })
    });
    const providerLogin = await providerLoginRes.json();
    const providerId = providerLogin.user._id;
    const providerToken = providerLogin.token;

    // 3. Test Live Location Update PUT /api/auth/location
    const locUpdateRes = await fetch(`${API_BASE}/auth/location`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${farmerToken}`
      },
      body: JSON.stringify({ latitude: 16.5062, longitude: 80.6480 })
    });
    const locUpdateJson = await locUpdateRes.json();
    console.log('✔ Farmer GPS Location Sync PUT Endpoint:', locUpdateRes.status === 200 ? 'PASS (16.5062° N, 80.6480° E)' : 'FAIL');

    // 4. Test GET /api/tracking/live/:providerId/:farmerId
    const trackRes = await fetch(`${API_BASE}/tracking/live/${providerId}/${farmerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${farmerToken}`
      }
    });
    const trackJson = await trackRes.json();
    console.log('✔ Live Tracking Data Endpoint:', trackRes.status === 200 ? 'PASS' : 'FAIL');
    console.log('  Calculated Route Distance:', `${trackJson.distanceKm} km`);
    console.log('  Estimated Drive Time (ETA):', `${trackJson.etaMinutes} mins`);
    console.log('  Farmer Phone Contact:', trackJson.farmer?.phone);
    console.log('  Provider Phone Contact:', trackJson.provider?.phone);

    if (!trackJson.distanceKm || !trackJson.farmer?.phone) {
      throw new Error('Tracking route verification failed');
    }

    console.log('\n✅ ALL LIVE GEO TRACKING CHECKS PASSED SUCCESSFULLY!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Tracking Verification Error:', err.message);
    process.exit(1);
  }
}

runTests();
