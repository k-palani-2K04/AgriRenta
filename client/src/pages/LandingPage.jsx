import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appName';
import { 
  Tractor, 
  ShieldCheck, 
  Navigation, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  ChevronRight, 
  Search, 
  Globe, 
  Smartphone,
  Menu,
  X,
  Sliders,
  User,
  Clock,
  Award,
  CheckCircle,
  Briefcase
} from 'lucide-react';

export const LandingPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('farmers');
  const [openFaq, setOpenFaq] = useState(null);

  // Search Filter State
  const [searchTask, setSearchTask] = useState('harvesting');
  const [searchCategory, setSearchCategory] = useState('all');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (token) {
      navigate(`/rentals?task=${searchTask}`);
    } else {
      navigate('/login');
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. TOP STICKY NAVBAR                                                      */}
      {/* ========================================================================= */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* App Brand Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="bg-emerald-600 text-white p-2.5 rounded-2xl group-hover:bg-emerald-700 transition-colors shadow-sm">
                <Tractor className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                  {APP_CONFIG.primaryName}
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-300">v2.0</span>
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:inline">
                  {APP_CONFIG.tagline}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8 text-xs sm:text-sm font-bold text-slate-600">
              <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
              <a href="#categories" className="hover:text-emerald-600 transition-colors">Equipment & Labor</a>
              <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</a>
              <a href="#navigation" className="hover:text-emerald-600 transition-colors">GPS Navigation</a>
              <a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a>
            </div>

            {/* Right Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {token && user ? (
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'provider' ? '/provider/dashboard' : '/marketplace'}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  <span>Go to Control Center</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-slate-700 hover:text-emerald-600 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                    data-testid="landing-hero-cta"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-hidden"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-bold hover:text-emerald-600">Features</a>
            <a href="#categories" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-bold hover:text-emerald-600">Equipment & Labor</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-bold hover:text-emerald-600">How It Works</a>
            <a href="#navigation" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-bold hover:text-emerald-600">GPS Navigation</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-bold hover:text-emerald-600">FAQ</a>
            <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
              {token ? (
                <Link
                  to="/marketplace"
                  className="w-full text-center bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="w-full text-center bg-slate-100 text-slate-800 font-bold py-3 rounded-xl">
                    Sign In
                  </Link>
                  <Link to="/register" className="w-full text-center bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="relative pt-6 sm:pt-10 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Main Hero Card Container */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 rounded-3xl p-6 sm:p-10 lg:p-14 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
          
          {/* Subtle Background Pattern Icon */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
            <Tractor className="w-[450px] h-[450px] text-white" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-5 text-left">
              
              {/* Status Chip */}
              <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-100 border border-white/20">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>On-Demand Machinery & Agricultural Skilled Workforce</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Modern Machinery & Skilled Labor <br className="hidden sm:inline" />
                <span className="text-amber-300">At Your Field's Fingertips</span>
              </h1>

              {/* Subtitle */}
              <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-2xl">
                Book combine harvesters, tractors, crop sprayers, and specialized weeding labor crews. Powered by real-time GPS distance matching, turn-by-turn field navigation, and 20% advance escrow safety.
              </p>

              {/* Mobile-Optimized Quick Search Bar */}
              <form 
                onSubmit={handleSearchSubmit} 
                className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 sm:p-3 rounded-2xl shadow-xl space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-2 max-w-2xl"
                data-testid="landing-search-form"
              >
                {/* Category Selector */}
                <div className="flex-1 flex items-center bg-white text-slate-900 rounded-xl px-3 py-2.5 shadow-sm max-w-full">
                  <User className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                  <select 
                    value={searchCategory} 
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="bg-transparent text-slate-900 font-bold text-xs sm:text-sm w-full focus:outline-hidden cursor-pointer truncate"
                    data-testid="landing-search-category"
                  >
                    <option value="all">All Service Categories</option>
                    <option value="machine">Machinery & Equipment</option>
                    <option value="human_labor">Agricultural Skilled Workforce</option>
                  </select>
                </div>

                {/* Task Filter Selector */}
                <div className="flex-1 flex items-center bg-white text-slate-900 rounded-xl px-3 py-2.5 shadow-sm max-w-full">
                  <Sliders className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                  <select 
                    value={searchTask} 
                    onChange={(e) => setSearchTask(e.target.value)}
                    className="bg-transparent text-slate-900 font-bold text-xs sm:text-sm w-full focus:outline-hidden cursor-pointer truncate"
                    data-testid="landing-search-task"
                  >
                    <option value="harvesting">Harvesting</option>
                    <option value="weeding">Weeding & De-weeding</option>
                    <option value="ploughing">Tilling & Plowing</option>
                    <option value="spraying">Crop Spraying</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shrink-0 shadow-md active:scale-95"
                >
                  <Search className="w-4 h-4 text-slate-900" />
                  <span>Find Services</span>
                </button>
              </form>

              {/* Trust Indicators */}
              <div className="pt-1 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-emerald-100">
                <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>20% Advance Escrow</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl">
                  <Navigation className="w-4 h-4 text-teal-200" />
                  <span>Turn-by-Turn GPS Dispatch</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl">
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Instant UPI Settlement</span>
                </div>
              </div>

            </div>

            {/* Right Hero Column: Curated Agricultural Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-3 sm:p-4 shadow-2xl space-y-3">
                
                {/* Hero Showcase Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-white/20">
                  <img 
                    src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80" 
                    alt="Agricultural Equipment & Field"
                    className="w-full h-56 sm:h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <div>
                      <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-400">
                        GPS Active Dispatch
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base mt-1 text-white">High-Performance Farm Fleet</h4>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/30 text-amber-300">
                      <Tractor className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Hero Feature Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-900">
                  <div className="bg-white rounded-xl p-2.5 shadow-sm border border-slate-100 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Verified Equipment</span>
                  </div>
                  <div className="bg-white rounded-xl p-2.5 shadow-sm border border-slate-100 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Skilled Workforces</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. IMPACT METRICS BAR                                                     */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">250+</div>
              <div className="text-xs text-slate-500 font-bold">Verified Machinery Listed</div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-teal-600">150+</div>
              <div className="text-xs text-slate-500 font-bold">Skilled Workforce Crews</div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-amber-500">GPS Matched</div>
              <div className="text-xs text-slate-500 font-bold">Real-Time Proximity</div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">100%</div>
              <div className="text-xs text-slate-500 font-bold">Guaranteed Escrow Payouts</div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CORE PLATFORM FEATURES GRID                                            */}
      {/* ========================================================================= */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-200">
            Why AgriRenta Stands Out
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered Specifically For Real Agricultural Field Work
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Unlike generic rental sites, AgriRenta integrates exact GPS coordinates, dual routing engines, and 20% advance escrow safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 hover:border-emerald-500 hover:shadow-lg transition-all space-y-3">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl w-fit">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">GPS Proximity Matching</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Calculates precise distances between farmer coordinates and machinery depots in real time so you book the nearest available equipment.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 hover:border-emerald-500 hover:shadow-lg transition-all space-y-3">
            <div className="bg-teal-50 text-teal-600 p-3 rounded-2xl w-fit">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Dual Google Maps & OSRM Engine</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Providers receive turn-by-turn driving directions directly to the farmer's exact field gate, bypassing confusing rural land addresses.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 hover:border-emerald-500 hover:shadow-lg transition-all space-y-3">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">20% Advance Escrow Safety</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Farmers lock in bookings with just 20% advance held in secure escrow. Remaining 80% is released only after field work is confirmed complete.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 hover:border-emerald-500 hover:shadow-lg transition-all space-y-3">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl w-fit">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Agricultural Skilled Workforce</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Need manual weeding or field labor teams? Hire pre-vetted agricultural workgroup crews organized with group leaders and tools.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 hover:border-emerald-500 hover:shadow-lg transition-all space-y-3">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl w-fit">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Instant Admin UPI Settlements</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Equipment providers receive prompt payout releases directly to their registered UPI ID right after job completion confirmation.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 hover:border-emerald-500 hover:shadow-lg transition-all space-y-3">
            <div className="bg-teal-50 text-teal-600 p-3 rounded-2xl w-fit">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Cross-Device & Mobile Ready</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Runs smoothly on laptop local servers or public tunnel domains. Fully optimized for smartphone screens without text overflow.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SERVICES CATEGORY SHOWCASE (WITH CURATED AGRICULTURAL IMAGES)          */}
      {/* ========================================================================= */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Machinery & Agricultural Skilled Workforce Services
          </h2>
          <p className="text-slate-600 text-sm">
            Comprehensive agricultural support for every stage of your crop cycle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Category Card 1: Combine Harvesters */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all group">
            <div className="h-44 overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=600&q=80" 
                alt="Combine Harvester" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-400">
                Harvesting Equipment
              </div>
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-extrabold text-slate-900 text-base">Combine Harvesters</h3>
              <p className="text-slate-500 text-xs leading-relaxed">4WD Paddy, Grain & Crop Harvesters with high capacity cutters.</p>
              <div className="text-emerald-700 text-xs font-extrabold pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Verified Direct Booking</span>
              </div>
            </div>
          </div>

          {/* Category Card 2: Heavy Tractors & Tilling */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all group">
            <div className="h-44 overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80" 
                alt="Heavy Tractors & Tilling" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 bg-teal-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-teal-400">
                Plowing & Tilling
              </div>
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-extrabold text-slate-900 text-base">Heavy Tractors & Tilling</h3>
              <p className="text-slate-500 text-xs leading-relaxed">50 HP+ Tractors equipped for tilling, plowing, and seed bed prep.</p>
              <div className="text-emerald-700 text-xs font-extrabold pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Flexible Service Slots</span>
              </div>
            </div>
          </div>

          {/* Category Card 3: Agricultural Skilled Workforce (NO MOBILE OVERFLOW) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all group">
            <div className="h-44 overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80" 
                alt="Agricultural Skilled Workforce" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 bg-amber-500 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                Field Workforce
              </div>
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-extrabold text-slate-900 text-base max-w-full truncate">
                Agricultural Skilled Workforce
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">Experienced labor teams for manual weeding, crop care & field work.</p>
              <div className="text-emerald-700 text-xs font-extrabold pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Workgroup Team Dispatch</span>
              </div>
            </div>
          </div>

          {/* Category Card 4: Drone & Crop Sprayers */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all group">
            <div className="h-44 overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80" 
                alt="Drone & Crop Sprayers" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-400">
                Precision Spraying
              </div>
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-extrabold text-slate-900 text-base">Drone & Crop Sprayers</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Precision pesticide and fertilizer spraying with zero crop damage.</p>
              <div className="text-emerald-700 text-xs font-extrabold pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero Crop Damage Guarantee</span>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 6. INTERACTIVE WORKFLOW STEPS ("HOW IT WORKS")                            */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-200">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How AgriRenta Operates Seamlessly
          </h2>
        </div>

        {/* User Role Selector Tabs (Mobile-Wrap Safe) */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-200/80 p-1.5 rounded-2xl flex space-x-1 sm:space-x-2 max-w-full overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('farmers')}
              className={`px-4 sm:px-6 py-2 rounded-xl font-bold text-xs sm:text-sm shrink-0 transition-all ${
                activeTab === 'farmers'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              For Farmers (Seekers)
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className={`px-4 sm:px-6 py-2 rounded-xl font-bold text-xs sm:text-sm shrink-0 transition-all ${
                activeTab === 'providers'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              For Owners & Providers
            </button>
          </div>
        </div>

        {/* Workflow Steps */}
        {activeTab === 'farmers' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold text-sm flex items-center justify-center">1</div>
              <h4 className="font-extrabold text-slate-900 text-sm">Search Nearby</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Filter machinery or agricultural workforce crews by task type and field requirements.</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold text-sm flex items-center justify-center">2</div>
              <h4 className="font-extrabold text-slate-900 text-sm">Book with 20% Escrow</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Pay 20% advance to hold your slot. Remaining 80% is held safe until field work is completed.</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold text-sm flex items-center justify-center">3</div>
              <h4 className="font-extrabold text-slate-900 text-sm">Track GPS Dispatch</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Watch the provider navigate live using Google Maps directions straight to your field entrance.</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold text-sm flex items-center justify-center">4</div>
              <h4 className="font-extrabold text-slate-900 text-sm">Confirm & Complete</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Inspect completed field work and mark job done to release payment to provider.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 font-extrabold text-sm flex items-center justify-center">1</div>
              <h4 className="font-extrabold text-slate-900 text-sm">List Equipment/Crew</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Add your tractors, combine harvesters, or labor teams with operating specs.</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 font-extrabold text-sm flex items-center justify-center">2</div>
              <h4 className="font-extrabold text-slate-900 text-sm">Accept Booking</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Receive instant mobile booking notifications from nearby farmers.</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 font-extrabold text-sm flex items-center justify-center">3</div>
              <h4 className="font-extrabold text-slate-900 text-sm">Navigate to Field</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Tap one button to open Google Maps driving directions straight to the farmer's GPS location.</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 font-extrabold text-sm flex items-center justify-center">4</div>
              <h4 className="font-extrabold text-slate-900 text-sm">Get Paid via UPI</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Receive full payout release directly to your UPI handle after job sign-off.</p>
            </div>
          </div>
        )}

      </section>

      {/* ========================================================================= */}
      {/* 7. REAL-TIME NAVIGATION & DISPATCH                                       */}
      {/* ========================================================================= */}
      <section id="navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-200">
                GPS Navigation & Field Dispatch
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Hyper-Local Matching & Direct Turn-by-Turn Field Navigation
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                AgriRenta connects machinery owners and agricultural skilled workforce crews with farmers using exact GPS location matching and real-time navigation.
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 font-sans text-xs">
                  <span>GPS Navigation System</span>
                  <span className="text-emerald-400 font-bold">Active Route</span>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex justify-between items-center text-slate-200">
                  <span>Machinery Depot (Provider)</span>
                  <span className="text-emerald-400">GPS Origin</span>
                </div>
                <div className="text-center text-emerald-400 font-sans font-bold text-xs py-1">
                  ⬇ Google Maps Driving Directions Engine ⬇
                </div>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex justify-between items-center text-slate-200">
                  <span>Farm Field Gate (Farmer)</span>
                  <span className="text-teal-300">GPS Destination</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FAQ ACCORDION                                                          */}
      {/* ========================================================================= */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 space-y-8">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm">
            Everything you need to know about AgriRenta equipment rentals and workforce bookings.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How does the 20% advance escrow payment work?",
              a: "When a farmer books equipment or labor, only 20% is charged upfront to lock in the reservation. This amount is held securely in escrow. The remaining balance is released only after the farmer inspects and confirms the field work is completed."
            },
            {
              q: "How does Google Maps field navigation assist equipment drivers?",
              a: "When a provider accepts a booking, AgriRenta generates a direct Google Maps navigation URL using the exact latitude and longitude of the farmer's field entrance, ensuring drivers arrive directly without getting lost."
            },
            {
              q: "Can I book labor crews for manual weeding or harvesting?",
              a: "Yes! AgriRenta lists both heavy machinery and specialized agricultural skilled workforce teams with transparent service options."
            },
            {
              q: "How do equipment providers receive earnings payouts?",
              a: "Once a farmer marks the job as completed, the payout is released directly to the provider's registered UPI ID (e.g., phone@upi) with instant reference confirmation."
            },
            {
              q: "Can I host and use AgriRenta on my local laptop or smartphone?",
              a: "Yes. AgriRenta is fully configured with 0.0.0.0 host bindings, Vite allowedHost rules, and Cloudflare/ngrok tunnel support so you can host it locally on a laptop and access it smoothly on any mobile browser."
            }
          ].map((faq, i) => (
            <div 
              key={i} 
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all shadow-2xs"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full px-5 py-4 text-left font-bold text-slate-900 text-xs sm:text-sm flex justify-between items-center hover:text-emerald-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight className={`w-4 h-4 transition-transform duration-200 shrink-0 ${openFaq === i ? 'rotate-90 text-emerald-600' : 'text-slate-400'}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-xs text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 9. CALL TO ACTION BANNER                                                  */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-5 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Transform Your Agricultural Season?
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-xl mx-auto">
              Join hundreds of farmers, machinery owners, and agricultural skilled workforce crews using AgriRenta for instant field dispatch.
            </p>
            
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold px-7 py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white font-bold px-7 py-3.5 rounded-xl text-xs sm:text-sm backdrop-blur-md transition-all"
              >
                Sign In to Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FOOTER                                                                */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-slate-200/80 text-slate-500 text-xs py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base">
                <Tractor className="w-5 h-5 text-emerald-600" />
                <span>{APP_CONFIG.primaryName}</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                On-demand agricultural machinery and skilled workforce platform.
              </p>
            </div>

            <div>
              <h5 className="text-slate-900 font-bold text-xs mb-2">Quick Navigation</h5>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#features" className="hover:text-emerald-600 transition-colors">Platform Features</a></li>
                <li><a href="#categories" className="hover:text-emerald-600 transition-colors">Machinery & Labor</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</a></li>
                <li><a href="#navigation" className="hover:text-emerald-600 transition-colors">GPS Navigation</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-slate-900 font-bold text-xs mb-2">User Access</h5>
              <ul className="space-y-1.5 text-xs">
                <li><Link to="/login" className="hover:text-emerald-600 transition-colors">Farmer Sign In</Link></li>
                <li><Link to="/register" className="hover:text-emerald-600 transition-colors">Register as Provider</Link></li>
                <li><Link to="/marketplace" className="hover:text-emerald-600 transition-colors">Live Marketplace</Link></li>
                <li><Link to="/admin" className="hover:text-emerald-600 transition-colors">Admin Portal</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-slate-900 font-bold text-xs mb-2">Platform Security</h5>
              <p className="text-slate-500 text-xs mb-2">GPS-Matched Machinery & Agricultural Workforce Network</p>
              <div className="flex items-center space-x-1.5 text-emerald-600 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>GPS & Escrow Protected</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-xs">
            <div>© {new Date().getFullYear()} AgriRenta. All rights reserved.</div>
            <div className="mt-2 sm:mt-0 flex space-x-3">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Self-Hosted & Tunnel Ready</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
