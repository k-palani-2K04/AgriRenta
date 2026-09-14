import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appName';
import { STATES_AND_DISTRICTS } from '../data/districts';
import { 
  Tractor, 
  UserPlus, 
  Phone, 
  Lock, 
  User, 
  MapPin, 
  Home, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Wallet,
  ShieldCheck
} from 'lucide-react';

export const Register = () => {
  const [role, setRole] = useState('farmer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [upiId, setUpiId] = useState('');
  const [state, setState] = useState('Andhra Pradesh');
  const [district, setDistrict] = useState(STATES_AND_DISTRICTS['Andhra Pradesh'][0]);
  const [village, setVillage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setState(selectedState);
    const districts = STATES_AND_DISTRICTS[selectedState] || [];
    if (districts.length > 0) {
      setDistrict(districts[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register({
        name,
        phone,
        password,
        role,
        upiId: upiId || (phone ? `${phone}@upi` : ''),
        state,
        district,
        village
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-lg">
        
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden backdrop-blur-sm">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-700 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
              <Tractor className="w-48 h-48 text-white" />
            </div>

            <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium text-sky-100 border border-white/20 mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Create Account</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Join {APP_CONFIG.primaryName}</h2>
            <p className="text-indigo-100 text-xs mt-1 max-w-xs mx-auto">
              Smart agricultural equipment rentals & market intelligence
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Role Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('farmer')}
                    className={`p-3.5 rounded-2xl border-2 text-xs font-bold flex flex-col items-center space-y-1 transition-all ${
                      role === 'farmer'
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Farmer</span>
                      {role === 'farmer' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <span className="text-[10px] font-normal text-slate-500">Rent tools & services</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('provider')}
                    className={`p-3.5 rounded-2xl border-2 text-xs font-bold flex flex-col items-center space-y-1 transition-all ${
                      role === 'provider'
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Equipment Provider</span>
                      {role === 'provider' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <span className="text-[10px] font-normal text-slate-500">List machinery for rent</span>
                  </button>
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-3 focus:ring-indigo-100 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Phone & Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-3 focus:ring-indigo-100 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-3 focus:ring-indigo-100 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Provider UPI User Handle Input (For Provider Account Creation) */}
              {role === 'provider' && (
                <div className="bg-indigo-50/70 border border-indigo-200 p-3.5 rounded-2xl space-y-1">
                  <label className="block text-xs font-extrabold text-indigo-900 flex items-center space-x-1.5">
                    <Wallet className="w-4 h-4 text-indigo-600" />
                    <span>UPI Handle / VPA (To Receive 20% Advance Payments)</span>
                  </label>
                  <div className="relative pt-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543211@ybl, provider@okaxis, or name@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-indigo-200 rounded-2xl text-xs font-mono font-bold text-indigo-900 focus:outline-hidden focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-indigo-700 font-medium pt-0.5">
                    Whenever farmers book your equipment, a QR code for this UPI ID will be generated to pay your 20% advance directly.
                  </p>
                </div>
              )}

              {/* State & District Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State
                  </label>
                  <select
                    value={state}
                    onChange={handleStateChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-3 focus:ring-indigo-100 transition-all font-medium"
                  >
                    {Object.keys(STATES_AND_DISTRICTS).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-3 focus:ring-indigo-100 transition-all font-medium"
                  >
                    {(STATES_AND_DISTRICTS[state] || []).map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Village */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Village / Locality
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Home className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter village name"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-3 focus:ring-indigo-100 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3.5 px-4 rounded-2xl text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
              >
                {submitting ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Complete Registration</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                Sign in here
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
