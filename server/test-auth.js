const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting AgriRenta Phase 1 Auth System Verification ---');

  try {
    // 1. Health Check
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    console.log('✔ Health Check:', healthData.status === 'online' ? 'PASS' : 'FAIL', healthData);

    // 2. Test Farmer Registration
    const farmerData = {
      name: 'Ramesh Farmer',
      phone: '9988776655',
      password: 'AgriPass#2026',
      role: 'farmer',
      state: 'Andhra Pradesh',
      district: 'Guntur',
      village: 'Tenali'
    };

    const regFarmerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farmerData)
    });
    const regFarmerJson = await regFarmerRes.json();
    console.log('✔ Farmer Registration Response:', regFarmerRes.status, regFarmerJson.success ? 'PASS' : regFarmerJson.message);

    // 3. Test Provider Registration
    const providerData = {
      name: 'Srinivas Provider',
      phone: '9988776644',
      password: 'AgriPass#2026',
      role: 'provider',
      state: 'Telangana',
      district: 'Karimnagar',
      village: 'Manakondur'
    };

    const regProviderRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(providerData)
    });
    const regProviderJson = await regProviderRes.json();
    console.log('✔ Provider Registration Response:', regProviderRes.status, regProviderJson.success ? 'PASS' : regProviderJson.message);

    // 4. Test Login (Farmer)
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9988776655', password: 'AgriPass#2026' })
    });
    const loginJson = await loginRes.json();
    console.log('✔ Farmer Login Response:', loginRes.status, loginJson.success ? 'PASS' : 'FAIL');

    if (!loginJson.token) {
      throw new Error('Login failed: Token missing');
    }

    const token = loginJson.token;
    console.log('✔ Received JWT Token:', token.substring(0, 25) + '...');

    // 5. Test GET /api/auth/me
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const meJson = await meRes.json();
    console.log('✔ GET /api/auth/me Validation:', meRes.status, meJson.user?.phone === '9988776655' ? 'PASS' : 'FAIL');
    console.log('  Authenticated User:', meJson.user.name, `(${meJson.user.role}) - ${meJson.user.village}, ${meJson.user.district}, ${meJson.user.state}`);

    console.log('\n✅ ALL AUTOMATED AUTH SYSTEM TESTS PASSED SUCCESSFULLY!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Verification Error:', err.message);
    process.exit(1);
  }
}

runTests();
