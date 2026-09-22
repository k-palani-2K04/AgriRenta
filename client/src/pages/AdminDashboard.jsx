import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatRupees } from '../config/appName';
import { 
  ShieldCheck, 
  Wallet, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  UserCheck, 
  Tractor, 
  Search, 
  Copy, 
  ArrowUpRight,
  Send,
  X,
  Trash2
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEscrowCollected: 0,
    totalReleasedPayouts: 0,
    totalPendingPayouts: 0,
    totalBookings: 0,
    totalServices: 0,
    totalProviders: 0,
    totalFarmers: 0
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Payout Release Modal State
  const [selectedBookingForPayout, setSelectedBookingForPayout] = useState(null);
  const [payoutTxnRef, setPayoutTxnRef] = useState('');
  const [releasingPayout, setReleasingPayout] = useState(false);
  const [instantPayoutId, setInstantPayoutId] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, bookingsRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/bookings')
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }
      if (bookingsRes.data?.success) {
        setBookings(bookingsRes.data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.response?.data?.message || 'Failed to load Admin Escrow statistics from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleInstantPayout = async (booking) => {
    if (!window.confirm(`Send 1-click UPI payout of ${formatRupees(booking.providerPayoutAmountInRupees || booking.providerPayoutAmount || 0)} to ${booking.providerId?.upiId || '9030585591@ybl'}?`)) {
      return;
    }
    setInstantPayoutId(booking._id);
    try {
      const res = await axios.put(`/api/admin/bookings/${booking._id}/instant-payout`);
      if (res.data.success) {
        alert(res.data.message);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Instant payout failed.');
    } finally {
      setInstantPayoutId(null);
    }
  };

  const handleExecutePayout = async (e) => {
    e.preventDefault();
    if (!selectedBookingForPayout) return;
    setReleasingPayout(true);

    try {
      const res = await axios.put(`/api/admin/bookings/${selectedBookingForPayout._id}/release-payout`, {
        payoutTransactionId: payoutTxnRef || `PAYOUT_UPI_${Date.now()}`
      });

      if (res.data.success) {
        alert('Payout successfully marked as Released to Service Provider!');
        setSelectedBookingForPayout(null);
        setPayoutTxnRef('');
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to release payout.');
    } finally {
      setReleasingPayout(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking record?')) return;
    try {
      const res = await axios.delete(`/api/admin/bookings/${bookingId}`);
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete booking');
    }
  };

  const handleClearAllBookings = async () => {
    if (!window.confirm('Are you sure you want to clear ALL booking records from the database?')) return;
    try {
      const res = await axios.delete('/api/admin/clear-bookings');
      if (res.data.success) {
        alert(res.data.message);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear bookings');
    }
  };

  const handleClearAllServices = async () => {
    if (!window.confirm('Are you sure you want to delete ALL service provider listings?')) return;
    try {
      const res = await axios.delete('/api/admin/clear-services');
      if (res.data.success) {
        alert(res.data.message);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear services');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'pending_payout' && b.escrowStatus === 'released_to_provider') return false;
    if (filterStatus === 'released' && b.escrowStatus !== 'released_to_provider') return false;
    if (filterStatus === 'confirmed_by_farmer' && !b.jobCompletedByFarmer) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const sTitle = b.serviceId?.title?.toLowerCase() || '';
      const pName = b.providerId?.name?.toLowerCase() || '';
      const fName = b.farmerId?.name?.toLowerCase() || '';
      const pUpi = b.providerId?.upiId?.toLowerCase() || '';
      return sTitle.includes(q) || pName.includes(q) || fName.includes(q) || pUpi.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-sky-200 border border-white/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Platform Owner & Admin Escrow Hub</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Admin Escrow & Provider Payout Dashboard
              </h1>
              <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
                20% Advance payments collected via Admin UPI (<span className="font-mono text-amber-300 font-bold">9030585591@ybl</span>) are held until service seekers confirm job completion.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                onClick={fetchAdminData}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2 rounded-2xl text-xs shadow-sm"
              >
                Refresh 🔄
              </button>

              <button
                onClick={handleClearAllBookings}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-2 rounded-2xl text-xs shadow-sm flex items-center gap-1"
                title="Delete all booking records from database"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Bookings</span>
              </button>

              <button
                onClick={handleClearAllServices}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 rounded-2xl text-xs shadow-sm flex items-center gap-1"
                title="Delete all provider service listings from database"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Provider Listings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-3xl flex items-center justify-between text-xs font-semibold shadow-xs">
          <span>⚠️ {error}</span>
          <button
            onClick={fetchAdminData}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Admin Escrow Collected (20%) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Total Advance (20%)</span>
            <div className="bg-indigo-100 text-indigo-700 p-2 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900">{formatRupees(stats.totalEscrowCollected || 0)}</p>
          <p className="text-[10px] text-slate-400 font-medium">Collected via Admin UPI</p>
        </div>

        {/* Admin Platform Commission (5%) */}
        <div className="bg-white rounded-3xl border border-indigo-200 p-5 shadow-2xs space-y-2 bg-gradient-to-br from-indigo-50/40 to-sky-50/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-900">Admin Commission (5%)</span>
            <div className="bg-indigo-600 text-white p-2 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-indigo-700">{formatRupees(stats.totalAdminCommission || Math.round((stats.totalEscrowCollected || 0) * 0.25))}</p>
          <p className="text-[10px] text-indigo-600/80 font-bold">Retained Revenue (25% of Advance)</p>
        </div>

        {/* Released Payouts (15%) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Released Payouts (15%)</span>
            <div className="bg-emerald-100 text-emerald-700 p-2 rounded-xl">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-700">{formatRupees(stats.totalReleasedPayouts || 0)}</p>
          <p className="text-[10px] text-slate-400 font-medium">Disbursed to Providers</p>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Pending Disbursement</span>
            <div className="bg-amber-100 text-amber-700 p-2 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-amber-600">{formatRupees(stats.totalPendingPayouts || 0)}</p>
          <p className="text-[10px] text-slate-400 font-medium">Held for Provider Release</p>
        </div>

        {/* Platform Ecosystem */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Platform Scale</span>
            <div className="bg-sky-100 text-sky-700 p-2 rounded-xl">
              <Tractor className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900">{stats.totalBookings || 0} <span className="text-xs font-semibold text-slate-500">Bookings</span></p>
          <p className="text-[10px] text-slate-400 font-medium">{stats.totalProviders || 0} Providers • {stats.totalServices || 0} Services</p>
        </div>

      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search provider, farmer, or UPI handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-hidden focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Services ({bookings.length})
            </button>

            <button
              onClick={() => setFilterStatus('confirmed_by_farmer')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === 'confirmed_by_farmer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Confirmed by Farmer ✓
            </button>

            <button
              onClick={() => setFilterStatus('pending_payout')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === 'pending_payout'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Held in Escrow ⏳
            </button>

            <button
              onClick={() => setFilterStatus('released')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === 'released'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Payout Released
            </button>
          </div>
        </div>
      </div>

      {/* Bookings & Provider Payout Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Loading platform service states...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-2">
          <Tractor className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Matching Services Found</h3>
          <p className="text-xs text-slate-500">Adjust filters or search parameters to view bookings.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider">
                  <th className="p-4">Service & Provider</th>
                  <th className="p-4">Service Seeker (Farmer)</th>
                  <th className="p-4">Total Fee & Advance (20%)</th>
                  <th className="p-4">Farmer Completion Status</th>
                  <th className="p-4">Payout Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredBookings.map((b) => {
                  const provider = b.providerId;
                  const farmer = b.farmerId;
                  const service = b.serviceId;
                  const providerUpi = provider?.upiId || (provider?.phone ? `${provider.phone}@upi` : 'provider@upi');
                  const advance = b.advancePaidInRupees || Math.round((b.totalAmountInRupees || b.totalAmount || 0) * 0.20);
                  const isReleased = b.escrowStatus === 'released_to_provider';

                  return (
                    <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Service & Provider Info */}
                      <td className="p-4 space-y-1">
                        <p className="font-bold text-slate-900 text-sm">{service?.title || 'Equipment Rental'}</p>
                        <p className="text-[11px] text-slate-500">
                          Provider: <strong>{provider?.name || 'Provider'}</strong> ({provider?.phone || '9876543211'})
                        </p>
                        <div className="flex items-center space-x-1 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md w-fit text-[10px] font-mono font-bold text-indigo-700">
                          <span>UPI: {providerUpi}</span>
                        </div>
                      </td>

                      {/* Farmer Info */}
                      <td className="p-4 space-y-0.5">
                        <p className="font-bold text-slate-800">{farmer?.name || 'Farmer'}</p>
                        <p className="text-[11px] text-slate-500">{farmer?.village || b.farmerLocation?.village}, {farmer?.district || b.farmerLocation?.district}</p>
                        <p className="text-[10px] text-slate-400">{farmer?.phone || '9876543210'}</p>
                      </td>

                      {/* Fee Breakdown */}
                      <td className="p-4 space-y-1">
                        <p className="font-extrabold text-slate-900">{formatRupees(b.totalAmountInRupees || b.totalAmount)}</p>
                        <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold px-2 py-0.5 rounded-lg text-[10px]">
                          Advance Held: {formatRupees(advance)}
                        </span>
                      </td>

                      {/* Farmer Confirmation Status */}
                      <td className="p-4">
                        {b.jobCompletedByFarmer ? (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Confirmed Completed</span>
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending Confirmation</span>
                          </span>
                        )}
                      </td>

                      {/* Payout Status */}
                      <td className="p-4">
                        {isReleased ? (
                          <div className="space-y-0.5">
                            <span className="bg-sky-100 text-sky-800 border border-sky-300 font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                              <span>Payout Released</span>
                            </span>
                            {b.payoutReleaseDate && (
                              <p className="text-[10px] text-slate-400">{new Date(b.payoutReleaseDate).toLocaleDateString()}</p>
                            )}
                          </div>
                        ) : (
                          <span className="bg-slate-100 text-slate-700 border border-slate-300 font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 text-[11px]">
                            <Wallet className="w-3.5 h-3.5 text-slate-500" />
                            <span>Held in Admin Account</span>
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {isReleased ? (
                            <span className="text-[11px] font-bold text-slate-400 italic">Payout Complete</span>
                          ) : (
                            <div className="flex flex-col items-end gap-2">
                              <button
                                onClick={() => handleInstantPayout(b)}
                                disabled={instantPayoutId === b._id}
                                className="touch-action px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs flex items-center space-x-1 disabled:opacity-50"
                              >
                                <Wallet className="w-3.5 h-3.5" />
                                <span>{instantPayoutId === b._id ? 'Sending UPI...' : '1-Click Instant UPI Payout'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBookingForPayout(b);
                                  setPayoutTxnRef(`PAYOUT_${Date.now().toString().slice(-6)}`);
                                }}
                                className={`touch-action px-3 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1 ${
                                  b.jobCompletedByFarmer
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                                }`}
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Release Payout</span>
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => handleDeleteBooking(b._id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete booking record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Payout Release Modal */}
      {selectedBookingForPayout && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-800 to-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Release Provider Payout via UPI</h3>
              </div>
              <button
                onClick={() => setSelectedBookingForPayout(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleExecutePayout} className="p-6 space-y-4">
              
              {/* Summary */}
              {(() => {
                const tot = selectedBookingForPayout.totalAmountInRupees || selectedBookingForPayout.totalAmount || 0;
                const adv = selectedBookingForPayout.advancePaidInRupees || Math.round(tot * 0.20);
                const comm = selectedBookingForPayout.adminCommissionInRupees || Math.round(tot * 0.05);
                const provPayout = selectedBookingForPayout.providerPayoutAmountInRupees || selectedBookingForPayout.providerPayoutAmount || Math.round(tot * 0.15);
                const pUpi = selectedBookingForPayout.providerId?.upiId || (selectedBookingForPayout.providerId?.phone ? `${selectedBookingForPayout.providerId.phone}@upi` : 'provider@upi');
                const formattedPayout = Number(provPayout).toFixed(2);
                const pLink = `upi://pay?pa=${encodeURIComponent(pUpi)}&pn=${encodeURIComponent(selectedBookingForPayout.providerId?.name || 'Provider')}&am=${formattedPayout}&cu=INR&tn=${encodeURIComponent('AgriRenta Provider Payout 15%')}`;
                const pQr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pLink)}`;

                return (
                  <>
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-600">Equipment Provider:</span>
                        <span className="font-black text-slate-900">{selectedBookingForPayout.providerId?.name || 'Provider'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-600">Registered Provider UPI VPA:</span>
                        <span className="font-mono font-black text-indigo-700">{pUpi}</span>
                      </div>
                      <div className="pt-2 border-t border-indigo-200/60 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Total Booking Cost:</span>
                          <span className="font-bold text-slate-800">{formatRupees(tot)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Collected Advance (20%):</span>
                          <span className="font-bold text-slate-800">{formatRupees(adv)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-indigo-600 font-bold">Admin Platform Commission (5%):</span>
                          <span className="font-bold text-indigo-700">{formatRupees(comm)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-indigo-200/60 font-bold text-emerald-800">
                          <span>Provider Disbursement Payout (15%):</span>
                          <span className="font-black text-emerald-700 text-base">{formatRupees(provPayout)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Provider QR Code Preview with Pre-filled 15% Amount */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center space-y-2">
                      <img src={pQr} alt="Provider Payout QR" className="w-32 h-32 mx-auto object-contain bg-white p-2 rounded-xl border border-slate-200" />
                      <p className="text-[10px] text-emerald-700 font-bold">✓ Pre-filled with ₹{provPayout} (15% Disbursement)</p>
                      <a
                        href={pLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:underline"
                      >
                        <span>Pay ₹{provPayout} to Provider UPI ({pUpi}) 📲</span>
                      </a>
                    </div>
                  </>
                );
              })()}

              {/* Reference Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payout UTR / Transaction Reference ID
                </label>
                <input
                  type="text"
                  required
                  value={payoutTxnRef}
                  onChange={(e) => setPayoutTxnRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForPayout(null)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={releasingPayout}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {releasingPayout ? 'Updating Payout...' : 'Confirm Payout Released ✓'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
