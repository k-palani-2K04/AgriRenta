import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatRupees } from '../config/appName';
import { 
  Tractor, 
  User, 
  X, 
  CheckCircle, 
  CloudRain, 
  AlertTriangle, 
  ShieldCheck, 
  Wallet, 
  CreditCard, 
  Banknote,
  Sparkles
} from 'lucide-react';

export const BookingModal = ({
  selectedService,
  onClose,
  clientLocation,
  selectedDistrict,
  user,
  onSuccess
}) => {
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
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

  const isWorkforceService = selectedService.category === 'Agricultural Skilled Workforce' || selectedService.category === 'human_labor';

  // Dynamic Weather Guard Check
  useEffect(() => {
    if (selectedService && bookingDate) {
      const checkWeather = async () => {
        try {
          setWeatherAlert(prev => ({ ...prev, loading: true }));
          const res = await axios.get('/api/weather/check', {
            params: {
              lat: clientLocation?.latitude || 16.3067,
              lng: clientLocation?.longitude || 80.4365,
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

  // Reactive Calculations for Work Estimator
  const unitPrice = selectedService.priceInRupees || 0;
  const quantityMultiplier = (selectedService.pricingUnit === 'per_worker_day' && selectedService.workerCount) ? selectedService.workerCount : 1;
  const totalCost = unitPrice * acresOrHours * quantityMultiplier;
  const advanceAmount = Math.round(totalCost * 0.20);
  const remainingBalance = totalCost - advanceAmount;
  const adminCommission = isWorkforceService ? 0 : Math.round(totalCost * 0.05);
  const providerDisbursement = isWorkforceService ? advanceAmount : Math.round(totalCost * 0.15);

  const executeBookingSubmission = async (targetPaymentStatus) => {
    setSubmittingBooking(true);

    const submitWithLocation = async (lat, lng) => {
      try {
        const payload = {
          serviceId: selectedService._id,
          bookingDate: bookingDate,
          startDate: bookingDate,
          quantity: acresOrHours,
          landAreaAcres: selectedService.pricingUnit === 'per_acre' ? acresOrHours : 0,
          durationHours: selectedService.pricingUnit === 'per_hour' ? acresOrHours : 0,
          totalAmountInRupees: totalCost,
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
          if (onSuccess) onSuccess();
          setTimeout(() => {
            setBookingSuccess(false);
            onClose();
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
        (pos) => submitWithLocation(pos.coords.latitude, pos.coords.longitude),
        () => submitWithLocation(clientLocation?.latitude || 16.3067, clientLocation?.longitude || 80.4365),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      submitWithLocation(clientLocation?.latitude || 16.3067, clientLocation?.longitude || 80.4365);
    }
  };

  const handleConfirmBookingDetails = (e) => {
    e.preventDefault();
    if (paymentMethod === 'cod') {
      executeBookingSubmission('pending');
    } else {
      setBookingStep('payment');
    }
  };

  const adminUpiId = '9030585591@ybl';
  const payeeName = 'K PALANI';
  const formattedAdvanceAmount = Number(advanceAmount).toFixed(2);
  const upiNote = `AgriRenta 20% Advance for ${selectedService.title}`;
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(adminUpiId)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAdvanceAmount}&cu=INR&tn=${encodeURIComponent(upiNote)}`;
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiDeepLink)}`;

  const unitLabel = 
    selectedService.pricingUnit === 'per_acre' ? 'Acres' : 
    selectedService.pricingUnit === 'per_hour' ? 'Hours' : 
    selectedService.pricingUnit === 'per_worker_day' ? 'Worker Days' : 
    selectedService.pricingUnit === 'per_group_acre' ? 'Team Acres' : 'Days';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-sky-700 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            {isWorkforceService ? <User className="w-5 h-5 text-amber-300" /> : <Tractor className="w-5 h-5 text-amber-300" />}
            <h3 className="font-bold text-base">Service Booking & Payment Checkout</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
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
                  ? `Your 20% advance payment has been verified. The service provider receives your confirmed rental booking request.`
                  : `Your rental request is sent to the provider with 20% Advance status set to Pending.`}
              </p>
            </div>
          ) : bookingStep === 'payment' ? (
            <div className="p-4 sm:p-5 space-y-3.5">
              
              {/* Gateway Banner */}
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

              {/* Revenue Breakdown */}
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
                    <span className="text-slate-400 font-medium block">Admin Commission ({isWorkforceService ? '0%' : '5%'}):</span>
                    <span className="font-bold text-indigo-700">{formatRupees(adminCommission)} {isWorkforceService ? '(0% Fee)' : ''}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-xl border border-indigo-100">
                    <span className="text-slate-400 font-medium block">Worker Payout ({isWorkforceService ? '100% Advance' : '15% Escrow'}):</span>
                    <span className="font-bold text-emerald-700">{formatRupees(providerDisbursement)}</span>
                  </div>
                </div>

                {isWorkforceService && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] p-2 rounded-xl flex items-center space-x-1.5 font-bold mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>0% Platform Fee Policy: 100% of your advance goes directly to the agricultural workforce.</span>
                  </div>
                )}
              </div>

              {/* Advance Banner */}
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

              {/* Dynamic QR Display */}
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

                <a
                  href={upiDeepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 px-4 rounded-2xl text-xs shadow-xs transition-all w-full mt-1"
                >
                  <Wallet className="w-4 h-4 text-amber-300" />
                  <span>Pay ₹{advanceAmount} via GPay / PhonePe / Paytm App 📱</span>
                </a>
              </div>

              {/* UTR Input */}
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

              {/* Actions */}
              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  disabled={submittingBooking}
                  onClick={() => executeBookingSubmission('advance_paid')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-2xl text-xs shadow-xs disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{submittingBooking ? 'Verifying Payment...' : `I Have Paid 20% Advance (${formatRupees(advanceAmount)})`}</span>
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
          ) : (
            <form onSubmit={handleConfirmBookingDetails} className="p-4 sm:p-5 space-y-4">
              
              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    isWorkforceService ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {isWorkforceService ? '👨‍🌾 Agricultural Skilled Workforce (0% Fee)' : '🚜 Machinery & Farm Equipment'}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    ₹{selectedService.priceInRupees} / {selectedService.pricingUnit === 'per_acre' ? 'acre' : selectedService.pricingUnit === 'per_hour' ? 'hr' : 'day'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{selectedService.title}</h4>
                <p className="text-xs text-slate-500">
                  Provider Location: <strong>{selectedService.village || selectedService.providerId?.village}, {selectedService.district || selectedService.providerId?.district}</strong> ({selectedService.distanceKm || 0} km away)
                </p>
              </div>

              {/* Date Selection & Weather Guard */}
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

                {weatherAlert.loading ? (
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-700 flex items-center space-x-2 animate-pulse">
                    <CloudRain className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Weather Guard: Fetching live forecast for selected date...</span>
                  </div>
                ) : weatherAlert.hasAlert ? (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 space-y-1">
                    <div className="flex items-center space-x-1.5 font-extrabold text-amber-700">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Weather Guard: Extreme Weather Forecasted!</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800">
                      {weatherAlert.warningMessage || `High wind speeds (${weatherAlert.windSpeedKmh} km/h) & condition (${weatherAlert.condition}) predicted. Field operations are not recommended.`}
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Weather Guard: Clear sky forecast ({weatherAlert.condition || 'Favorable Weather'}) for field operations.</span>
                  </div>
                )}
              </div>

              {/* Work Estimator Input (Clean Input Group Addon - NO Text Overlap!) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Estimator (Number of {unitLabel})
                </label>
                <div className="flex rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={acresOrHours}
                    onChange={(e) => setAcresOrHours(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 bg-transparent text-sm font-bold text-slate-900 focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="px-4 py-2.5 text-xs font-extrabold text-slate-600 bg-slate-100 border-l border-slate-200 flex items-center shrink-0">
                    {unitLabel}
                  </span>
                </div>
              </div>

              {/* Pricing & 20% Advance Calculation Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Total Rental Fee:</span>
                  <span className="font-bold text-slate-900">{formatRupees(totalCost)}</span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  <span>Required 20% Advance Payable Now:</span>
                  <span className="text-sm font-black text-emerald-800">{formatRupees(advanceAmount)}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                  <span>Remaining Balance Payable at Field:</span>
                  <span className="font-bold text-slate-700">{formatRupees(remainingBalance)}</span>
                </div>
              </div>

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
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <span>{paymentMethod === 'cod' ? 'Confirm Booking (Cash / Pending)' : `Proceed to Pay 20% Advance (${formatRupees(advanceAmount)}) →`}</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
