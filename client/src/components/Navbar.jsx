import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { APP_CONFIG } from '../config/appName';
import { STATES_AND_DISTRICTS } from '../data/districts';
import { useAuth } from '../context/AuthContext';
import { 
  Tractor, 
  MapPin, 
  Bot, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu,
  Bell,
  ClipboardList,
  Navigation,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const Navbar = ({ onToggleSidebar }) => {
  const { 
    user, 
    logout, 
    selectedState, 
    setSelectedState, 
    selectedDistrict, 
    setSelectedDistrict,
    detectLiveLocation,
    detectingLocation
  } = useAuth();
  const navigate = useNavigate();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const { unreadCount, enablePush, pushEnabled, markAllRead } = useNotifications();
  const [sunlight, setSunlight] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('sunlight-mode')
      || localStorage.getItem('agrirenta_sunlight') === '1';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('sunlight-mode', sunlight);
    localStorage.setItem('agrirenta_sunlight', sunlight ? '1' : '0');
  }, [sunlight]);

  // Fetch pending requests badge count for provider with automated background polling
  useEffect(() => {
    if (user && user.role === 'provider') {
      const fetchPendingCount = async () => {
        if (typeof document !== 'undefined' && document.hidden) return;
        try {
          const res = await axios.get('/api/bookings/provider-requests');
          if (res.data.success) {
            setPendingRequestsCount(res.data.pendingCount || 0);
          }
        } catch {
          // Silent catch when backend is restarting or offline
        }
      };

      fetchPendingCount();
      const interval = setInterval(fetchPendingCount, 8000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    const districts = STATES_AND_DISTRICTS[newState] || [];
    if (districts.length > 0) {
      setSelectedDistrict(districts[0]);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo & Sidebar Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-hidden lg:hidden"
              title="Toggle Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="bg-indigo-600 text-white p-2.5 rounded-2xl group-hover:bg-indigo-700 transition-colors shadow-sm">
                <Tractor className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight leading-none">
                  {APP_CONFIG.primaryName}
                </span>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                  {APP_CONFIG.tagline}
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Location Selector */}
          <div className="hidden md:flex items-center space-x-3">

            {/* State & District Selectors with GPS Auto-Detect Button */}
            <div className="flex items-center bg-slate-100/80 border border-slate-200 rounded-xl px-2.5 py-1.5 space-x-2 shadow-2xs">
              <button
                onClick={detectLiveLocation}
                disabled={detectingLocation}
                className="p-1 hover:bg-white rounded-lg transition-colors text-indigo-600 focus:outline-hidden"
                title="Detect My Live GPS Location (Reverse Geocode State & District)"
              >
                <Navigation className={`w-3.5 h-3.5 ${detectingLocation ? 'animate-spin' : ''}`} />
              </button>
              <select
                value={selectedState}
                onChange={handleStateChange}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                {Object.keys(STATES_AND_DISTRICTS).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <span className="text-slate-300">|</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer max-w-[130px]"
              >
                {(STATES_AND_DISTRICTS[selectedState] || []).map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Auth Profile / Notification Badges / Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setSunlight((v) => !v)}
                  className="touch-action min-w-12 px-2 rounded-xl text-slate-700 hover:bg-amber-50 border border-transparent hover:border-amber-200"
                  title="Sunlight high-contrast field view"
                >
                  {sunlight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!pushEnabled) enablePush();
                    markAllRead();
                  }}
                  className="relative touch-action min-w-12 p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl"
                  title="Alerts"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Provider Live Request Notification Badge */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 shadow-xs border border-amber-400/30"
                    title="Access Admin Escrow Hub"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Admin Escrow Hub</span>
                  </Link>
                )}

                {user.role === 'provider' && (
                  <Link
                    to="/provider/requests"
                    className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Rental Requests"
                  >
                    <ClipboardList className="w-5 h-5" />
                    {pendingRequestsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                        {pendingRequestsCount}
                      </span>
                    )}
                  </Link>
                )}

                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800">{user.name}</span>
                  <span className="text-[10px] capitalize px-2 py-0.5 rounded-full font-bold inline-block bg-indigo-50 text-indigo-700 border border-indigo-200/60 w-fit ml-auto">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="touch-action flex items-center space-x-1 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 px-3 rounded-xl text-xs font-semibold"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
