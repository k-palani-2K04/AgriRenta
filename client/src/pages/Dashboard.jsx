import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appName';
import { 
  Tractor, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  PlusCircle, 
  Search,
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  Navigation
} from 'lucide-react';

export const Dashboard = () => {
  const { user, selectedDistrict, selectedState } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/marketplace');
    }
  };

  const currentLocDisplay = `${selectedDistrict || user?.district || 'Guntur'}, ${selectedState || user?.state || 'AP'}`;

  return (
    <div className="space-y-8">
      
      {/* CropHelix Hero Card Section (Matching Image 1) */}
      <div className="bg-[#FAF8F5] border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        
        {/* Decorative Background Accent */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-5 pointer-events-none">
          <Tractor className="w-96 h-96 text-[#0F763E]" />
        </div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          
          {/* Location Badge */}
          <div className="inline-flex items-center space-x-2 bg-[#E8F5E9] border border-[#C8E6C9] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#1E6B35]">
            <MapPin className="w-4 h-4 text-[#0F763E]" />
            <span>📍 Current Location: <strong>{currentLocDisplay}</strong></span>
          </div>

          {/* Hero Headlines */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Efficiently Manage Your Farm Operations
          </h1>

          <p className="text-slate-600 text-sm sm:text-base font-medium">
            Find Equipment, Labor, and Services for a Productive Season in {selectedDistrict || 'Guntur'}.
          </p>

          {/* Embedded Green Search Pill Input */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-2xl">
            <div className="bg-white border-2 border-[#1E6B35]/30 focus-within:border-[#0F763E] rounded-full p-2 shadow-lg flex items-center transition-all">
              <Search className="w-5 h-5 text-[#0F763E] ml-3 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search tractors, harvesters, labor teams in ${selectedDistrict || 'Guntur'}...`}
                className="w-full px-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#0F763E] hover:bg-[#1E6B35] text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full transition-all shadow-md active:scale-95 shrink-0 flex items-center space-x-1.5"
              >
                <span>🌱 Search Now</span>
              </button>
            </div>
          </form>

          {/* User Info Strip */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-bold text-slate-700">
              <span className="text-[#0F763E]">Welcome:</span>
              <span>{user ? user.name : 'Farmer'}</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-bold text-slate-700 capitalize">
              <ShieldCheck className="w-4 h-4 text-[#0F763E]" />
              <span>Role: <strong>{user?.role || 'Farmer'}</strong></span>
            </div>
          </div>

        </div>
      </div>

      {/* Category Cards Section: "Find What You Need:" (Matching Image 1) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Find What You Need:</h2>
          <Link to="/marketplace" className="text-xs font-bold text-[#0F763E] hover:underline flex items-center gap-1">
            <span>Explore All Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Tractors & Tilling Equipment */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#0F763E] flex items-center justify-center group-hover:bg-[#0F763E] group-hover:text-white transition-colors">
                <Tractor className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#0F763E] transition-colors">
                  Tractors & Tilling
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  50 HP+ Heavy tractors for plowing, rotavator, and seedbed preparation.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#0F763E] bg-[#E8F5E9] px-2.5 py-1 rounded-full">Available Nearby</span>
              <Link to="/marketplace" className="text-xs font-bold text-[#0F763E] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>View More</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Combine Harvesters & Cutters */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#0F763E] flex items-center justify-center group-hover:bg-[#0F763E] group-hover:text-white transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#0F763E] transition-colors">
                  Combine Harvesters
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Paddy, grain & crop combine harvesters with fast processing cutters.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#0F763E] bg-[#E8F5E9] px-2.5 py-1 rounded-full">Available Nearby</span>
              <Link to="/marketplace" className="text-xs font-bold text-[#0F763E] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>View More</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Paddy Labor Teams & Skilled Workforce */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#0F763E] flex items-center justify-center group-hover:bg-[#0F763E] group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#0F763E] transition-colors">
                  Paddy Labor Teams
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Skilled agricultural crews for manual weeding, paddy transplanting & care.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">0% Fee</span>
              <Link to="/marketplace" className="text-xs font-bold text-[#0F763E] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>View More</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card 4: Drones & Precision Sprayers */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#0F763E] flex items-center justify-center group-hover:bg-[#0F763E] group-hover:text-white transition-colors">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#0F763E] transition-colors">
                  Drones & Sprayers
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Precision pesticide and fertilizer drone spraying with zero crop damage.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#0F763E] bg-[#E8F5E9] px-2.5 py-1 rounded-full">Available Nearby</span>
              <Link to="/marketplace" className="text-xs font-bold text-[#0F763E] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>View More</span>
                <span>→</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Quick Access Feature Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Platform Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <Link
            to="/marketplace"
            className="group bg-white p-5 rounded-3xl border border-slate-200/80 hover:border-[#0F763E] hover:shadow-lg transition-all space-y-3"
          >
            <div className="bg-[#E8F5E9] text-[#0F763E] p-3 rounded-2xl w-fit group-hover:bg-[#0F763E] group-hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Rent Machinery & Workforce</h4>
              <p className="text-xs text-slate-500 mt-1">Explore available tractors, harvesters, and labor crews in {selectedDistrict || 'Guntur'}.</p>
            </div>
          </Link>

          <Link
            to="/my-bookings"
            className="group bg-white p-5 rounded-3xl border border-slate-200/80 hover:border-[#0F763E] hover:shadow-lg transition-all space-y-3"
          >
            <div className="bg-[#E8F5E9] text-[#0F763E] p-3 rounded-2xl w-fit group-hover:bg-[#0F763E] group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Rental Bookings</h4>
              <p className="text-xs text-slate-500 mt-1">Manage active rental requests and schedule field bookings.</p>
            </div>
          </Link>

          {user?.role === 'provider' && (
            <Link
              to="/provider/dashboard"
              className="group bg-white p-5 rounded-3xl border border-slate-200/80 hover:border-[#0F763E] hover:shadow-lg transition-all space-y-3"
            >
              <div className="bg-[#E8F5E9] text-[#0F763E] p-3 rounded-2xl w-fit group-hover:bg-[#0F763E] group-hover:text-white transition-colors">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Provider Dashboard</h4>
                <p className="text-xs text-slate-500 mt-1">Post and manage your agricultural machinery and workforce crews.</p>
              </div>
            </Link>
          )}

        </div>
      </div>

    </div>
  );
};
