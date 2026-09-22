import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG, formatRupees } from '../config/appName';
import { calculateHaversineDistance, getDistrictCoordinates } from '../utils/distance';
import { BookingModal } from '../components/BookingModal';
import { MarketplaceSkeleton } from '../components/SkeletonCards';
import { 
  Tractor, 
  Search, 
  Filter, 
  MapPin, 
  Compass, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  SlidersHorizontal, 
  X, 
  Sparkles, 
  PhoneCall, 
  ShieldCheck,
  User,
  Star,
  Users,
  Check,
  Navigation,
  CloudRain,
  AlertTriangle,
  CreditCard,
  Wallet,
  Banknote,
  QrCode,
  Copy
} from 'lucide-react';

export const Marketplace = () => {
  const { user, selectedDistrict, selectedState, userLocation, setUserLocation, detectLiveLocation } = useAuth();
  
  // State for raw fetched listings from backend
  const [rawServices, setRawServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Client Location Coordinates State
  const [clientLocation, setClientLocation] = useState(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      return userLocation;
    }
    if (user?.location?.latitude && user?.location?.longitude) {
      return user.location;
    }
    return getDistrictCoordinates(selectedDistrict);
  });
  const [gpsActive, setGpsActive] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPricingUnit, setSelectedPricingUnit] = useState('all');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [maxDistanceKm, setMaxDistanceKm] = useState(16);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedWorkforceType, setSelectedWorkforceType] = useState('all');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');

  // Booking Modal State
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [acresOrHours, setAcresOrHours] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [bookingStep, setBookingStep] = useState('details'); // 'details' | 'payment'
  const [transactionRef, setTransactionRef] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submittedPaymentStatus, setSubmittedPaymentStatus] = useState('pending');
  const [weatherAlert, setWeatherAlert] = useState({
    loading: false,
    hasAlert: false,
    warningMessage: null,
    condition: '',
    windSpeedKmh: 0
  });

  // Check Weather Guard when booking date or location changes
  useEffect(() => {
    if (selectedService && bookingDate) {
      const checkWeather = async () => {
        try {
          setWeatherAlert(prev => ({ ...prev, loading: true }));
          const res = await axios.get('/api/weather/check', {
            params: {
              lat: clientLocation.latitude || 16.3067,
              lng: clientLocation.longitude || 80.4365,
              date: bookingDate
            }
          });
          if (res.data.success) {
            setWeatherAlert({
              loading: false,
              hasAlert: res.data.hasAlert,
              warningMessage: res.data.warningMessage,
              condition: res.data.condition,
              windSpeedKmh: res.data.windSpeedKmh
            });
          }
        } catch (err) {
          console.error('Error checking Weather Guard:', err);
          setWeatherAlert({ loading: false, hasAlert: false, warningMessage: null, condition: '', windSpeedKmh: 0 });
        }
      };
      checkWeather();
    }
  }, [selectedService, bookingDate, clientLocation]);

  // Update client location when global userLocation changes from top Navbar GPS button
  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      setClientLocation(userLocation);
      setGpsActive(true);
    }
  }, [userLocation]);

  // Update client location when district changes (if not using live GPS)
  useEffect(() => {
    if (!gpsActive) {
      const coords = getDistrictCoordinates(selectedDistrict);
      setClientLocation(coords);
    }
  }, [selectedDistrict, gpsActive]);

  // Handle Browser HTML5 Geolocation
  const handleUseLiveGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setClientLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setGpsActive(true);
          alert(`GPS Location Acquired: (${position.coords.latitude.toFixed(4)}° N, ${position.coords.longitude.toFixed(4)}° E)`);
        },
        (err) => {
          alert('Could not access live GPS location. Using district coordinates.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Fetch Marketplace Services from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedTaskType !== 'all') params.append('taskType', selectedTaskType);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedPricingUnit !== 'all') params.append('pricingUnit', selectedPricingUnit);
      if (searchQuery) params.append('search', searchQuery);
      params.append('maxDistanceKm', maxDistanceKm);
      if (clientLocation.latitude && clientLocation.longitude) {
        params.append('userLat', clientLocation.latitude);
        params.append('userLng', clientLocation.longitude);
      }

      const res = await axios.get(`/api/marketplace/services?${params.toString()}`);
      if (res.data.success) {
        setRawServices(res.data.services || []);
      }
    } catch (err) {
      console.error('Error fetching marketplace services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedTaskType, selectedCategory, selectedPricingUnit, searchQuery, clientLocation, maxDistanceKm]);

  // Smooth Client-Side Filtering & Haversine Distance Recommendation Engine using useMemo
  const processedServices = useMemo(() => {
    if (!rawServices || rawServices.length === 0) return [];

    const cLat = clientLocation.latitude || 16.3067;
    const cLng = clientLocation.longitude || 80.4365;

    return rawServices
      .map((service) => {
        const fallbackCoords = getDistrictCoordinates(service.district || service.providerId?.district || selectedDistrict);
        
        let pLat = fallbackCoords.latitude;
        let pLng = fallbackCoords.longitude;

        if (service.location && typeof service.location.latitude === 'number' && typeof service.location.longitude === 'number') {
          const rawLat = service.location.latitude;
          const rawLng = service.location.longitude;
          const devKm = calculateHaversineDistance(fallbackCoords.latitude, fallbackCoords.longitude, rawLat, rawLng);
          if (devKm <= 30) {
            pLat = rawLat;
            pLng = rawLng;
          }
        }

        let distKm = calculateHaversineDistance(cLat, cLng, pLat, pLng);

        // If distance is from backend sObj, use smaller or accurate distance
        if (typeof service.distanceKm === 'number' && service.distanceKm >= 0 && service.distanceKm < distKm) {
          distKm = service.distanceKm;
        }

        return {
          ...service,
          distanceKm: distKm
        };
      })
      .filter((service) => {
        if (onlyAvailable && service.status !== 'available') return false;
        if (maxPrice && service.priceInRupees > maxPrice) return false;
        
        // If distance slider is set (e.g. 16 km), allow +5 km buffer; if service is in same district, keep in range
        const effectiveMaxDistance = Number(maxDistanceKm) + 5;
        const sDistrict = service.district || service.providerId?.district;
        const isSameDistrict = sDistrict && selectedDistrict && sDistrict.toLowerCase() === selectedDistrict.toLowerCase();
        
        if (!isSameDistrict && effectiveMaxDistance && service.distanceKm > effectiveMaxDistance) {
          return false;
        }

        // Category Tab Filtering
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'Machinery & Farm Equipment') {
            if (service.category !== 'Machinery & Farm Equipment' && service.category !== 'machine') return false;
          } else if (selectedCategory === 'Agricultural Skilled Workforce') {
            if (service.category !== 'Agricultural Skilled Workforce' && service.category !== 'human_labor') return false;
          }
        }

        // Secondary Workforce Filtering
        if (selectedCategory === 'Agricultural Skilled Workforce' || service.category === 'Agricultural Skilled Workforce' || service.category === 'human_labor') {
          if (selectedWorkforceType !== 'all' && service.workforceType !== selectedWorkforceType) return false;
          if (selectedSpecialization !== 'all' && (!service.specializedTasks || !service.specializedTasks.includes(selectedSpecialization))) return false;
        }

        return true;
      })
      // Sort by distance ASCENDING (closest service providers recommended first!)
      .sort((a, b) => a.distanceKm - b.distanceKm);

  }, [rawServices, clientLocation, selectedDistrict, maxPrice, maxDistanceKm, onlyAvailable, selectedCategory, selectedWorkforceType, selectedSpecialization]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTaskType('all');
    setSelectedCategory('all');
    setSelectedPricingUnit('all');
    setSelectedWorkforceType('all');
    setSelectedSpecialization('all');
    setMaxPrice(5000);
    setMaxDistanceKm(16);
    setOnlyAvailable(false);
    setGpsActive(false);
  };

  // Open Booking Modal
  const handleOpenBooking = (service) => {
    setSelectedService(service);
    setBookingDate(new Date().toISOString().split('T')[0]);
    setAcresOrHours(1);
    setPaymentMethod('upi');
    setBookingStep('details');
    setTransactionRef('');
    setBookingSuccess(false);
    setSubmittedPaymentStatus('pending');
  };

  // Execute Booking Submission with explicit payment status verification
  const executeBookingSubmission = async (targetPaymentStatus) => {
    if (!selectedService) return;
    setSubmittingBooking(true);

    const calculatedTotal = (selectedService.priceInRupees || 0) * acresOrHours;

    const submitWithLocation = async (lat, lng) => {
      try {
        const payload = {
          serviceId: selectedService._id,
          bookingDate: bookingDate,
          startDate: bookingDate,
          quantity: acresOrHours,
          landAreaAcres: selectedService.pricingUnit === 'per_acre' ? acresOrHours : 0,
          durationHours: selectedService.pricingUnit === 'per_hour' ? acresOrHours : 0,
          totalAmountInRupees: calculatedTotal,
          paymentMethod: paymentMethod,
          paymentStatus: targetPaymentStatus,
          transactionRef: transactionRef || null,
          farmerLocation: {
            latitude: lat,
            longitude: lng,
            district: selectedDistrict || user?.district || 'Guntur',
            village: user?.village || 'Field Plot'
          }
        };

        const res = await axios.post('/api/bookings/create', payload);
        if (res.data.success) {
          setSubmittedPaymentStatus(targetPaymentStatus);
          setBookingSuccess(true);
          fetchServices(); // Refresh marketplace listings so service status updates to 'busy'
          setTimeout(() => {
            setSelectedService(null);
            setBookingSuccess(false);
            setBookingStep('details');
          }, 3000);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to submit booking request.');
      } finally {
        setSubmittingBooking(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          submitWithLocation(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          submitWithLocation(clientLocation.latitude || 16.3067, clientLocation.longitude || 80.4365);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      submitWithLocation(clientLocation.latitude || 16.3067, clientLocation.longitude || 80.4365);
    }
  };

  // Submit Handler for Details Form
  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (paymentMethod === 'cod') {
      executeBookingSubmission('pending');
    } else {
      setBookingStep('payment');
    }
  };

  const taskTypes = [
    { id: 'all', label: 'All Tasks' },
    { id: 'ploughing', label: 'Ploughing' },
    { id: 'sowing', label: 'Sowing' },
    { id: 'transplanting', label: 'Transplanting' },
    { id: 'weeding', label: 'Weeding' },
    { id: 'fertilizing', label: 'Fertilizing' },
    { id: 'harvesting', label: 'Harvesting' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-sky-100 border border-white/20">
              <Tractor className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Equipment Marketplace</span>
            </div>

            {/* GPS Live Location Trigger */}
            <button
              onClick={handleUseLiveGps}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                gpsActive
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${gpsActive ? 'animate-spin' : ''}`} />
              <span>{gpsActive ? 'GPS Active' : 'Use Live GPS Location'}</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Rent Machinery & Farm Services
          </h1>

          <p className="text-indigo-100 text-sm max-w-2xl flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Client Location: <strong>{selectedDistrict}, {selectedState}</strong> ({clientLocation.latitude.toFixed(2)}° N, {clientLocation.longitude.toFixed(2)}° E)</span>
          </p>

          {/* Search Bar */}
          <div className="pt-2 max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5 text-indigo-500" />
              </div>
              <input
                type="text"
                placeholder="Search tractor name, task (ploughing, harvesting), or village..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-semibold shadow-lg focus:outline-hidden focus:ring-4 focus:ring-sky-300 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Category Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>🌐 All Services</span>
        </button>

        <button
          onClick={() => setSelectedCategory('Machinery & Farm Equipment')}
          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            selectedCategory === 'Machinery & Farm Equipment' || selectedCategory === 'machine'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Tractor className="w-4 h-4 text-amber-400" />
          <span>Machinery & Farm Equipment</span>
        </button>

        <button
          onClick={() => setSelectedCategory('Agricultural Skilled Workforce')}
          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            selectedCategory === 'Agricultural Skilled Workforce' || selectedCategory === 'human_labor'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4 text-amber-300" />
          <span>Agricultural Skilled Workforce</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black border border-emerald-300 ml-1">0% Commission</span>
        </button>
      </div>

      {/* Task Type Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {taskTypes.map((task) => (
          <button
            key={task.id}
            onClick={() => setSelectedTaskType(task.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedTaskType === task.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
            }`}
          >
            {task.label}
          </button>
        ))}
      </div>

      {/* Main Filter Bar Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Refine Distance & Price Range</span>
          </div>

          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Reset All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          
          {/* Category Toggle */}
          <div>
            <label className="block text-slate-500 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-indigo-600"
            >
              <option value="all">All Categories</option>
              <option value="Machinery & Farm Equipment">Machinery & Farm Equipment 🚜</option>
              <option value="Agricultural Skilled Workforce">Agricultural Skilled Workforce 👨‍🌾 (0% Commission)</option>
            </select>
          </div>

          {/* Pricing Unit Filter */}
          <div>
            <label className="block text-slate-500 mb-1">Pricing Unit</label>
            <select
              value={selectedPricingUnit}
              onChange={(e) => setSelectedPricingUnit(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-indigo-600"
            >
              <option value="all">All Pricing Units</option>
              <option value="per_hour">Per Hour (₹/hr)</option>
              <option value="per_acre">Per Acre (₹/acre)</option>
              <option value="per_day">Per Day (₹/day)</option>
              <option value="per_worker_day">Per Worker Day (₹/worker/day)</option>
              <option value="per_group_acre">Per Group Acre (₹/team/acre)</option>
            </select>
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="flex justify-between text-slate-500 mb-1">
              <span>Max Price</span>
              <span className="font-bold text-indigo-700">{formatRupees(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Haversine Distance Range Slider (16 KM Default with ±5 KM Buffer) */}
          <div>
            <div className="flex justify-between text-slate-500 mb-1">
              <span>Distance Range Radius</span>
              <span className="font-bold text-sky-700">{maxDistanceKm} km (±5 km buffer: up to {maxDistanceKm + 5} km)</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>

        </div>

        {/* Secondary Workforce Filters Bar (Visible when Workforce category active) */}
        {(selectedCategory === 'Agricultural Skilled Workforce' || selectedCategory === 'human_labor') && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
            <div>
              <label className="block text-emerald-800 font-bold mb-1">Workforce Structure</label>
              <select
                value={selectedWorkforceType}
                onChange={(e) => setSelectedWorkforceType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-emerald-600"
              >
                <option value="all">All Workforce Types</option>
                <option value="Individual Worker">Individual Worker 👤</option>
                <option value="Workgroup Team">Workgroup Team 👥</option>
              </select>
            </div>

            <div>
              <label className="block text-emerald-800 font-bold mb-1">Specialized Field Task</label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-emerald-600"
              >
                <option value="all">All Field Specializations</option>
                <option value="Paddy Transplanting">Paddy Transplanting 🌾</option>
                <option value="Manual Weeding">Manual Weeding 🌱</option>
                <option value="Cotton Picking">Cotton Picking ☁️</option>
                <option value="Sugarcane Harvesting">Sugarcane Harvesting 🎋</option>
                <option value="Chilli Harvesting">Chilli Harvesting 🌶️</option>
                <option value="Pesticide Spraying">Pesticide Spraying 💦</option>
                <option value="Fruit & Grain Bundling">Fruit & Grain Bundling 📦</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Recommended <span className="text-indigo-700">{processedServices.length}</span> Services (Sorted by Closest Distance)
        </p>

        <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            className="rounded-md text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
          <span>Only Available Now</span>
        </label>
      </div>

      {/* Amazon-Style Product Grid */}
      {loading ? (
        <MarketplaceSkeleton />
      ) : processedServices.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full w-fit mx-auto">
            <Tractor className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Matching Services in Range</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try expanding the distance radius slider (currently {maxDistanceKm} km) or resetting price bounds.
          </p>
          <button
            onClick={handleResetFilters}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-sm transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedServices.map((service) => {
            const isAvailable = service.status === 'available';
            const isWorkforce = service.category === 'Agricultural Skilled Workforce' || service.category === 'human_labor';
            const unitLabel = 
              service.pricingUnit === 'per_hour' ? '/ hr' :
              service.pricingUnit === 'per_acre' ? '/ acre' :
              service.pricingUnit === 'per_worker_day' ? '/ worker / day' :
              service.pricingUnit === 'per_group_acre' ? '/ team / acre' : '/ day';

            const providerName = service.providerId?.name || service.providerName || 'Verified Provider';
            const villageName = service.village || service.providerId?.village || 'Local Village';
            const districtName = service.district || service.providerId?.district || selectedDistrict;

            return (
              <div
                key={service._id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* 1. Image Header & Overlay Badges */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}

                  <div
                    style={{ display: service.imageUrl ? 'none' : 'flex' }}
                    className="w-full h-full bg-gradient-to-br from-indigo-50/80 via-slate-100 to-sky-100 flex-col items-center justify-center text-indigo-400"
                  >
                    {isWorkforce ? (
                      <User className="w-14 h-14 opacity-50 mb-1" />
                    ) : (
                      <Tractor className="w-14 h-14 opacity-50 mb-1" />
                    )}
                    <span className="text-xs font-bold text-indigo-500">
                      {isWorkforce ? 'Agricultural Workforce' : 'Machinery & Equipment'}
                    </span>
                  </div>

                  {/* Top Left: Category Badge */}
                  <span className={`absolute top-3 left-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs ${
                    isWorkforce
                      ? 'bg-emerald-900/85 text-emerald-100 border border-emerald-400/40'
                      : 'bg-slate-900/85 text-indigo-200 border border-indigo-400/40'
                  }`}>
                    {isWorkforce ? '👨‍🌾 Skilled Workforce' : '🚜 Machinery'}
                  </span>

                  {/* Top Right: Status Badge */}
                  <span className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border shadow-xs flex items-center space-x-1 ${
                    isAvailable
                      ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-950/85 text-amber-300 border-amber-500/40'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                    <span>{isAvailable ? 'Available Now' : 'Currently Busy'}</span>
                  </span>

                  {/* Bottom Right Overlay: Distance Pill */}
                  <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[11px] font-bold border border-white/20 flex items-center space-x-1 shadow-md">
                    <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{service.distanceKm} km away</span>
                  </div>
                </div>

                {/* 2. Organized Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  
                  <div className="space-y-3">
                    {/* Provider Profile Info Row */}
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-indigo-200">
                          {providerName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 truncate max-w-[140px]">{providerName}</span>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                          ✓ Verified
                        </span>
                      </div>
                      <span className="text-[11px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        ⭐ 4.9
                      </span>
                    </div>

                    {/* Title & Task Badge */}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
                        {service.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg border border-indigo-100 capitalize">
                          Task: {service.taskType}
                        </span>
                        {isWorkforce && (
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-lg">
                            ⚡ 0% Admin Fee
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Structured Location & Specs Box */}
                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-600 font-medium">
                        <span className="flex items-center text-slate-500">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-indigo-600 shrink-0" />
                          <span>Location:</span>
                        </span>
                        <span className="font-bold text-slate-900 truncate ml-1">{villageName}, {districtName}</span>
                      </div>

                      {isWorkforce ? (
                        <div className="flex items-center justify-between text-slate-600 font-medium pt-1 border-t border-slate-200/50">
                          <span className="text-slate-500">Crew Size:</span>
                          <span className="font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md border border-emerald-200">
                            {service.workerCount > 1 ? `${service.workerCount} Workers (${service.workforceType || 'Team'})` : '1 Worker'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-slate-600 font-medium pt-1 border-t border-slate-200/50">
                          <span className="text-slate-500">Coverage Radius:</span>
                          <span className="font-bold text-slate-900">Up to {service.locationRadiusKm || 25} km</span>
                        </div>
                      )}

                      {/* Specializations Tags for Workforce */}
                      {isWorkforce && service.specializedTasks && service.specializedTasks.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-200/50">
                          {service.specializedTasks.map((st, i) => (
                            <span key={i} className="text-[10px] bg-white text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                              ✓ {st}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Description (if present) */}
                    {service.description && (
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed px-0.5">
                        {service.description}
                      </p>
                    )}
                  </div>

                  {/* 3. Footer Action & Pricing */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rental Price</p>
                      <div className="flex items-baseline">
                        <span className="text-xl font-black text-indigo-700 tracking-tight">
                          {formatRupees(service.priceInRupees)}
                        </span>
                        <span className="text-xs text-slate-500 font-bold ml-1">{unitLabel}</span>
                      </div>
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md mt-0.5">
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>AI Verified Rate ✓</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenBooking(service)}
                      className={`font-extrabold px-4 py-3 rounded-2xl text-xs shadow-md transition-all flex items-center space-x-1.5 text-white hover:scale-102 touch-action ${
                        isWorkforce
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                          : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                      }`}
                    >
                      <span>{isWorkforce ? 'Book Workforce' : 'Rent Machinery'}</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Booking Dialog Modal Component */}
      {selectedService && (
        <BookingModal
          selectedService={selectedService}
          onClose={() => setSelectedService(null)}
          clientLocation={clientLocation}
          selectedDistrict={selectedDistrict}
          user={user}
          onSuccess={fetchServices}
        />
      )}

    </div>
  );
};
