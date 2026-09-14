import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG, formatRupees } from '../config/appName';
import { 
  Tractor, 
  Bot, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  TrendingUp, 
  PlusCircle, 
  Search,
  Sparkles
} from 'lucide-react';

export const Dashboard = () => {
  const { user, selectedDistrict, selectedState } = useAuth();

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner - Indigo Light Gradient */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
          <Tractor className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-sky-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Welcome to {APP_CONFIG.primaryName}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user ? user.name : 'User'}!
          </h1>

          <p className="text-indigo-100 text-sm max-w-2xl">
            {APP_CONFIG.tagline}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center space-x-1.5 bg-white/20 backdrop-blur-xs px-3.5 py-1.5 rounded-2xl">
              <MapPin className="w-4 h-4 text-sky-200" />
              <span>Location: <strong>{user?.village || 'Locality'}, {selectedDistrict}, {selectedState}</strong></span>
            </div>

            <div className="flex items-center space-x-1.5 bg-white/20 backdrop-blur-xs px-3.5 py-1.5 rounded-2xl capitalize">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Account Type: <strong>{user?.role || 'Guest'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Platform Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <Link
            to="/marketplace"
            className="group bg-white p-5 rounded-3xl border border-slate-200/80 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 transition-all space-y-3"
          >
            <div className="bg-indigo-50 text-indigo-700 p-3 rounded-2xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Rent Machinery</h4>
              <p className="text-xs text-slate-500 mt-1">Explore available tractors and farm equipment in {selectedDistrict}.</p>
            </div>
          </Link>

          <Link
            to="/my-bookings"
            className="group bg-white p-5 rounded-3xl border border-slate-200/80 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 transition-all space-y-3"
          >
            <div className="bg-indigo-50 text-indigo-700 p-3 rounded-2xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Rental Bookings</h4>
              <p className="text-xs text-slate-500 mt-1">Manage active rental requests and schedule bookings.</p>
            </div>
          </Link>

          {user?.role === 'provider' && (
            <Link
              to="/provider/dashboard"
              className="group bg-white p-5 rounded-3xl border border-slate-200/80 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 transition-all space-y-3"
            >
              <div className="bg-indigo-50 text-indigo-700 p-3 rounded-2xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Provider Dashboard</h4>
                <p className="text-xs text-slate-500 mt-1">Post and manage your agricultural machinery for hourly/daily rental.</p>
              </div>
            </Link>
          )}

        </div>
      </div>

    </div>
  );
};
