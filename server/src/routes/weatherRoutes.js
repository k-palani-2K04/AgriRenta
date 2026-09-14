import express from 'express';

const router = express.Router();

// @desc    Check weather forecast & extreme weather guard for requested date & coordinates
// @route   GET /api/weather/check
// @access  Public / Authenticated
router.get('/check', async (req, res) => {
  try {
    const { lat, lng, date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    const apiKey = process.env.OPENWEATHER_API_KEY;

    let hasAlert = false;
    let condition = 'Clear / Good Weather';
    let windSpeedKmh = 12;
    let rainMm = 0;
    let temperature = 28;
    let warningMessage = null;

    if (apiKey && lat && lng) {
      try {
        const fetchRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
        );
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          const targetDayStr = targetDate.toISOString().split('T')[0];
          const match = data.list?.find(item => item.dt_txt && item.dt_txt.startsWith(targetDayStr)) || data.list?.[0];

          if (match) {
            temperature = Math.round(match.main.temp);
            windSpeedKmh = Math.round((match.wind?.speed || 0) * 3.6);
            rainMm = match.rain ? (match.rain['3h'] || 0) : 0;
            const weatherMain = match.weather?.[0]?.main || 'Clear';
            condition = match.weather?.[0]?.description || weatherMain;

            if (
              weatherMain.toLowerCase().includes('rain') ||
              weatherMain.toLowerCase().includes('thunderstorm') ||
              windSpeedKmh > 25 ||
              rainMm > 10
            ) {
              hasAlert = true;
            }
          }
        }
      } catch (err) {
        console.warn('[WeatherRoutes] OpenWeather fetch error, falling back to simulated check:', err.message);
      }
    }

    if (!apiKey) {
      const dayNum = targetDate.getDate();
      
      // Simulate extreme weather warning on specific test dates (e.g. day 7, 14, 21, 28)
      if (dayNum % 7 === 0) {
        hasAlert = true;
        condition = 'Heavy Rain & Thunderstorm';
        windSpeedKmh = 28;
        rainMm = 32;
        temperature = 24;
        warningMessage = `⚠️ Extreme Weather Alert for ${targetDate.toLocaleDateString()}: Heavy Rain & High Wind Speed (28 km/h) predicted! Field machinery operations are not recommended.`;
      } else {
        hasAlert = false;
        condition = 'Sunny / Clear Sky';
        windSpeedKmh = 12;
        rainMm = 0;
        temperature = 31;
        warningMessage = null;
      }
    } else if (hasAlert) {
      warningMessage = `⚠️ Severe Weather Alert: High wind speeds (${windSpeedKmh} km/h) & condition (${condition}) predicted on ${targetDate.toLocaleDateString()}. Operation delays possible!`;
    }

    return res.json({
      success: true,
      lat: Number(lat) || 16.3067,
      lng: Number(lng) || 80.4365,
      date: targetDate.toISOString(),
      hasAlert,
      condition,
      windSpeedKmh,
      rainMm,
      temperature,
      warningMessage
    });

  } catch (error) {
    console.error('[WeatherRoutes] Error checking weather:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify weather alerts'
    });
  }
});

export default router;
