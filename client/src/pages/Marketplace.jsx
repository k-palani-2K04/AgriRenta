import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG, formatRupees } from '../config/appName';
import { calculateHaversineDistance, getDistrictCoordinates } from '../utils/distance';
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
        const pLat = (service.location && typeof service.location.latitude === 'number')
          ? service.location.latitude
          : (service.providerId?.location && typeof service.providerId.location.latitude === 'number')
          ? service.providerId.location.latitude
          : fallbackCoords.latitude;

        const pLng = (service.location && typeof service.location.longitude === 'number')
          ? service.location.longitude
          : (service.providerId?.location && typeof service.providerId.location.longitude === 'number')
          ? service.providerId.location.longitude
          : fallbackCoords.longitude;

        // Mathematical Haversine Distance Calculation
        const distKm = calculateHaversineDistance(cLat, cLng, pLat, pLng);

        return {
          ...service,
          distanceKm: distKm
        };
      })
      .filter((service) => {
        if (onlyAvailable && service.status !== 'available') return false;
        if (maxPrice && service.priceInRupees > maxPrice) return false;
        // Include listings within chosen distance range + 5 KM buffer (e.g. 16 KM selected -> up to 21 KM)
        const effectiveMaxDistance = Number(maxDistanceKm) + 5;
        if (effectiveMaxDistance && service.distanceKm > effectiveMaxDistance) return false;
        return true;
      })
      // Sort by distance ASCENDING (closest service providers recommended first!)
      .sort((a, b) => a.distanceKm - b.distanceKm);

  }, [rawServices, clientLocation, maxPrice, maxDistanceKm, onlyAvailable]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTaskType('all');
    setSelectedCategory('all');
    setSelectedPricingUnit('all');
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
              <option value="machine">Machinery Only 🚜</option>
              <option value="human_labor">Human Labor Teams 👨‍🌾</option>
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
        <div className="py-16 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Scanning local equipment listings...</p>
        </div>
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
            const unitLabel = 
              service.pricingUnit === 'per_hour' ? '/ hr' :
              service.pricingUnit === 'per_acre' ? '/ acre' : '/ day';

            return (
              <div
                key={service._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Image Header Banner */}
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
                    className="w-full h-full bg-gradient-to-br from-indigo-50 to-sky-100 flex-col items-center justify-center text-indigo-300"
                  >
                    <Tractor className="w-16 h-16 opacity-60 mb-1" />
                    <span className="text-[11px] font-bold text-indigo-400">Equipment Listing</span>
                  </div>

                  {/* Category Badge overlay */}
                  <span className={`absolute top-3 left-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs ${
                    service.category === 'machine'
                      ? 'bg-indigo-900/80 text-white border border-indigo-500/30'
                      : 'bg-amber-900/80 text-white border border-amber-500/30'
                  }`}>
                    {service.category === 'machine' ? '🚜 Machinery' : '👨‍🌾 Human Labor'}
                  </span>

                  {/* Availability Badge overlay */}
                  <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border shadow-xs flex items-center space-x-1 ${
                    isAvailable
                      ? 'bg-emerald-900/80 text-emerald-200 border-emerald-500/40'
                      : 'bg-amber-900/80 text-amber-200 border-amber-500/40'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                    <span>{isAvailable ? 'Available' : 'Busy'}</span>
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  
                  <div className="space-y-2">
                    {/* Title */}
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
                      {service.title}
                    </h3>

                    {/* Task Type Badge */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg capitalize">
                        Task: {service.taskType}
                      </span>
                    </div>

                    {/* Distance & Location Info */}
                    <div className="space-y-1 pt-1 text-xs">
                      {/* Haversine Distance Badge */}
                      <div className="flex items-center text-sky-700 font-bold bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-xl w-fit">
                        <Compass className="w-3.5 h-3.5 mr-1.5 text-sky-600 shrink-0" />
                        <span>📍 {service.distanceKm} km away from your location</span>
                      </div>

                      {/* Provider Location */}
                      <div className="flex items-center text-slate-500 font-medium pt-0.5">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-indigo-600 shrink-0" />
                        <span>
                          Provider Location: <strong>{service.village || service.providerId?.village || 'Village'}, {service.district || service.providerId?.district || selectedDistrict}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price Tag & Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rental Price</p>
                      <div className="flex items-baseline">
                        <span className="text-xl font-black text-indigo-700 tracking-tight">
                          {formatRupees(service.priceInRupees)}
                        </span>
                        <span className="text-xs text-slate-500 font-bold ml-1">{unitLabel}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenBooking(service)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5"
                    >
                      <span>Rent Now</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Booking Dialog Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header (Fixed at top) */}
            <div className="bg-gradient-to-r from-indigo-700 to-sky-700 px-5 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Tractor className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Service Booking & Payment Checkout</h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Body (Scrolls cleanly within max-h-[90vh]) */}
            <div className="overflow-y-auto flex-1">
              {bookingSuccess ? (
                <div className="p-6 text-center space-y-3">
                  <div className={`p-3.5 rounded-full w-fit mx-auto animate-bounce ${submittedPaymentStatus === 'advance_paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    <CheckCircle className="w-9 h-9" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {submittedPaymentStatus === 'advance_paid' ? '✓ 20% Advance Payment Verified!' : '📋 Booking Request Submitted!'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {submittedPaymentStatus === 'advance_paid'
                      ? `Your 20% advance payment has been verified. The equipment provider receives your confirmed rental booking request.`
                      : `Your rental request is sent to the provider with 20% Advance status set to Pending. You can complete payment upon provider arrival.`}
                  </p>
                </div>
              ) : bookingStep === 'payment' ? (
                (() => {
                  const totalCost = (selectedService.priceInRupees || 0) * acresOrHours;
                  const advanceAmount = Math.round(totalCost * 0.20);
                  const adminCommission = Math.round(totalCost * 0.05);
                  const providerDisbursement = Math.round(totalCost * 0.15);
                  const adminUpiId = '9030585591@ybl';
                  const payeeName = 'K PALANI';
                  const formattedAdvanceAmount = Number(advanceAmount).toFixed(2);
                  const upiNote = `AgriRenta 20% Advance for ${selectedService.title}`;
                  
                  // Construct standard NPCI-compliant UPI deep link (Rule 1)
                  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(adminUpiId)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAdvanceAmount}&cu=INR&tn=${encodeURIComponent(upiNote)}`;
                  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiDeepLink)}`;

                  return (
                    <div className="p-4 sm:p-5 space-y-3.5">
                      
                      {/* Payment Gateway Header Banner */}
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                            🛡️ Admin Dynamic UPI Escrow Gateway
                          </span>
                          <span className="text-xs font-black text-emerald-700">
                            20% Advance: {formatRupees(advanceAmount)}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs">Scan Dynamic QR Code to Pay Pre-Populated Amount</h4>
                        <p className="text-[11px] text-slate-500">
                          Scanning automatically fills <strong>{formatRupees(advanceAmount)}</strong> in your UPI payment app!
                        </p>
                      </div>

                      {/* Escrow & Financial Revenue Breakdown Card */}
                      <div className="bg-indigo-50/70 border border-indigo-100 p-3 rounded-2xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Total Rental Service Cost:</span>
                          <span className="font-extrabold text-slate-900">{formatRupees(totalCost)}</span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-emerald-800 pt-1 border-t border-indigo-200/60">
                          <span>Required 20% Advance Payable Now:</span>
                          <span className="text-xs font-black">{formatRupees(advanceAmount)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-indigo-200/60 text-[10px]">
                          <div className="bg-white p-1.5 rounded-xl border border-indigo-100">
                            <span className="text-slate-400 font-medium block">Admin Commission (5%):</span>
                            <span className="font-bold text-indigo-700">{formatRupees(adminCommission)}</span>
                          </div>
                          <div className="bg-white p-1.5 rounded-xl border border-indigo-100">
                            <span className="text-slate-400 font-medium block">Provider Escrow (15%):</span>
                            <span className="font-bold text-emerald-700">{formatRupees(providerDisbursement)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Prominently Emphasized 20% Payable Advance Amount Banner */}
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-3 text-center shadow-xs space-y-0.5">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-100 block">
                          Payable 20% Advance Amount
                        </span>
                        <span className="text-2xl font-black tracking-tight block">
                          {formatRupees(advanceAmount)}
                        </span>
                        <span className="text-[10px] text-emerald-100 font-medium block">
                          Scan QR code below with GPay, PhonePe, Paytm, or BHIM
                        </span>
                      </div>

                      {/* Dynamic Auto-Populated UPI QR Code Display */}
                      <div className="bg-gradient-to-br from-indigo-50/50 to-sky-50/50 border border-indigo-100 p-4 rounded-2xl text-center space-y-2.5">
                        <div className="flex items-center justify-center">
                          <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200">
                            <img
                              src={dynamicQrUrl}
                              alt="Dynamic Auto-Populated UPI QR Code"
                              className="w-40 h-40 mx-auto object-contain"
                            />
                            <span className="text-[10px] text-emerald-700 font-black block mt-1">
                              ✓ Dynamic Pay QR (Auto-Fills ₹{formattedAdvanceAmount})
                            </span>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <p className="text-[11px] text-slate-500 font-medium">Verified Admin Escrow Payee:</p>
                          <div className="flex items-center justify-center space-x-2 bg-white px-3 py-1 rounded-xl border border-slate-200 w-fit mx-auto shadow-2xs">
                            <span className="font-mono text-[11px] font-black text-indigo-900">{payeeName} ({adminUpiId})</span>
                          </div>
                        </div>

                        {/* Direct App Link */}
                        <a
                          href={upiDeepLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold py-2.5 px-4 rounded-2xl text-xs shadow-xs transition-all w-full mt-1"
                        >
                          <Wallet className="w-4 h-4 text-amber-300" />
                          <span>Pay ₹{advanceAmount} via GPay / PhonePe / Paytm App 📱</span>
                        </a>
                      </div>

                      {/* Optional UTR / Reference Input */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          UPI Transaction UTR / Ref No. (Optional Verification)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 324156789012"
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden focus:border-indigo-600"
                        />
                      </div>

                      {/* Verification Actions */}
                      <div className="space-y-1.5 pt-1">
                        <button
                          type="button"
                          disabled={submittingBooking}
                          onClick={() => executeBookingSubmission('advance_paid')}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-2xl text-xs shadow-xs disabled:opacity-50 flex items-center justify-center space-x-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{submittingBooking ? 'Verifying Payment...' : `I Have Paid 20% Advance (${formatRupees(Math.round((selectedService.priceInRupees || 0) * acresOrHours * 0.20))})`}</span>
                        </button>

                        <button
                          type="button"
                          disabled={submittingBooking}
                          onClick={() => executeBookingSubmission('pending')}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-2xl text-xs border border-slate-300 disabled:opacity-50"
                        >
                          Skip Online Payment (Mark Advance as Pending)
                        </button>

                        <button
                          type="button"
                          onClick={() => setBookingStep('details')}
                          className="w-full text-[11px] font-bold text-indigo-600 hover:underline pt-0.5"
                        >
                          ← Back to Service & Date Details
                        </button>
                      </div>

                    </div>
                  );
                })()
              ) : (
                <form onSubmit={handleConfirmBooking} className="p-4 sm:p-5 space-y-4">
                
                {/* Equipment Summary Card */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                      {selectedService.category === 'machine' ? 'Machinery' : 'Human Labor'}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      ₹{selectedService.priceInRupees} / {selectedService.pricingUnit === 'per_acre' ? 'acre' : selectedService.pricingUnit === 'per_hour' ? 'hr' : 'day'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{selectedService.title}</h4>
                  <p className="text-xs text-slate-500">
                    Provider Location: <strong>{selectedService.village || selectedService.providerId?.village}, {selectedService.district || selectedService.providerId?.district}</strong> ({selectedService.distanceKm} km away)
                  </p>
                </div>

                {/* Date Selection & Weather Guard Integration Banner */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Select Rental Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-hidden focus:border-indigo-600"
                  />

                  {/* Weather Guard Alert Banner */}
                  {weatherAlert.loading ? (
                    <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-700 flex items-center space-x-2 animate-pulse">
                      <CloudRain className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Weather Guard: Verifying forecast for selected date...</span>
                    </div>
                  ) : weatherAlert.hasAlert ? (
                    <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 space-y-1">
                      <div className="flex items-center space-x-1.5 font-extrabold text-amber-700">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Weather Guard: Extreme Weather Forecasted!</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        {weatherAlert.warningMessage || `High wind speeds (${weatherAlert.windSpeedKmh} km/h) & condition (${weatherAlert.condition}) predicted. Renting on this date may experience weather delays.`}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Weather Guard: Clear sky forecast ({weatherAlert.condition || 'Favorable Weather'}) for field operations.</span>
                    </div>
                  )}
                </div>

                {/* Work Estimator (Land Area Acres / Hours Input) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Work Estimator ({selectedService.pricingUnit === 'per_acre' ? 'Land Area in Acres' : selectedService.pricingUnit === 'per_hour' ? 'Duration in Hours' : 'Number of Days'})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={acresOrHours}
                      onChange={(e) => setAcresOrHours(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-hidden focus:border-indigo-600"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                      {selectedService.pricingUnit === 'per_acre' ? 'Acres' : selectedService.pricingUnit === 'per_hour' ? 'Hours' : 'Days'}
                    </span>
                  </div>
                </div>

                {/* Pricing & 20% Advance Calculation Card */}
                {(() => {
                  const total = (selectedService.priceInRupees || 0) * acresOrHours;
                  const advance = Math.round(total * 0.20);
                  const balance = total - advance;

                  return (
                    <div className="bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                        <span>Total Rental Fee:</span>
                        <span className="font-bold text-slate-900">{formatRupees(total)}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                        <span>Required 20% Advance Payable Now:</span>
                        <span className="text-sm font-black text-emerald-800">{formatRupees(advance)}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                        <span>Remaining Balance Payable at Field:</span>
                        <span className="font-bold text-slate-700">{formatRupees(balance)}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Payment Method (20% Advance Checkout)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === 'upi'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                      <span>UPI / GPay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === 'razorpay'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Razorpay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === 'cod'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                      <span>COD Cash</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBooking}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    <span>{paymentMethod === 'cod' ? 'Confirm Booking (Cash / Pending)' : `Proceed to Pay 20% Advance (${formatRupees(Math.round((selectedService.priceInRupees || 0) * acresOrHours * 0.20))}) →`}</span>
                  </button>
                </div>

              </form>
            )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
