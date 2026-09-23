import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appName';
import { InteractiveGeoMap } from '../components/InteractiveGeoMap';
import { 
  Tractor, 
  MapPin, 
  Navigation, 
  PhoneCall, 
  ShieldCheck, 
  RefreshCw, 
  UserCheck,
  Compass,
  AlertCircle
} from 'lucide-react';

export const LiveTrackerPage = () => {
  const { user } = useAuth();
  
  // Default Demo Accounts for Farmer (9876543210) & Provider (9876543211) within 10 KM range
  const [farmer, setFarmer] = useState({
    name: 'Ramesh Kumar',
    phone: '9876543210',
    village: 'Tenali Plot #4',
    district: 'Guntur',
    location: { latitude: 16.3067, longitude: 80.4365 }
  });

  const [provider, setProvider] = useState({
    name: 'Srinivas Rao',
    phone: '9876543211',
    village: 'Tenali Machinery Yard',
    district: 'Guntur',
    location: { latitude: 16.3400, longitude: 80.4600 }
  });

  const [distanceKm, setDistanceKm] = useState(4.2);
  const [etaMinutes, setEtaMinutes] = useState(12);
  const [loading, setLoading] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  // Simulate movement towards field
  const handleSimulateMovement = () => {
    // Step provider closer to farmer
    setProvider(prev => {
      const fLat = farmer.location.latitude;
      const fLng = farmer.location.longitude;
      const curLat = prev.location.latitude;
      const curLng = prev.location.longitude;

      const newLat = curLat + (fLat - curLat) * 0.2;
      const newLng = curLng + (fLng - curLng) * 0.2;

      return {
        ...prev,
        location: { latitude: newLat, longitude: newLng }
      };
    });

    setDistanceKm(prev => Math.max(1.2, Math.round(prev * 0.8 * 10) / 10));
    setEtaMinutes(prev => Math.max(3, Math.round(prev * 0.8)));
  };

  // Sync real-time browser GPS location to backend
  const handleSyncCurrentLocation = () => {
    if (navigator.geolocation) {
      setUpdatingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const newLoc = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            };
            await axios.put('/api/auth/location', newLoc);

            if (user?.role === 'provider') {
              setProvider(prev => ({ ...prev, location: newLoc }));
            } else {
              setFarmer(prev => ({ ...prev, location: newLoc }));
            }
            alert('Live GPS Location synced with server successfully!');
          } catch (err) {
            console.error('Error syncing location:', err);
          } finally {
            setUpdatingLocation(false);
          }
        },
        (err) => {
          alert('GPS permission denied or unavailable.');
          setUpdatingLocation(false);
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-100 border border-white/20">
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>Interactive Geo Field Tracking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Live Machinery & Field Navigation
            </h1>
            <p className="text-emerald-100 text-sm max-w-xl">
              Track real-time provider movement, view route distance, and call to guide machinery directly to your field plot.
            </p>
          </div>

          <button
            onClick={handleSyncCurrentLocation}
            disabled={updatingLocation}
            className="bg-white hover:bg-slate-100 text-emerald-800 font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${updatingLocation ? 'animate-spin' : ''}`} />
            <span>{updatingLocation ? 'Updating GPS...' : 'Sync My Live GPS'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Geo Map */}
      <InteractiveGeoMap
        farmer={farmer}
        provider={provider}
        distanceKm={distanceKm}
        etaMinutes={etaMinutes}
        onSimulateMove={handleSimulateMovement}
      />

      {/* Field Navigation & Guidance Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Farmer Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2 text-blue-700 font-bold text-sm">
              <MapPin className="w-4 h-4" />
              <span>Farmer Field Location</span>
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
              Client
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <p className="font-bold text-slate-900 text-sm">{farmer.name}</p>
            <p className="text-slate-500">{farmer.village}, {farmer.district}</p>
            <p className="text-slate-400 font-mono text-[11px]">
              GPS: ({farmer.location.latitude.toFixed(4)}° N, {farmer.location.longitude.toFixed(4)}° E)
            </p>
          </div>

          <a
            href={`tel:${farmer.phone}`}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-2xl text-xs transition-colors shadow-xs w-full"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Farmer ({farmer.phone})</span>
          </a>
        </div>

        {/* Provider Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <Tractor className="w-4 h-4" />
              <span>Provider Machinery Location</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Equipment Provider
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <p className="font-bold text-slate-900 text-sm">{provider.name}</p>
            <p className="text-slate-500">{provider.village}, {provider.district}</p>
            <p className="text-slate-400 font-mono text-[11px]">
              GPS: ({provider.location.latitude.toFixed(4)}° N, {provider.location.longitude.toFixed(4)}° E)
            </p>
          </div>

          <a
            href={`tel:${provider.phone}`}
            className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl text-xs transition-colors shadow-xs w-full"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Provider ({provider.phone})</span>
          </a>
        </div>

      </div>

    </div>
  );
};
