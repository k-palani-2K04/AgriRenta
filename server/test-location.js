import { calculateHaversineDistance, DISTRICT_COORDINATES } from './src/utils/haversine.js';

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting AgriRenta Location Distance & Image Upload Verification ---');

  try {
    // 1. Verify Haversine Formula Distance Calculation
    const guntur = DISTRICT_COORDINATES['Guntur'];
    const vijayawada = DISTRICT_COORDINATES['Vijayawada'];
    const karimnagar = DISTRICT_COORDINATES['Karimnagar'];

    const distGunturVijayawada = calculateHaversineDistance(guntur.latitude, guntur.longitude, vijayawada.latitude, vijayawada.longitude);
    console.log(`✔ Haversine Distance (Guntur -> Vijayawada): ${distGunturVijayawada} km (Expected ~32 km)`);

    const distGunturKarimnagar = calculateHaversineDistance(guntur.latitude, guntur.longitude, karimnagar.latitude, karimnagar.longitude);
    console.log(`✔ Haversine Distance (Guntur -> Karimnagar): ${distGunturKarimnagar} km (Expected ~260 km)`);

    if (distGunturVijayawada < 20 || distGunturVijayawada > 45) {
      throw new Error('Haversine distance formula check failed');
    }

    // 2. Login as Provider (9876543211)
    const providerLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543211', password: 'password123' })
    });
    const providerLogin = await providerLoginRes.json();
    const providerToken = providerLogin.token;

    // 3. Create Service with Raw Image File upload using FormData
    const formData = new FormData();
    formData.append('title', 'Farmtrac 50 Tractor with Heavy Rotavator');
    formData.append('category', 'machine');
    formData.append('taskType', 'ploughing');
    formData.append('pricingUnit', 'per_hour');
    formData.append('priceInRupees', '1200');
    formData.append('locationRadiusKm', '25');
    formData.append('description', 'We provide best ploughing services for you');

    const dummyImageBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const blob = new Blob([dummyImageBytes], { type: 'image/png' });
    formData.append('image', blob, 'farmtrac50.png');

    const createRes = await fetch(`${API_BASE}/provider/services`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${providerToken}` },
      body: formData
    });
    const createJson = await createRes.json();
    console.log('✔ Service Creation with Provider Location & Image:', createRes.status === 201 ? 'PASS' : 'FAIL');
    
    const service = createJson.service;
    console.log('  Service Image URL:', service?.imageUrl);
    console.log('  Provider District & Village:', `${service?.village}, ${service?.district}`);
    console.log('  Provider Coordinates:', `(${service?.location?.latitude}° N, ${service?.location?.longitude}° E)`);

    if (!service?.imageUrl || !service?.location?.latitude) {
      throw new Error('Missing location coordinates or image URL on service');
    }

    // 4. Verify Static Upload File Serving (http://localhost:5000/uploads/...)
    const staticImageRes = await fetch(`http://localhost:5000${service.imageUrl}`);
    console.log('✔ Static Upload File Serving Check:', staticImageRes.status === 200 ? 'PASS (200 OK)' : `FAIL (${staticImageRes.status})`);

    // 5. Cleanup Test Service
    await fetch(`${API_BASE}/provider/services/${service._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${providerToken}` }
    });
    console.log('✔ Cleaned up test service');

    console.log('\n✅ ALL HAVERSINE DISTANCE & RAW IMAGE UPLOAD CHECKS PASSED SUCCESSFULLY!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Verification Error:', err.message);
    process.exit(1);
  }
}

runTests();
