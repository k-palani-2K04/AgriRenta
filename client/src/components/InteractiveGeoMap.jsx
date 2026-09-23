import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { 
  Phone, 
  Navigation, 
  Tractor, 
  MapPin, 
  RefreshCw, 
  Target, 
  Maximize2, 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  Play, 
  Pause,
  Compass,
  CornerUpRight,
  AlertCircle,
  Map as MapIcon
} from 'lucide-react';
import { formatRupees } from '../config/appName';

// Leaflet Custom Icons
const createZomatoProviderIcon = () => {
  return L.divIcon({
    className: 'zomato-provider-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="
          background: #000000;
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5);
          font-size: 22px;
          border: 3px solid #ffffff;
          z-index: 100;
        ">
          🚜
        </div>
        <div style="
          width: 0; 
          height: 0; 
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 9px solid #000000;
          margin-top: -2px;
        "></div>
      </div>
    `,
    iconSize: [44, 52],
    iconAnchor: [22, 52],
    popupAnchor: [0, -50]
  });
};

const createZomatoFarmerIcon = () => {
  return L.divIcon({
    className: 'zomato-farmer-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 64px;
          height: 64px;
          background: rgba(37, 99, 235, 0.3);
          border: 2px dashed rgba(37, 99, 235, 0.8);
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
        <div style="
          position: relative;
          background: #000000;
          color: white;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5);
          font-size: 20px;
          border: 3px solid #ffffff;
          z-index: 100;
        ">
          🏠
        </div>
      </div>
    `,
    iconSize: [64, 64],
    iconAnchor: [32, 32],
    popupAnchor: [0, -30]
  });
};

const providerZomatoIcon = createZomatoProviderIcon();
const farmerZomatoIcon = createZomatoFarmerIcon();

// Recenter & Resize controller component for Leaflet
function MapController({ center, zoomTrigger, polylineCoords }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate map size so Leaflet renders canvas & polylines properly without blank tiles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (polylineCoords && polylineCoords.length > 1) {
      try {
        const bounds = L.latLngBounds(polylineCoords);
        map.fitBounds(bounds, { padding: [60, 60] });
      } catch (e) {
        if (center && center[0] && center[1]) {
          map.flyTo(center, 12, { duration: 1.2 });
        }
      }
    } else if (center && center[0] && center[1]) {
      map.flyTo(center, 12, { duration: 1.2 });
    }
  }, [center, zoomTrigger, polylineCoords, map]);

  return null;
}

