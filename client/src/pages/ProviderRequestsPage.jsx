import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG, formatRupees } from '../config/appName';
import { JobPhotosPanel } from '../components/JobPhotosPanel';
import { AttendanceTracker } from '../components/AttendanceTracker';
import { BookingListSkeleton } from '../components/SkeletonCards';
import { 
  Tractor, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  PhoneCall, 
  Navigation, 
  ShieldCheck, 
  AlertCircle,
  ChevronRight,
  Trash2
} from 'lucide-react';

export const ProviderRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/bookings/provider-requests');
      if (res.data.success) {
        setRequests(res.data.bookings || []);
        setPendingCount(res.data.pendingCount || 0);
      }
    } catch (err) {
      console.error('Error fetching provider rental requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      let provLocation = user?.location || { latitude: 16.3400, longitude: 80.4600 };

      // Capture exact high-accuracy browser GPS location if accepting request
      if (navigator.geolocation && (newStatus === 'confirmed' || newStatus === 'en_route')) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            provLocation = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              district: user?.district || 'Guntur',
              village: user?.village || 'Tenali Yard'
            };
            await axios.put(`/api/bookings/${bookingId}/status`, {
              status: newStatus,
              providerLocation: provLocation
            });
            fetchRequests();
          },
          async (err) => {
            await axios.put(`/api/bookings/${bookingId}/status`, {
              status: newStatus,
              providerLocation: provLocation
            });
            fetchRequests();
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      } else {
        await axios.put(`/api/bookings/${bookingId}/status`, {
          status: newStatus,
          providerLocation: provLocation
        });
        fetchRequests();
      }
    } catch (err) {
      alert('Failed to update booking status');
    }
  };

  const handleDeleteRequest = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking request?')) return;
    try {
      const res = await axios.delete(`/api/bookings/${bookingId}`);
      if (res.data.success) {
        fetchRequests();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete request.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">⏰ Pending Response</span>;
      case 'confirmed':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">✅ Confirmed</span>;
      case 'en_route':
        return <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">🚜 Machinery En Route</span>;
      case 'arrived':
        return <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">📍 Arrived at Field</span>;
      case 'completed':
        return <span className="bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">✔️ Job Completed</span>;
      case 'rejected':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">❌ Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-sky-100 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Rental Requests Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Incoming Rental Bookings
            </h1>
            <p className="text-indigo-100 text-sm max-w-xl">
              Accept farmer rental requests, update machinery dispatch status, and launch live GPS field tracking.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center space-x-3 min-w-[200px]">
            <div className="bg-amber-400 text-amber-950 font-black text-xl w-10 h-10 rounded-xl flex items-center justify-center">
              {pendingCount}
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-100">Pending Requests</p>
              <p className="text-xs text-amber-200 font-bold">Action Needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <BookingListSkeleton />
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full w-fit mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Rental Requests Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When farmers request your machinery or labor team from the marketplace, they will show up here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((b) => {
            const farmer = b.farmerId;
            const service = b.serviceId;

            return (
              <div
                key={b._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-xs">
                      <Tractor className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{service?.title || 'Equipment Rental'}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Task: <span className="font-semibold text-slate-800 capitalize">{service?.taskType}</span> • Start Date: <span className="font-semibold text-slate-800">{new Date(b.startDate).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusBadge(b.status)}
                    <button
                      onClick={() => handleDeleteRequest(b._id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete request record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Farmer Details */}
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Farmer Details</p>
                    <p className="font-bold text-slate-800 text-sm">{farmer?.name || 'Farmer'}</p>
                    <p className="text-slate-500 font-medium">{b.farmerLocation?.village || farmer?.village}, {b.farmerLocation?.district || farmer?.district}</p>
                    <a
                      href={`tel:${farmer?.phone || '9876543210'}`}
                      className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-xs hover:underline pt-1"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call {farmer?.phone || '9876543210'}</span>
                    </a>
                  </div>

                  {/* Quantity & Amount & Net Payout Breakdown */}
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Financial Breakdown</p>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {(service?.category === 'Agricultural Skilled Workforce' || service?.category === 'human_labor')
                          ? '0% Admin Fee'
                          : '15% Net Payout'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 font-medium">Total Cost:</span>
                      <span className="text-base font-black text-indigo-700">{formatRupees(b.totalAmountInRupees || b.totalAmount)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 bg-white p-2 rounded-xl border border-slate-200/60">
                      <span>Provider Net Disbursement:</span>
                      <span className="text-emerald-700 text-xs">{formatRupees(b.providerPayoutAmountInRupees || Math.round((b.totalAmountInRupees || b.totalAmount || 0) * 0.15))}</span>
                    </div>

                    <p className="text-slate-500 font-medium text-[11px]">
                      Scale: <strong>{b.quantity} {b.pricingUnit === 'per_acre' ? 'Acres' : 'Hours'}</strong>
                    </p>
                  </div>
                </div>

                {/* Status Action Buttons & Google Maps Directions Link */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'confirmed')}
                        className="touch-action bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 rounded-xl text-xs shadow-xs"
                      >
                        Accept & Confirm Booking
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'cancelled')}
                        className="touch-action bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200 font-bold px-4 rounded-xl text-xs"
                      >
                        Reject Request
                      </button>
                    </>
                  )}

                  {b.status !== 'pending' && b.status !== 'rejected' && b.status !== 'cancelled' && (
                    <a
                      href={b.gmapUrl || `https://www.google.com/maps/dir/?api=1&origin=${b.providerLocation?.latitude || 16.3400},${b.providerLocation?.longitude || 80.4600}&destination=${b.farmerLocation?.latitude || 16.3067},${b.farmerLocation?.longitude || 80.4365}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="touch-action bg-[#0F8A43] hover:bg-[#0c7337] text-white font-extrabold px-4 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Navigate via Google Maps 🧭</span>
                    </a>
                  )}

                  {b.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'en_route')}
                        className="touch-action bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 rounded-xl text-xs shadow-xs flex items-center space-x-1"
                      >
                        <Tractor className="w-4 h-4" />
                        <span>Dispatch / Start Work</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'completed')}
                        className="touch-action bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 rounded-xl text-xs shadow-xs flex items-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Job Completed</span>
                      </button>
                    </>
                  )}

                  {b.status === 'en_route' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'arrived')}
                        className="touch-action bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 rounded-xl text-xs shadow-xs flex items-center space-x-1"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Mark Arrived at Client Field</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'completed')}
                        className="touch-action bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 rounded-xl text-xs shadow-xs flex items-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Job Completed</span>
                      </button>
                    </>
                  )}

                  {b.status === 'arrived' && (
                    <button
                      onClick={() => handleUpdateStatus(b._id, 'completed')}
                      className="touch-action bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 rounded-xl text-xs shadow-xs flex items-center space-x-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Job Completed</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <JobPhotosPanel
                    booking={b}
                    onUpdated={(updated) => {
                      setRequests((prev) => prev.map((x) => (x._id === updated._id ? { ...x, ...updated } : x)));
                    }}
                  />
                  <AttendanceTracker
                    booking={b}
                    onUpdated={(updated) => {
                      setRequests((prev) => prev.map((x) => (x._id === updated._id ? { ...x, ...updated } : x)));
                    }}
                  />
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
