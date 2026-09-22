import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG, formatRupees } from '../config/appName';
import { BookingListSkeleton } from '../components/SkeletonCards';
import { JobPhotosPanel } from '../components/JobPhotosPanel';
import { AttendanceTracker } from '../components/AttendanceTracker';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { 
  Tractor, 
  Calendar, 
  CheckCircle, 
  Clock, 
  MapPin, 
  PhoneCall, 
  Navigation, 
  ShieldCheck,
  Trash2,
  History,
  ListFilter,
  CheckSquare,
  AlertCircle,
  RotateCcw,
  IndianRupee
} from 'lucide-react';

export const MyBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [confetti, setConfetti] = useState(false);
  const navigate = useNavigate();

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching farmer bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmJobCompletion = async (bookingId) => {
    try {
      const res = await axios.put(`/api/bookings/${bookingId}/confirm-job`);
      if (res.data.success) {
        setConfetti(true);
        fetchMyBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error confirming job completion.');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking record?')) return;
    try {
      const res = await axios.delete(`/api/bookings/${bookingId}`);
      if (res.data.success) {
        fetchMyBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting booking.');
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">⏰ Pending Provider Confirmation</span>;
      case 'confirmed':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">✅ Confirmed</span>;
      case 'en_route':
        return <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">🚜 Machinery En Route</span>;
      case 'arrived':
        return <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">📍 Arrived at Field</span>;
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">✔️ Job Completed</span>;
      case 'rejected':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">❌ Rejected & 100% Refunded</span>;
      case 'cancelled':
        return <span className="bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">🚫 Cancelled</span>;
      default:
        return null;
    }
  };

  // Filter bookings for tabs
  const activeBookings = bookings.filter(
    (b) => !b.jobCompletedByFarmer && b.status !== 'rejected' && b.status !== 'cancelled'
  );
  
  const historyBookings = bookings.filter(
    (b) => b.jobCompletedByFarmer || b.status === 'rejected' || b.status === 'cancelled'
  );

  const currentDisplayList = activeTab === 'active' ? activeBookings : historyBookings;

  return (
    <div className="space-y-6">
      <ConfettiBurst active={confetti} onDone={() => setConfetti(false)} />
      
      {/* Banner */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-sky-100 border border-white/20">
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            <span>Farmer Rental Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            My Equipment Bookings
          </h1>
          <p className="text-indigo-100 text-sm max-w-xl">
            Track live requests, monitor machinery approach, confirm field work completion, and review historical transactions.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs flex space-x-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'active'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Active Bookings</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {activeBookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Booking History</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {historyBookings.length}
          </span>
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <BookingListSkeleton />
      ) : currentDisplayList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full w-fit mx-auto">
            {activeTab === 'active' ? <Tractor className="w-8 h-8" /> : <History className="w-8 h-8" />}
          </div>
          <h3 className="font-bold text-slate-800 text-base">
            {activeTab === 'active' ? 'No Active Bookings' : 'No Past Booking History'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'active'
              ? 'Explore local tractors and farm equipment in the marketplace to place your next rental request.'
              : 'Completed and refunded booking records will appear here after field work finish or request cancellations.'}
          </p>
          {activeTab === 'active' && (
            <button
              onClick={() => navigate('/rentals')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-sm transition-all"
            >
              Browse Marketplace
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentDisplayList.map((b) => {
            const provider = b.providerId;
            const service = b.serviceId;
            const totalVal = b.totalAmountInRupees || b.totalAmount || 0;
            const advancePaid = b.advancePaidInRupees || Math.round(totalVal * 0.20);
            const adminComm = b.adminCommissionInRupees || Math.round(totalVal * 0.05);
            const providerDisbursement = b.providerPayoutAmountInRupees || Math.round(totalVal * 0.15);

            return (
              <div
                key={b._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-xs">
                      <Tractor className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{service?.title || 'Equipment Rental'}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Category: <span className="font-semibold text-slate-800 capitalize">{service?.category || 'Machinery'}</span> • Task: <span className="font-semibold text-slate-800 capitalize">{service?.taskType || 'Ploughing'}</span> • Date: <span className="font-semibold text-slate-800">{new Date(b.startDate || b.bookingDate).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusBadge(b.status)}
                    <button
                      onClick={() => handleDeleteBooking(b._id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete booking record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Provider Info */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Service Provider & Contact</p>
                    <p className="font-bold text-slate-800 text-sm">{provider?.name || 'Equipment Owner'}</p>
                    <div className="flex items-center text-slate-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 mr-1 shrink-0" />
                      <span>{b.providerLocation?.village || provider?.village || 'Village'}, {b.providerLocation?.district || provider?.district || 'District'}</span>
                    </div>
                    <a
                      href={`tel:${provider?.phone || '9876543211'}`}
                      className="inline-flex items-center space-x-1.5 text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call {provider?.phone || '9876543211'}</span>
                    </a>
                  </div>

                  {/* Financial Breakdown & Google Maps */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Financial Breakdown</p>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                          {b.paymentMethod ? b.paymentMethod.toUpperCase() : 'UPI QR'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-500 font-semibold">Total Service Fee:</span>
                        <span className="text-lg font-black text-indigo-700">{formatRupees(totalVal)}</span>
                      </div>

                      <div className="text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center justify-between">
                        <span>✓ 20% Advance Paid (Admin UPI):</span>
                        <span>{formatRupees(advancePaid)}</span>
                      </div>

                      {activeTab === 'history' && b.status === 'completed' && (
                        <div className="bg-slate-100 p-2 rounded-xl text-[10px] text-slate-600 space-y-0.5 border border-slate-200/60">
                          <div className="flex justify-between">
                            <span>Admin Commission (5%):</span>
                            <span className="font-semibold">{formatRupees(adminComm)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>Provider Disbursement (15%):</span>
                            <span>{formatRupees(providerDisbursement)}</span>
                          </div>
                        </div>
                      )}

                      {(b.status === 'rejected' || b.status === 'cancelled' || b.escrowStatus === 'refunded') && (
                        <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-[11px] text-rose-900 space-y-1">
                          <div className="flex items-center gap-1 font-extrabold text-rose-700">
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>100% Full Advance Refunded</span>
                          </div>
                          <p className="text-[10px] text-rose-800">
                            Refund Amount: <strong>{formatRupees(b.refundAmountInRupees || advancePaid)}</strong><br />
                            Ref: <code className="bg-white/80 px-1 py-0.5 rounded text-[9px] font-mono">{b.refundTransactionId || 'REFUND_UPI_AUTO'}</code>
                          </p>
                        </div>
                      )}
                    </div>

                    {b.status !== 'rejected' && b.status !== 'cancelled' && (
                      <a
                        href={b.gmapUrl || `https://www.google.com/maps/dir/?api=1&origin=${b.providerLocation?.latitude || 16.3400},${b.providerLocation?.longitude || 80.4600}&destination=${b.farmerLocation?.latitude || 16.3067},${b.farmerLocation?.longitude || 80.4365}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="touch-action bg-[#0F8A43] hover:bg-[#0c7337] text-white font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1 shadow-xs w-full mt-2"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate via Google Maps 🧭</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Job Completion Action Banner for Service Seeker */}
                {b.status !== 'rejected' && b.status !== 'cancelled' && (
                  <div>
                    {b.jobCompletedByFarmer ? (
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-800 flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>✓ Job Completion Confirmed by Seeker</span>
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600">
                          {b.paymentStatus === 'completed' ? 'Status: Completed' : 'Pending Admin Release'}
                        </span>
                      </div>
                    ) : b.status === 'pending' ? (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-800 flex items-center justify-between">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Waiting for service provider to accept booking request...</span>
                        </span>
                      </div>
                    ) : (
                      <div className="bg-amber-50/90 border border-amber-300 p-3.5 rounded-2xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-amber-900 flex items-center gap-1">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Confirm Service Completion</span>
                          </p>
                          <p className="text-[11px] text-amber-800">
                            Has the service provider or skilled workforce finished your field work? Click to mark completed. This unlocks Admin disbursement (15%) to provider.
                          </p>
                        </div>
                        <button
                          onClick={() => handleConfirmJobCompletion(b._id)}
                          className="touch-action bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-4 rounded-xl text-xs shadow-xs shrink-0 flex items-center justify-center space-x-1"
                        >
                          <CheckSquare className="w-4 h-4" />
                          <span>Mark as Completed ✓</span>
                        </button>
                      </div>
                    )}
                    <div className="space-y-3 mt-3">
                      <JobPhotosPanel
                        booking={b}
                        onUpdated={(updated) => {
                          setBookings((prev) => prev.map((x) => (x._id === updated._id ? { ...x, ...updated } : x)));
                        }}
                      />
                      <AttendanceTracker
                        booking={b}
                        onUpdated={(updated) => {
                          setBookings((prev) => prev.map((x) => (x._id === updated._id ? { ...x, ...updated } : x)));
                        }}
                      />
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
