/**
 * Client-side Haversine Distance Calculator
 * Calculates distance in kilometers between two (lat, lon) coordinates
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

  const R = 6371; // Earth's radius in kilometers
  const toRad = (degree) => (degree * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  return Math.round(distanceKm * 10) / 10;
};

/**
 * District coordinates reference map for Andhra Pradesh & Telangana
 */
export const DISTRICT_COORDINATES = {
  // Andhra Pradesh
  'Guntur': { latitude: 16.3067, longitude: 80.4365 },
  'Visakhapatnam': { latitude: 17.6868, longitude: 83.2185 },
  'Vijayawada': { latitude: 16.5062, longitude: 80.6480 },
  'NTR': { latitude: 16.5062, longitude: 80.6480 },
  'Kurnool': { latitude: 15.8281, longitude: 78.0373 },
  'Ananthapuramu': { latitude: 14.6819, longitude: 77.6006 },
  'Chittoor': { latitude: 13.2172, longitude: 79.1003 },
  'Tirupati': { latitude: 13.6288, longitude: 79.4192 },
  'East Godavari': { latitude: 16.9891, longitude: 81.7835 },
  'West Godavari': { latitude: 16.7107, longitude: 81.1000 },
  'Kakinada': { latitude: 16.9891, longitude: 82.2475 },
  'Eluru': { latitude: 16.7107, longitude: 81.1000 },
  'Prakasam': { latitude: 15.5057, longitude: 80.0499 },
  'Sri Potti Sriramulu Nellore': { latitude: 14.4426, longitude: 79.9865 },
  'Srikakulam': { latitude: 18.3000, longitude: 83.9000 },
  'Vizianagaram': { latitude: 18.1167, longitude: 83.4167 },
  'YSR Kadapa': { latitude: 14.4673, longitude: 78.8242 },
  'Nandyal': { latitude: 15.4786, longitude: 78.4836 },
  'Bapatla': { latitude: 15.9034, longitude: 80.4674 },
  'Palnadu': { latitude: 16.2333, longitude: 79.9833 },

  // Telangana
  'Hyderabad': { latitude: 17.3850, longitude: 78.4867 },
  'Karimnagar': { latitude: 18.4386, longitude: 79.1288 },
  'Warangal': { latitude: 17.9689, longitude: 79.5941 },
  'Hanamkonda': { latitude: 18.0000, longitude: 79.5800 },
  'Nizamabad': { latitude: 18.6725, longitude: 78.0941 },
  'Khammam': { latitude: 17.2473, longitude: 80.1514 },
  'Nalgonda': { latitude: 17.0500, longitude: 79.2667 },
  'Mahabubnagar': { latitude: 16.7488, longitude: 78.0035 },
  'Medak': { latitude: 18.0450, longitude: 78.2616 },
  'Rangareddy': { latitude: 17.2403, longitude: 78.4294 },
  'Sangareddy': { latitude: 17.6194, longitude: 78.0864 },
  'Siddipet': { latitude: 18.1018, longitude: 78.8520 },
  'Suryapet': { latitude: 17.1439, longitude: 79.6239 },
  'Adilabad': { latitude: 19.6667, longitude: 78.5333 }
};

export const getDistrictCoordinates = (districtName) => {
  return DISTRICT_COORDINATES[districtName] || { latitude: 16.3067, longitude: 80.4365 };
};
