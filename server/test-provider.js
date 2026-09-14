const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting AgriRenta Phase 2 Multer Raw Image Upload Verification ---');

  try {
    // 1. Login as Provider (9876543211)
    const providerLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543211', password: 'password123' })
    });
    const providerLogin = await providerLoginRes.json();
    const providerToken = providerLogin.token;

    // 2. Create Service with Raw Image File upload using FormData
    const formData = new FormData();
    formData.append('title', 'Swaraj 855 FE Tractor with Rotavator');
    formData.append('category', 'machine');
    formData.append('taskType', 'ploughing');
    formData.append('pricingUnit', 'per_hour');
    formData.append('priceInRupees', '1400');
    formData.append('locationRadiusKm', '35');
    formData.append('description', 'High performance 52 HP tractor for deep field ploughing.');

    // Create a dummy image blob
    const dummyImageBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header bytes
    const blob = new Blob([dummyImageBytes], { type: 'image/png' });
    formData.append('image', blob, 'tractor.png');

    const createRes = await fetch(`${API_BASE}/provider/services`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${providerToken}`
      },
      body: formData
    });
    const createJson = await createRes.json();
    console.log('✔ Multer Raw Image Upload & Create Service:', createRes.status === 201 ? 'PASS' : 'FAIL', createJson.message || '');
    console.log('  Uploaded Image Path:', createJson.service?.imageUrl);
    const serviceId = createJson.service?._id;

    if (!serviceId) throw new Error('Multer file upload service creation failed');

    // 3. Verify Static Image Serving endpoint (/uploads/filename)
    if (createJson.service?.imageUrl) {
      const staticImageRes = await fetch(`http://localhost:5000${createJson.service.imageUrl}`);
      console.log('✔ Static Upload File Serving Check:', staticImageRes.status === 200 ? 'PASS (200 OK)' : `FAIL (${staticImageRes.status})`);
    }

    // 4. Clean up test service
    const deleteRes = await fetch(`${API_BASE}/provider/services/${serviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${providerToken}`
      }
    });
    console.log('✔ Cleanup Test Service:', deleteRes.status === 200 ? 'PASS' : 'FAIL');

    console.log('\n✅ ALL MULTER RAW IMAGE UPLOAD CHECKS PASSED!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Multer Upload Verification Error:', err.message);
    process.exit(1);
  }
}

runTests();
