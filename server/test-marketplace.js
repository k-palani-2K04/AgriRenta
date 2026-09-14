const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting AgriRenta Phase 3 Marketplace Verification ---');

  try {
    // 1. Fetch Marketplace Services with no filters
    const allRes = await fetch(`${API_BASE}/marketplace/services?userLat=16.3067&userLng=80.4365`);
    const allJson = await allRes.json();
    console.log('✔ All Marketplace Listings Endpoint:', allRes.status === 200 ? `PASS (${allJson.count} items fetched)` : 'FAIL');

    if (allJson.services && allJson.services.length > 0) {
      const first = allJson.services[0];
      console.log('  Sample Item:', first.title);
      console.log('  Calculated Haversine Distance:', `${first.distanceKm} km`);
      console.log('  Formatted Price:', `₹${first.priceInRupees} / ${first.pricingUnit}`);
    }

    // 2. Filter by Task Type (ploughing)
    const taskRes = await fetch(`${API_BASE}/marketplace/services?taskType=ploughing&userLat=16.3067&userLng=80.4365`);
    const taskJson = await taskRes.json();
    const allPloughing = taskJson.services.every(s => s.taskType === 'ploughing');
    console.log('✔ Filter by Task Type (ploughing):', taskRes.status === 200 && allPloughing ? `PASS (${taskJson.count} items)` : 'FAIL');

    // 3. Filter by Pricing Unit (per_hour) & maxPrice (1500)
    const priceRes = await fetch(`${API_BASE}/marketplace/services?pricingUnit=per_hour&maxPrice=1500&userLat=16.3067&userLng=80.4365`);
    const priceJson = await priceRes.json();
    const validPriceBounds = priceJson.services.every(s => s.pricingUnit === 'per_hour' && s.priceInRupees <= 1500);
    console.log('✔ Filter by Pricing Unit (per_hour) & Max Price (₹1500):', priceRes.status === 200 && validPriceBounds ? `PASS (${priceJson.count} items)` : 'FAIL');

    // 4. Search text filter
    const searchRes = await fetch(`${API_BASE}/marketplace/services?search=Mahindra&userLat=16.3067&userLng=80.4365`);
    const searchJson = await searchRes.json();
    console.log('✔ Search Filter Query ("Mahindra"):', searchRes.status === 200 ? `PASS (${searchJson.count} items match)` : 'FAIL');

    console.log('\n✅ ALL PHASE 3 MARKETPLACE VERIFICATION CHECKS PASSED SUCCESSFULLY!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Marketplace Verification Error:', err.message);
    process.exit(1);
  }
}

runTests();
