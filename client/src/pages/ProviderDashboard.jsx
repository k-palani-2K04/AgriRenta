import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG, formatRupees } from '../config/appName';
import { getDistrictCoordinates } from '../utils/distance';
import { STATES_AND_DISTRICTS } from '../data/districts';
import { 
  Tractor, 
  Users, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  MapPin, 
  Clock, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Search,
  Sparkles,
  X,
  Upload,
  Compass,
  RefreshCw,
  Navigation,
  Image as ImageIcon,
  User,
  Users2,
  Check
} from 'lucide-react';

const SPECIALIZED_TASKS_OPTIONS = [
  'Paddy Transplanting',
  'Manual Weeding',
  'Cotton Picking',
  'Sugarcane Harvesting',
  'Crop Sowing',
  'Fruit Harvesting',
  'Fertilizer Application',
  'Field Preparation'
];

export const ProviderDashboard = () => {
  const { 
    user, 
    selectedState, 
    selectedDistrict, 
    userLocation, 
    detectLiveLocation 
  } = useAuth();

  const activeCoords = (userLocation?.latitude && userLocation?.longitude)
    ? userLocation
    : getDistrictCoordinates(selectedDistrict || user?.district);
  const displayDistrict = selectedDistrict || user?.district || 'Location';
  const displayState = selectedState || user?.state || '';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAcceptingBookings, setIsAcceptingBookings] = useState(() => {
    if (user?._id) {
      const stored = localStorage.getItem(`provider_accepting_${user._id}`);
      if (stored !== null) return JSON.parse(stored);
    }
    return true;
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  
  // AI Predictive Pricing State
  const [aiPrediction, setAiPrediction] = useState(null);
  const [predictingPrice, setPredictingPrice] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Machinery & Farm Equipment',
    workforceType: 'Individual Worker',
    workerCount: 1,
    workforceGenderComposition: 'Mixed Group',
    specializedTasks: [],
    taskType: 'ploughing',
    pricingUnit: 'per_hour',
    priceInRupees: '',
    description: '',
    state: selectedState || 'Andhra Pradesh',
    district: selectedDistrict || 'Guntur',
    village: '',
    latitude: '',
    longitude: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [completedEarnings, setCompletedEarnings] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Fetch AI Price Prediction
  const handlePredictPrice = async () => {
    try {
      setPredictingPrice(true);
      const res = await axios.post('/api/ai/predict-price', {
        category: formData.category,
        title: formData.title,
        taskType: formData.taskType,
        pricingUnit: formData.pricingUnit,
        state: formData.state,
        district: formData.district,
        workforceType: formData.workforceType,
        workerCount: formData.workerCount,
        specializedTasks: formData.specializedTasks
      });
      if (res.data && res.data.predictedPrice) {
        setAiPrediction(res.data);
      }
    } catch (err) {
      console.error('AI Price prediction error:', err);
    } finally {
      setPredictingPrice(false);
    }
  };

  // Fetch Services & Completed Earnings
  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/provider/services');
      if (res.data.success) {
        const fetchedServices = res.data.services || [];
        setServices(fetchedServices);
        // Persist static toggle state derived from MongoDB listings
        if (fetchedServices.length > 0) {
          const hasAvailable = fetchedServices.some(s => s.status === 'available');
          setIsAcceptingBookings(hasAvailable);
          if (user?._id) {
            localStorage.setItem(`provider_accepting_${user._id}`, JSON.stringify(hasAvailable));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching provider services:', err);
      setError('Failed to load your service listings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderEarnings = async () => {
    try {
      const res = await axios.get('/api/bookings/provider-requests');
      if (res.data.success) {
        const completed = (res.data.bookings || []).filter(b => b.status === 'completed');
        const totalEarned = completed.reduce((sum, b) => {
          const total = b.totalAmountInRupees || b.totalAmount || 0;
          const payout = b.providerPayoutAmountInRupees || Math.round(total * 0.15);
          return sum + payout;
        }, 0);
        setCompletedEarnings(totalEarned);
      }
    } catch (err) {
      console.error('Error fetching provider earnings:', err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchProviderEarnings();
  }, []);

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingServiceId(null);
    const initDist = user?.district || selectedDistrict || 'Guntur';
    const fallback = getDistrictCoordinates(initDist);
    setFormData({
      title: '',
      category: 'Machinery & Farm Equipment',
      workforceType: 'Individual Worker',
      workerCount: 1,
      workforceGenderComposition: 'Mixed Group',
      specializedTasks: ['Paddy Transplanting'],
      taskType: 'ploughing',
      pricingUnit: 'per_hour',
      priceInRupees: '',
      description: '',
      state: user?.state || selectedState || 'Andhra Pradesh',
      district: initDist,
      village: user?.village || '',
      latitude: userLocation?.latitude || user?.location?.latitude || fallback.latitude,
      longitude: userLocation?.longitude || user?.location?.longitude || fallback.longitude
    });
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (service) => {
    setEditingServiceId(service._id);
    const dist = service.district || selectedDistrict || 'Guntur';
    const fallback = getDistrictCoordinates(dist);

    const cat = service.category === 'human_labor' 
      ? 'Agricultural Skilled Workforce' 
      : service.category === 'machine' 
      ? 'Machinery & Farm Equipment' 
      : service.category;

    setFormData({
      title: service.title,
      category: cat || 'Machinery & Farm Equipment',
      workforceType: service.workforceType || 'Individual Worker',
      workerCount: service.workerCount || 1,
      workforceGenderComposition: service.workforceGenderComposition || 'Mixed Group',
      specializedTasks: service.specializedTasks || [],
      taskType: service.taskType || 'ploughing',
      pricingUnit: service.pricingUnit || 'per_hour',
      priceInRupees: service.priceInRupees || '',
      description: service.description || '',
      state: service.state || selectedState || 'Andhra Pradesh',
      district: dist,
      village: service.village || user?.village || '',
      latitude: service.location?.latitude || fallback.latitude,
      longitude: service.location?.longitude || fallback.longitude
    });
    setImageFile(null);
    setImagePreview(service.imageUrl || '');
    setShowModal(true);
  };

  // Toggle Task Selection
  const toggleSpecializedTask = (task) => {
    setFormData((prev) => {
      const exists = prev.specializedTasks.includes(task);
      return {
        ...prev,
        specializedTasks: exists
          ? prev.specializedTasks.filter((t) => t !== task)
          : [...prev.specializedTasks, task]
      };
    });
  };

  // Capture Current Live GPS Location for the Listing Form
  const handleDetectListingLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );

          if (res.data && res.data.address) {
            const addr = res.data.address;
            const detectedStateName = addr.state || '';
            const detectedDistName = addr.state_district || addr.county || addr.city || addr.district || '';
            const detectedVillageName = addr.village || addr.suburb || addr.neighbourhood || addr.town || addr.residential || '';

            const matchedState = Object.keys(STATES_AND_DISTRICTS).find(
              s => s.toLowerCase() === detectedStateName.toLowerCase()
            ) || selectedState || 'Andhra Pradesh';

            const availableDistricts = STATES_AND_DISTRICTS[matchedState] || [];
            const matchedDistrict = availableDistricts.find(
              d => detectedDistName.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(detectedDistName.toLowerCase())
            ) || availableDistricts[0] || selectedDistrict;

            setFormData((prev) => ({
              ...prev,
              state: matchedState,
              district: matchedDistrict,
              village: detectedVillageName || prev.village,
              latitude: lat,
              longitude: lng
            }));

            alert(`Live GPS Location Acquired!\nState: ${matchedState}\nDistrict: ${matchedDistrict}\nCoordinates: (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);
            return;
          }
        } catch (e) {
          console.warn('[ProviderDashboard] Reverse geocoding failed:', e);
        }

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
        alert(`Captured Live GPS Coordinates: (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);
      },
      (err) => {
        alert('Could not access live GPS location. Please check browser location permissions.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Form Submit using FormData for Multer file processing
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('taskType', formData.taskType);
      data.append('pricingUnit', formData.pricingUnit);
      data.append('priceInRupees', formData.priceInRupees);
      data.append('description', formData.description);
      data.append('state', formData.state);
      data.append('district', formData.district);
      data.append('village', formData.village);
      
      const isWorkforce = formData.category === 'Agricultural Skilled Workforce';
      if (isWorkforce) {
        data.append('workforceType', formData.workforceType);
        data.append('workerCount', formData.workforceType === 'Individual Worker' ? 1 : formData.workerCount);
        data.append('workforceGenderComposition', formData.workforceGenderComposition);
        data.append('specializedTasks', JSON.stringify(formData.specializedTasks));
      }

      if (formData.latitude && formData.longitude) {
        data.append('userLat', formData.latitude);
        data.append('userLng', formData.longitude);
      }

      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingServiceId) {
        await axios.put(`/api/provider/services/${editingServiceId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/provider/services', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowModal(false);
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving service listing');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Service Status
  const handleToggleStatus = async (service) => {
    const newStatus = service.status === 'available' ? 'busy' : 'available';
    try {
      await axios.put(`/api/provider/services/${service._id}`, { status: newStatus });
      fetchServices();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Delete Service Permanently with Immediate UI State Sync
  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing permanently? File will be removed from disk.')) return;
    try {
      const res = await axios.delete(`/api/provider/services/${id}`);
      if (res.data?.success) {
        // Instantly remove listing card from state
        setServices((prev) => prev.filter((s) => s._id !== id));
      }
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete service listing');
    }
  };

  // Toggle Master Availability (Accepting Requests)
  const handleToggleMasterAvailability = async () => {
    const nextState = !isAcceptingBookings;
    setIsAcceptingBookings(nextState);
    if (user?._id) {
      localStorage.setItem(`provider_accepting_${user._id}`, JSON.stringify(nextState));
    }

    try {
      const targetStatus = nextState ? 'available' : 'busy';
      if (services.length > 0) {
        await Promise.all(
          services.map(s => axios.put(`/api/provider/services/${s._id}`, { status: targetStatus }))
        );
      }
      fetchServices();
    } catch (err) {
      console.error('Error updating master availability:', err);
    }
  };

  const activeCount = services.filter(s => s.status === 'available').length;
  const totalCount = services.length;
  const estimatedCapacityEarnings = services.reduce((sum, s) => sum + (s.priceInRupees || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Stats Overview (Light Cream Container Design) */}
      <div className="space-y-6">
        
        {/* Header Title & Availability Control Bar */}
        <div className="bg-[#FAF8F5] rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Provider Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Provider Dashboard
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1.5 font-medium">
              <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Location: <strong className="text-slate-800">{user?.village ? `${user.village}, ` : ''}{displayDistrict}{displayState ? `, ${displayState}` : ''}</strong> ({activeCoords?.latitude?.toFixed(4) || '16.3067'}° N, {activeCoords?.longitude?.toFixed(4) || '80.4365'}° E)</span>
            </p>
          </div>

          {/* Master Availability Toggle Box */}
          <div className="bg-white border border-slate-200/90 p-4 rounded-2xl flex items-center justify-between space-x-4 min-w-[260px] shadow-2xs">
            <div>
              <p className="text-xs font-semibold text-slate-500">Booking Status</p>
              <p className={`text-sm font-black ${isAcceptingBookings ? 'text-emerald-700' : 'text-slate-500'}`}>
                {isAcceptingBookings ? 'Accepting Requests' : 'Currently Paused'}
              </p>
            </div>
            <button
              onClick={handleToggleMasterAvailability}
              className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
              title="Toggle Master Availability"
              data-testid="provider-availability-toggle"
            >
              {isAcceptingBookings ? (
                <ToggleRight className="w-11 h-11 text-emerald-600" />
              ) : (
                <ToggleLeft className="w-11 h-11 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* 4 Clean Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Total Listings</span>
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                <Tractor className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">{totalCount}</p>
          </div>

          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Active Services</span>
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-emerald-600 mt-2">{activeCount}</p>
          </div>

          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Net Payout Earned</span>
              <div className="bg-amber-50 text-amber-600 p-2 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {formatRupees(completedEarnings)}
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Rate Capacity</span>
              <div className="bg-teal-50 text-teal-600 p-2 rounded-xl">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {formatRupees(estimatedCapacityEarnings)}
            </p>
          </div>
        </div>

      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Your Machinery & Skilled Workforce Listings</h2>
          <p className="text-xs text-slate-500">List equipment or labor teams, upload photos to folder directories, or manage rates.</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Service Listing</span>
        </button>
      </div>

      {/* Service Listings Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Loading your listings...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-3">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full w-fit mx-auto">
            <Tractor className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Listings Created Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Start listing your tractors, combine harvesters, or agricultural skilled workforce teams with photos.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-sm transition-all"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => {
            const isAvailable = service.status === 'available';
            const isWorkforce = service.category === 'Agricultural Skilled Workforce' || service.category === 'human_labor';

            const unitLabel = 
              service.pricingUnit === 'per_hour' ? '/ hr' :
              service.pricingUnit === 'per_acre' ? '/ acre' :
              service.pricingUnit === 'per_worker_day' ? '/ worker / day' :
              service.pricingUnit === 'per_group_acre' ? '/ team / acre' : '/ day';

            const displayImage = service.imageUrl ? service.imageUrl : null;

            const serviceDistrict = service.district || user?.district || selectedDistrict;
            const serviceVillage = service.village || user?.village || 'Locality';
            const districtCoords = getDistrictCoordinates(serviceDistrict);
            const displayLat = (service.location && typeof service.location.latitude === 'number') ? service.location.latitude : districtCoords.latitude;
            const displayLng = (service.location && typeof service.location.longitude === 'number') ? service.location.longitude : districtCoords.longitude;

            return (
              <div
                key={service._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                {/* Image Header Banner */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}

                  <div
                    style={{ display: displayImage ? 'none' : 'flex' }}
                    className="w-full h-full bg-gradient-to-br from-indigo-50 to-sky-100 flex-col items-center justify-center text-indigo-300"
                  >
                    {isWorkforce ? <Users className="w-16 h-16 opacity-60 mb-1" /> : <Tractor className="w-16 h-16 opacity-60 mb-1" />}
                    <span className="text-[11px] font-bold text-indigo-400">No Photo Uploaded</span>
                  </div>

                  {/* Category Badge overlay */}
                  <span className={`absolute top-3 left-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs ${
                    isWorkforce
                      ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/40'
                      : 'bg-indigo-900/80 text-white border border-indigo-500/30'
                  }`}>
                    {isWorkforce ? '👥 Skilled Workforce' : '🚜 Machinery'}
                  </span>

                  {/* 0% Commission Badge overlay for workforce */}
                  {isWorkforce && (
                    <span className="absolute bottom-3 left-3 text-[10px] font-extrabold bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full shadow-xs">
                      💡 0% Admin Commission
                    </span>
                  )}

                  {/* Availability Badge overlay */}
                  <button
                    onClick={() => handleToggleStatus(service)}
                    className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border shadow-xs flex items-center space-x-1 transition-all ${
                      isAvailable
                        ? 'bg-emerald-900/80 text-emerald-200 border-emerald-500/40 hover:bg-emerald-800'
                        : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                    <span>{isAvailable ? 'Available' : 'Busy'}</span>
                  </button>
                </div>

                {/* Card Content Body */}
                <div className="p-5 flex-1 space-y-3">
                  
                  {/* Title & Task Type */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{service.title}</h3>
                    
                    {isWorkforce ? (
                      <p className="text-xs text-emerald-800 font-semibold mt-0.5 flex items-center gap-1">
                        <span>{service.workforceType || 'Individual Worker'}</span>
                        {service.workforceType === 'Workgroup Team' && (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            {service.workerCount || 2} Workers
                          </span>
                        )}
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 text-[11px]">{service.workforceGenderComposition || 'Mixed Group'}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 font-medium capitalize mt-0.5">
                        Task: <span className="text-slate-800 font-semibold">{service.taskType}</span>
                      </p>
                    )}
                  </div>

                  {/* Specialized Tasks Tags */}
                  {isWorkforce && service.specializedTasks && service.specializedTasks.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {service.specializedTasks.map((t, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          ✓ {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price Banner */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-medium">Rental Rate</span>
                    <div className="text-right">
                      <span className="text-lg font-black text-indigo-700">
                        {formatRupees(service.priceInRupees)}
                      </span>
                      <span className="text-xs text-slate-500 font-bold ml-1">{unitLabel}</span>
                    </div>
                  </div>

                  {/* Location & Coordinates */}
                  <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                    <div className="flex items-center text-slate-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-indigo-600 shrink-0" />
                      <span>
                        Location: <strong>{serviceVillage}, {serviceDistrict}</strong>
                      </span>
                    </div>

                    <div className="flex items-center text-slate-500 text-[11px]">
                      <Compass className="w-3.5 h-3.5 mr-1 text-sky-600 shrink-0" />
                      <span>
                        GPS: ({displayLat.toFixed(4)}°N, {displayLng.toFixed(4)}°E)
                      </span>
                    </div>

                    {service.description && (
                      <p className="text-slate-500 text-[11px] line-clamp-2 italic pt-1">
                        "{service.description}"
                      </p>
                    )}
                  </div>

                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(service)}
                    className="flex-1 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-700 hover:bg-white rounded-xl border border-slate-200 transition-colors text-center"
                  >
                    Set {isAvailable ? 'Busy' : 'Available'}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(service)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex items-center space-x-1"
                    title="Edit Service & Image"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteService(service._id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Service Listing & Disk Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-6">
            
            {/* Modal Header */}
            <div className="bg-indigo-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {formData.category === 'Agricultural Skilled Workforce' ? <Users className="w-5 h-5" /> : <Tractor className="w-5 h-5" />}
                <h3 className="font-bold text-base">
                  {editingServiceId ? 'Edit Listing & Replace Image' : 'Add New Service Listing'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Category Selector Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Primary Service Category *
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({
                      ...prev,
                      category: 'Machinery & Farm Equipment',
                      pricingUnit: 'per_hour'
                    }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all ${
                      formData.category === 'Machinery & Farm Equipment'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-indigo-600'
                    }`}
                  >
                    <Tractor className="w-4 h-4" />
                    <span>🚜 Machinery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({
                      ...prev,
                      category: 'Agricultural Skilled Workforce',
                      pricingUnit: 'per_worker_day'
                    }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all ${
                      formData.category === 'Agricultural Skilled Workforce'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-emerald-600'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>👥 Workforce</span>
                  </button>
                </div>
              </div>

              {/* Zero-Commission Alert Banner for Workforce */}
              {formData.category === 'Agricultural Skilled Workforce' && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-900 flex items-center space-x-2 font-bold shadow-2xs">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>💡 0% Admin Commission — 100% of the customer payment goes directly to you!</span>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {formData.category === 'Agricultural Skilled Workforce' ? 'Worker / Team Name or Title *' : 'Equipment Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={formData.category === 'Agricultural Skilled Workforce' ? 'e.g. Tenali Paddy Transplanting Team (8 Workers)' : 'e.g. Farmtrac 50 Tractor with Rotavator'}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-hidden focus:border-indigo-600 focus:bg-white"
                />
              </div>

              {/* Image Upload Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {formData.category === 'Agricultural Skilled Workforce' ? 'Upload Worker / Team Photo (/uploads/workers/) *' : 'Upload Equipment Image (/uploads/equipment/) *'}
                </label>
                
                <div className="mt-1 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 text-center bg-slate-50/50 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  {imagePreview ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="relative inline-block max-h-36 overflow-hidden rounded-xl">
                        <img src={imagePreview} alt="Preview" className="h-32 w-auto object-cover rounded-xl border border-slate-200 mx-auto" />
                        <span className="text-[10px] bg-indigo-600 text-white font-bold px-2.5 py-0.5 rounded-full absolute top-2 right-2 shadow-xs">
                          {imageFile ? 'New Selected' : 'Current Photo'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Click to Replace Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-1.5 py-2">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-full group-hover:bg-indigo-100 transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">Click to upload raw image file</p>
                      <p className="text-[10px] text-slate-400">Routes to /uploads/{formData.category === 'Agricultural Skilled Workforce' ? 'workers' : 'equipment'}/</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Workforce Specific Fields */}
              {formData.category === 'Agricultural Skilled Workforce' ? (
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Workforce Type *
                      </label>
                      <select
                        value={formData.workforceType}
                        onChange={(e) => {
                          const type = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            workforceType: type,
                            workerCount: type === 'Individual Worker' ? 1 : Math.max(2, prev.workerCount)
                          }));
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                      >
                        <option value="Individual Worker">Individual Worker</option>
                        <option value="Workgroup Team">Workgroup Team</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Crew Size (Worker Count) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        disabled={formData.workforceType === 'Individual Worker'}
                        value={formData.workforceType === 'Individual Worker' ? 1 : formData.workerCount}
                        onChange={(e) => setFormData((prev) => ({ ...prev, workerCount: Math.max(1, Number(e.target.value)) }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gender Composition *
                    </label>
                    <select
                      value={formData.workforceGenderComposition}
                      onChange={(e) => setFormData({ ...formData, workforceGenderComposition: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    >
                      <option value="Mixed Group">Mixed Group (Male & Female)</option>
                      <option value="Female Workers">Female Workers Only</option>
                      <option value="Male Workers">Male Workers Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Specialized Agriculture Tasks
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SPECIALIZED_TASKS_OPTIONS.map((task) => {
                        const isSelected = formData.specializedTasks.includes(task);
                        return (
                          <button
                            type="button"
                            key={task}
                            onClick={() => toggleSpecializedTask(task)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center space-x-1 ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                            <span>{task}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Task Type & Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pricing Unit *
                  </label>
                  <select
                    value={formData.pricingUnit}
                    onChange={(e) => setFormData({ ...formData, pricingUnit: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-hidden focus:border-indigo-600"
                  >
                    {formData.category === 'Agricultural Skilled Workforce' ? (
                      <>
                        <option value="per_worker_day">Per Worker / Day (₹/worker/day)</option>
                        <option value="per_group_acre">Per Team / Acre (₹/team/acre)</option>
                        <option value="per_day">Per Day Total (₹/day)</option>
                      </>
                    ) : (
                      <>
                        <option value="per_hour">Per Hour (₹/hr)</option>
                        <option value="per_acre">Per Acre (₹/acre)</option>
                        <option value="per_day">Per Day (₹/day)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Rate in Rupees (₹) *
                    </label>
                    <button
                      type="button"
                      onClick={handlePredictPrice}
                      disabled={predictingPrice}
                      className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-lg border border-indigo-200 flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{predictingPrice ? 'Calculating...' : '🤖 AI Recommend Price'}</span>
                    </button>
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1200"
                    value={formData.priceInRupees}
                    onChange={(e) => setFormData({ ...formData, priceInRupees: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-indigo-900 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* AI/ML Predictive Pricing Assistant Widget */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-4 rounded-2xl text-white space-y-3 shadow-md border border-indigo-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-xs font-extrabold tracking-tight">AI Predictive Pricing Engine</span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePredictPrice}
                    disabled={predictingPrice}
                    className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-3 py-1 rounded-xl text-[11px] shadow-xs flex items-center space-x-1"
                  >
                    <span>{predictingPrice ? 'Calculating ML...' : '🤖 Predict Optimal Rate'}</span>
                  </button>
                </div>

                {aiPrediction ? (
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-xl space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider">AI Target Recommended Rate</p>
                        <p className="text-2xl font-black text-amber-300">₹{aiPrediction.predictedPrice} <span className="text-xs font-normal text-indigo-200">/ {aiPrediction.unit}</span></p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          ✓ {aiPrediction.confidenceScore} ML Accuracy
                        </span>
                        <p className="text-[10px] text-emerald-300 font-bold mt-1">{aiPrediction.demandLevel}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-indigo-200 font-medium">Fair Market Range: <strong>₹{aiPrediction.minPrice} - ₹{aiPrediction.maxPrice}</strong></span>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, priceInRupees: aiPrediction.predictedPrice }))}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1 rounded-xl text-[11px] shadow-xs active:scale-95 transition-all"
                      >
                        Apply AI Rate (₹{aiPrediction.predictedPrice}) ✓
                      </button>
                    </div>

                    {aiPrediction.insights?.recommendationNote && (
                      <p className="text-[10px] text-slate-300 italic pt-1 border-t border-white/10">
                        "{aiPrediction.insights.recommendationNote}"
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-indigo-200/90 font-medium">
                    Click <strong>"Predict Optimal Rate"</strong> to let our AI Model calculate real-time regional rates based on {formData.district || 'district'} market demand and current agricultural season.
                  </p>
                )}
              </div>

              {/* Service Location & Live GPS Section */}
              <div className="bg-indigo-50/70 border border-indigo-200/80 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>Listing Service Location (Used for Distance Recommendations) *</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectListingLocation}
                    className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs transition-colors cursor-pointer"
                    title="Capture Current GPS Coordinates for this Listing"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Use Current GPS</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">State *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => {
                        const st = e.target.value;
                        const dists = STATES_AND_DISTRICTS[st] || [];
                        setFormData((prev) => ({
                          ...prev,
                          state: st,
                          district: dists[0] || prev.district
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      {Object.keys(STATES_AND_DISTRICTS).map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">District *</label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      {(STATES_AND_DISTRICTS[formData.state] || []).map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Village / Locality</label>
                  <input
                    type="text"
                    placeholder="e.g. Tenali Field Sector"
                    value={formData.village}
                    onChange={(e) => setFormData((prev) => ({ ...prev, village: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                {formData.latitude && formData.longitude && (
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200/60">
                    <Compass className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>GPS Captured: ({Number(formData.latitude).toFixed(4)}° N, {Number(formData.longitude).toFixed(4)}° E)</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Features
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe machinery condition, worker experience, tools included, or team availability..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : editingServiceId ? 'Save Changes & Replace Image' : 'Publish Listing'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