export const InteractiveGeoMap = ({
  farmer,
  provider,
  distanceKm = 4.2,
  etaMinutes = 12,
  onSimulateMove,
  statusText = 'Machinery is on the way'
}) => {
  const farmerLat = farmer?.location?.latitude || 16.3067;
  const farmerLng = farmer?.location?.longitude || 80.4365;

  const providerLat = provider?.location?.latitude || 16.3400;
  const providerLng = provider?.location?.longitude || 80.4600;

  const farmerPos = [farmerLat, farmerLng];
  const [initialProviderPos] = useState([providerLat, providerLng]);
  const [currentProviderPos, setCurrentProviderPos] = useState([providerLat, providerLng]);

  // Route & Navigation States
  const [roadPolyline, setRoadPolyline] = useState([]);
  const [turnSteps, setTurnSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [liveDistanceKm, setLiveDistanceKm] = useState(distanceKm);
  const [liveEtaMins, setLiveEtaMins] = useState(etaMinutes);
  const [loadingRoute, setLoadingRoute] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isWatchActive, setIsWatchActive] = useState(false);
  const [recenterCount, setRecenterCount] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const simulationTimerRef = useRef(null);
  const watchIdRef = useRef(null);

  // Fetch Turn-by-Turn Road Geometry from Backend Proxy Route (OSRM Engine / Google Directions API)
  const fetchRoadRoute = useCallback(async (startPos, endPos) => {
    try {
      setLoadingRoute(true);
      const url = `/api/tracking/route?startLat=${startPos[0]}&startLng=${startPos[1]}&endLat=${endPos[0]}&endLng=${endPos[1]}`;
      const res = await axios.get(url);

      if (res.data?.success && res.data?.polyline && res.data.polyline.length > 0) {
        setRoadPolyline(res.data.polyline);
        setTurnSteps(res.data.steps || []);
        if (res.data.distanceKm) setLiveDistanceKm(res.data.distanceKm);
        if (res.data.durationMins) setLiveEtaMins(res.data.durationMins);
        setCurrentStepIndex(0);
      }
    } catch (err) {
      console.warn('Route API error, generating road path fallback:', err.message);
    } finally {
      setLoadingRoute(false);
    }
  }, []);

  // Trigger initial route fetch ONLY on mount or when destination/origin changes, NOT on every simulation step!
  useEffect(() => {
    fetchRoadRoute(initialProviderPos, farmerPos);
  }, [initialProviderPos[0], initialProviderPos[1], farmerPos[0], farmerPos[1], fetchRoadRoute]);

  // Continuous HTML5 Geolocation Watch Position
  const toggleLiveGpsWatch = () => {
    if (isWatchActive) {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      setIsWatchActive(false);
      showToast('Continuous GPS Live Tracking paused.');
    } else {
      if (navigator.geolocation) {
        setIsWatchActive(true);
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (pos) => {
            const newPos = [pos.coords.latitude, pos.coords.longitude];
            setCurrentProviderPos(newPos);
            try {
              await axios.put('/api/auth/location', {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              });
            } catch (e) {
              console.error('Error updating live GPS:', e);
            }
          },
          (err) => {
            showToast('GPS permission denied or location unavailable.');
            setIsWatchActive(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
        );
      } else {
        showToast('Geolocation is not supported by your browser.');
      }
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, []);

  // Calculate current animated position along road polyline
  const animatedProviderPos = 
    roadPolyline.length > 0 && currentStepIndex < roadPolyline.length
      ? roadPolyline[currentStepIndex]
      : currentProviderPos;

  // Step-by-step movement along turn-by-turn road polyline
  const handleStepNextPoint = () => {
    if (roadPolyline.length === 0) return;

    if (currentStepIndex < roadPolyline.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);

      const remainingRatio = (roadPolyline.length - 1 - nextIndex) / (roadPolyline.length - 1);
      const initialDist = distanceKm || 4.2;
      const initialEta = etaMinutes || 12;

      setLiveDistanceKm(Number(Math.max(0.1, (initialDist * remainingRatio)).toFixed(1)));
      setLiveEtaMins(Math.max(1, Math.round(initialEta * remainingRatio)));
    } else {
      setIsSimulating(false);
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    }
  };

  // Play / Pause automatic simulation along road network
  const toggleSimulation = () => {
    if (isSimulating) {
      setIsSimulating(false);
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    } else {
      if (currentStepIndex >= roadPolyline.length - 1) {
        setCurrentStepIndex(0);
      }
      setIsSimulating(true);
      simulationTimerRef.current = setInterval(() => {
        handleStepNextPoint();
      }, 500);
    }
  };

  const centerPos = [
    (animatedProviderPos[0] + farmerPos[0]) / 2,
    (animatedProviderPos[1] + farmerPos[1]) / 2
  ];

  // Active Navigation Step Instruction
  const activeStepInstruction = 
    turnSteps.length > 0 
      ? turnSteps[Math.min(Math.floor((currentStepIndex / (roadPolyline.length || 1)) * turnSteps.length), turnSteps.length - 1)]?.instruction
      : 'Follow Mahatma Gandhi Inner Ring Rd to Arundelpet Field Plot';

  const gmapUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentProviderPos[0]},${currentProviderPos[1]}&destination=${farmerLat},${farmerLng}&travelmode=driving`;

  return (
    <div className="rounded-3xl shadow-xl border border-slate-200 overflow-hidden bg-white space-y-0 relative">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-2xl flex items-center space-x-2 border border-slate-700 animate-bounce">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. ZOMATO GREEN TOP HEADER BANNER */}
      <div className="bg-[#0F8A43] text-white py-4 px-6 text-center shadow-md relative z-20">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          {liveDistanceKm <= 0.3 ? '📍 Partner Arrived at Field Plot!' : statusText}
        </h2>

        {/* Time Pill Badge, Google Maps Link & Refresh Button */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
          <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center space-x-2 border border-white/20">
            <span>{liveEtaMins} mins</span>
            <span className="opacity-60">•</span>
            <span>On time ({liveDistanceKm} km road distance)</span>
          </div>

          <a
            href={gmapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-[#0F8A43] hover:bg-slate-100 font-extrabold px-3.5 py-1.5 rounded-full text-xs shadow-md transition-transform hover:scale-105 flex items-center space-x-1"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open in Google Maps 🧭</span>
          </a>

          <button
            onClick={() => fetchRoadRoute(currentProviderPos, farmerPos)}
            title="Refresh Turn-by-Turn Road Route"
            className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full transition-colors border border-white/20"
          >
            <RefreshCw className={`w-4 h-4 ${loadingRoute ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. TURN-BY-TURN DRIVING INSTRUCTION BANNER */}
      <div className="bg-slate-900 text-amber-300 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-bold shadow-inner">
        <div className="flex items-center space-x-2 truncate">
          <CornerUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">Nav: <strong>{activeStepInstruction}</strong></span>
        </div>

        {/* Continuous GPS Toggle */}
        <button
          onClick={toggleLiveGpsWatch}
          className={`shrink-0 ml-2 px-3 py-1 rounded-full text-[11px] font-extrabold transition-all flex items-center space-x-1 border ${
            isWatchActive 
              ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse'
              : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
          }`}
        >
          <Compass className={`w-3.5 h-3.5 ${isWatchActive ? 'animate-spin' : ''}`} />
          <span>{isWatchActive ? 'GPS Live Tracking Active' : 'Auto-Track My Live GPS'}</span>
        </button>
      </div>

      {/* 3. ZOMATO 5-STAGE ORDER PROGRESS STEPPER */}
      <div className="bg-slate-950 text-white px-6 py-2.5 border-b border-slate-800 flex items-center justify-between text-[11px] font-bold overflow-x-auto">
        <div className="flex items-center space-x-1 text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Request Sent</span>
        </div>
        <span className="text-slate-700">→</span>

        <div className="flex items-center space-x-1 text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Provider Confirmed</span>
        </div>
        <span className="text-slate-700">→</span>

        <div className="flex items-center space-x-1 text-amber-400 animate-pulse">
          <Tractor className="w-3.5 h-3.5" />
          <span>Machinery En Route</span>
        </div>
        <span className="text-slate-700">→</span>

        <div className="flex items-center space-x-1 text-slate-400">
          <MapPin className="w-3.5 h-3.5" />
          <span>Arrived at Field</span>
        </div>
        <span className="text-slate-700">→</span>

        <div className="flex items-center space-x-1 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Job Complete</span>
        </div>
      </div>

      {/* 4. MAP CONTAINER WITH REAL STREET POLYLINE */}
      <div className="relative h-[480px] w-full bg-slate-100">
        
        {/* Floating Top Right Maximize/Fit Bounds Button */}
        <div className="absolute top-4 right-4 z-[400]">
          <button
            onClick={() => setRecenterCount(c => c + 1)}
            className="bg-white text-slate-700 hover:text-slate-900 p-2.5 rounded-full shadow-lg border border-slate-200 transition-all hover:scale-105"
            title="Fit Road Route"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Bottom Right Controls */}
        <div className="absolute bottom-6 right-4 z-[400] flex flex-col space-y-2">
          {/* Real Road Driving Simulation Toggle */}
          <button
            onClick={toggleSimulation}
            className={`font-bold px-4 py-2.5 rounded-2xl text-xs shadow-xl flex items-center space-x-2 transition-all ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isSimulating ? 'Pause Driving' : 'Simulate Road Driving'}</span>
          </button>

          <button
            onClick={() => setRecenterCount(c => c + 1)}
            className="bg-white text-slate-800 p-3 rounded-full shadow-xl border border-slate-200 transition-all hover:scale-110 self-end"
            title="Recenter Map"
          >
            <Target className="w-5 h-5 text-emerald-600" />
          </button>
        </div>

        {/* Leaflet Map Canvas */}
        <MapContainer
          center={centerPos}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController
            center={centerPos}
            zoomTrigger={recenterCount}
            polylineCoords={roadPolyline}
          />

          {/* REAL STREET NETWORK POLYLINE WITH DUAL STROKE CONTRAST */}
          {roadPolyline.length > 0 && (
            <>
              {/* Contour Shadow Line */}
              <Polyline
                positions={roadPolyline}
                pathOptions={{
                  color: '#1E3A8A',
                  weight: 10,
                  opacity: 0.6,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
              {/* Main Vivid Solid Blue Road Line */}
              <Polyline
                positions={roadPolyline}
                pathOptions={{
                  color: '#2563EB',
                  weight: 6,
                  opacity: 1.0,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
            </>
          )}

          {/* Animated Provider Machinery Marker along Street Path */}
          <Marker position={animatedProviderPos} icon={providerZomatoIcon}>
            <Popup className="rounded-2xl">
              <div className="p-2 space-y-2 text-xs">
                <div className="flex items-center space-x-1 text-emerald-800 font-bold">
                  <Tractor className="w-4 h-4" />
                  <span>Service Provider Machinery</span>
                </div>
                <p className="font-bold text-slate-900">{provider?.name || 'Srinivas Rao'}</p>
                <p className="text-slate-500">{provider?.village || 'Tenali Yard'}, {provider?.district || 'Guntur'}</p>
                <p className="text-sky-700 font-bold text-[11px]">
                  🚗 {liveDistanceKm} km road distance • {liveEtaMins} mins ETA
                </p>
                <a
                  href={`tel:${provider?.phone || '9876543211'}`}
                  className="inline-flex items-center space-x-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] hover:bg-emerald-700 w-full justify-center mt-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Provider ({provider?.phone || '9876543211'})</span>
                </a>
              </div>
            </Popup>
          </Marker>

          {/* Farmer Field Marker (Destination Black Pin with Glowing Halo) */}
          <Marker position={farmerPos} icon={farmerZomatoIcon}>
            <Popup className="rounded-2xl">
              <div className="p-2 space-y-2 text-xs">
                <div className="flex items-center space-x-1 text-blue-700 font-bold">
                  <MapPin className="w-4 h-4" />
                  <span>Farmer Field Location</span>
                </div>
                <p className="font-bold text-slate-900">{farmer?.name || 'Ramesh Kumar'}</p>
                <p className="text-slate-500">{farmer?.village || 'Tenali Plot'}, {farmer?.district || 'Guntur'}</p>
                <a
                  href={`tel:${farmer?.phone || '9876543210'}`}
                  className="inline-flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] hover:bg-blue-700 w-full justify-center mt-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Farmer ({farmer?.phone || '9876543210'})</span>
                </a>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* 5. ZOMATO BOTTOM VERIFIED PARTNER FOOTER SHEET */}
      <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white shrink-0">
            🚜
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-extrabold text-slate-900 text-base">
                {provider?.name || 'Srinivas Rao'}
              </h4>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-300">
                <ShieldCheck className="w-3 h-3" /> Verified Partner ⭐ 4.9
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Heavy Tractor & Ploughing Unit • {provider?.village || 'Tenali'} ({liveDistanceKm} km away)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <a
            href={gmapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-2xl text-xs font-extrabold shadow-md flex items-center justify-center space-x-1.5 transition-transform hover:scale-102"
          >
            <Navigation className="w-4 h-4" />
            <span>Google Maps 🧭</span>
          </a>

          <a
            href={`tel:${provider?.phone || '9876543211'}`}
            className="flex-1 sm:flex-initial bg-[#0F8A43] hover:bg-[#0c7337] text-white px-6 py-3 rounded-2xl text-xs font-extrabold shadow-md flex items-center justify-center space-x-2 transition-transform hover:scale-102"
          >
            <Phone className="w-4 h-4" />
            <span>Call Provider ({provider?.phone || '9876543211'})</span>
          </a>
        </div>
      </div>

    </div>
  );
};
