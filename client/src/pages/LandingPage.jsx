import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
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
  Briefcase,
  MapPin,
  TrendingUp,
  Star,
  Compass,
  Layers,
  PhoneCall
} from 'lucide-react';

/* ==========================================================================
   Intersection Observer Hook for Entrance Animations
   ========================================================================== */
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export const LandingPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('farmers');
  const [openFaq, setOpenFaq] = useState(null);

  // Search Filter State
  const [searchTask, setSearchTask] = useState('harvesting');
  const [searchCategory, setSearchCategory] = useState('all');

  // InView refs for section animations
  const [heroRef, heroInView] = useInView(0.05);
  const [statsRef, statsInView] = useInView();
  const [featuresRef, featuresInView] = useInView();
  const [categoriesRef, categoriesInView] = useInView();
  const [howItWorksRef, howItWorksInView] = useInView();
  const [navRef, navSectionInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  // Close mobile menu on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMobileMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Prevent scroll when mobile drawer is active
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#categories', label: 'Machinery & Labor' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#navigation', label: 'GPS Navigation' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-600 selection:text-white overflow-x-hidden">

      {/* =====================================================================
          1. TOP ANNOUNCEMENT TICKER BANNER
          ===================================================================== */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 text-emerald-100 text-[11px] sm:text-xs py-2 px-4 text-center font-medium flex items-center justify-center space-x-2 border-b border-emerald-800/50">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 animate-pulse">
          LIVE
        </span>
        <span className="truncate">
          ⚡ <strong>Next-Gen Agricultural Logistics</strong> — Book GPS-Matched Tractors, Harvesters &amp; Skilled Crews with 20% Advance Escrow.
        </span>
      </div>

      {/* =====================================================================
          2. ULTRA-MODERN STICKY NAVBAR
          ===================================================================== */}
      <nav
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">

            {/* Brand Logo */}
            <Link to="/" className="flex items-center space-x-3 group" aria-label="AgriRenta Home" data-testid="navbar-logo">
              <div className="bg-gradient-to-tr from-emerald-700 to-teal-500 text-white p-2.5 rounded-2xl group-hover:scale-105 transition-transform shadow-md shadow-emerald-600/20">
                <Tractor className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-slate-900 tracking-tight leading-none flex items-center gap-2">
                  {APP_CONFIG.primaryName}
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase shadow-xs">
                    PRO 2.0
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline mt-0.5">
                  {APP_CONFIG.tagline}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-600">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="hover:text-emerald-600 transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-emerald-500 after:transition-all after:duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {token && user ? (
                <Link
                  to={
                    user.role === 'admin'
                      ? '/admin/dashboard'
                      : user.role === 'provider'
                      ? '/provider/dashboard'
                      : '/marketplace'
                  }
                  className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/25 active:scale-95"
                >
                  <span>Go to Control Center</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-slate-700 hover:text-emerald-600 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-slate-100/80 transition-colors"
                    data-testid="landing-nav-signin"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/25 active:scale-95"
                    data-testid="landing-hero-cta"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              data-testid="landing-hamburger-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>

          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        <div
          className={`md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />

        <div
          id="mobile-nav-drawer"
          data-testid="landing-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className={`md:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="bg-emerald-600 text-white p-2 rounded-xl">
                <Tractor className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="font-black text-lg text-slate-900">{APP_CONFIG.primaryName}</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-3.5 px-3 rounded-xl text-slate-800 font-bold hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-sm"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              </a>
            ))}
          </nav>

          <div className="px-6 py-6 border-t border-slate-100 space-y-3 bg-slate-50/50">
            {token ? (
              <Link
                to="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md text-sm min-h-[48px]"
                data-testid="landing-mobile-dashboard-link"
              >
                <span>Go to Control Center</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center bg-white border border-slate-200 text-slate-800 font-bold py-3 rounded-xl text-sm min-h-[48px] shadow-xs"
                  data-testid="landing-mobile-signin-link"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md text-sm min-h-[48px]"
                  data-testid="landing-mobile-register-link"
                >
                  Create Free Account
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* =====================================================================
          3. HERO SECTION — Modern Glassmorphism & Interactive Fleet Card
          ===================================================================== */}
      <section
        ref={heroRef}
        className="relative pt-8 sm:pt-14 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        aria-label="Hero section"
      >
        {/* Background ambient lighting */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-tr from-emerald-400/15 via-teal-300/10 to-amber-200/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* ── Left Hero Column ── */}
          <div className="lg:col-span-7 space-y-6 text-left">

            {/* Pill Tag */}
            <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-full text-xs font-bold border border-emerald-200/80 shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" aria-hidden="true" />
              <span>India's #1 GPS Agricultural Rental &amp; Workforce Network</span>
            </div>

            {/* Headline */}
            <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
              On-Demand Heavy Farm Fleet &amp;{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                Skilled Field Workforces
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              Book verified combine harvesters, tractors, precision crop sprayers, and de-weeding workforce crews. Powered by real-time GPS proximity matching, turn-by-turn field entrance navigation, and 20% advance escrow safety.
            </p>

            {/* Glassmorphic Search Widget */}
            <form
              onSubmit={handleSearchSubmit}
              className="search-bar-wrapper bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-3 sm:gap-0 max-w-2xl"
              data-testid="landing-search-form"
              aria-label="Service search"
            >
              {/* Category Dropdown */}
              <div className="flex-1 flex items-center bg-slate-50 text-slate-900 rounded-xl px-3 py-3 border border-slate-200/60 min-h-[48px]">
                <User className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" aria-hidden="true" />
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-transparent text-slate-900 font-bold text-xs sm:text-sm w-full focus:outline-none cursor-pointer"
                  data-testid="landing-search-category"
                  aria-label="Select category"
                >
                  <option value="all">All Service Categories</option>
                  <option value="machine">Heavy Farm Machinery</option>
                  <option value="human_labor">Agricultural Skilled Workforce</option>
                </select>
              </div>

              {/* Task Dropdown */}
              <div className="flex-1 flex items-center bg-slate-50 text-slate-900 rounded-xl px-3 py-3 border border-slate-200/60 min-h-[48px]">
                <Sliders className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" aria-hidden="true" />
                <select
                  value={searchTask}
                  onChange={(e) => setSearchTask(e.target.value)}
                  className="bg-transparent text-slate-900 font-bold text-xs sm:text-sm w-full focus:outline-none cursor-pointer"
                  data-testid="landing-search-task"
                  aria-label="Select task"
                >
                  <option value="harvesting">Harvesting &amp; Reaping</option>
                  <option value="weeding">Manual Weeding Crews</option>
                  <option value="ploughing">Tilling &amp; Plowing</option>
                  <option value="spraying">Precision Crop Spraying</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shrink-0 shadow-md shadow-emerald-600/20 active:scale-95 min-h-[48px]"
                data-testid="landing-search-submit"
              >
                <Search className="w-4 h-4 text-white" aria-hidden="true" />
                <span>Search Fleet</span>
              </button>
            </form>

            {/* Trust Indicators Pill Badges */}
            <div
              className="stats-grid pt-1 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700"
              data-testid="landing-trust-indicators"
            >
              <div className="flex items-center space-x-2 bg-emerald-50/80 text-emerald-900 px-3.5 py-2 rounded-xl border border-emerald-200/60 shadow-2xs min-h-[40px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>20% Advance Escrow</span>
              </div>
              <div className="flex items-center space-x-2 bg-teal-50/80 text-teal-900 px-3.5 py-2 rounded-xl border border-teal-200/60 shadow-2xs min-h-[40px]">
                <Navigation className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
                <span>Turn-by-Turn GPS Dispatch</span>
              </div>
              <div className="flex items-center space-x-2 bg-amber-50/80 text-amber-900 px-3.5 py-2 rounded-xl border border-amber-200/60 shadow-2xs min-h-[40px]">
                <Zap className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                <span>Instant UPI Settlements</span>
              </div>
            </div>

          </div>

          {/* ── Right Hero Column: Interactive Card Showcase ── */}
          <div className="lg:col-span-5 relative">
            <div className="hero-container bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-2xl border border-emerald-700/30 relative overflow-hidden">
              
              {/* Image Container with aspect-video */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video group">
                <img
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
                  alt="Modern Heavy Tractor working on agricultural field at golden hour"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                {/* Live Status Overlay */}
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-emerald-300 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/40 flex items-center space-x-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>GPS ACTIVE DISPATCH</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-white">Harvester Depot Fleet #402</h4>
                    <p className="text-[11px] text-emerald-300 font-semibold">Matched within 3.2 km field radius</p>
                  </div>
                  <div className="bg-emerald-500/20 backdrop-blur-md p-2 rounded-xl border border-emerald-400/40 text-amber-300">
                    <Tractor className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>
              </div>

              {/* Floating Feature Highlights */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold text-slate-200">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Verified Machinery</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center space-x-2.5">
                  <Users className="w-4 h-4 text-teal-400 shrink-0" aria-hidden="true" />
                  <span>Pre-Vetted Crews</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =====================================================================
          4. IMPACT STATS METRICS BAR
          ===================================================================== */}
      <section
        ref={statsRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
        data-testid="landing-stats-section"
        aria-label="Platform metrics"
      >
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center" role="list">

            <div className="space-y-1 p-2" role="listitem">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">250+</div>
              <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Verified Machinery Listed</div>
            </div>

            <div className="space-y-1 p-2" role="listitem">
              <div className="text-3xl sm:text-4xl font-black text-teal-600 tracking-tight">150+</div>
              <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Skilled Workforce Crews</div>
            </div>

            <div className="space-y-1 p-2" role="listitem">
              <div className="text-3xl sm:text-4xl font-black text-amber-500 tracking-tight">GPS Matched</div>
              <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Real-Time Proximity</div>
            </div>

            <div className="space-y-1 p-2" role="listitem">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">100%</div>
              <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Guaranteed Escrow Payouts</div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          5. WHY AGRIRENDA — CORE PLATFORM FEATURES
          ===================================================================== */}
      <section
        id="features"
        ref={featuresRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16"
        aria-label="Platform features"
        data-testid="landing-features-section"
      >
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="bg-emerald-50 text-emerald-800 text-xs font-extrabold px-4 py-1.5 rounded-full border border-emerald-200/80">
            Why AgriRenta Leads The Industry
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Engineered Specifically For Real Agricultural Field Operations
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Unlike generic classified portals, AgriRenta integrates exact GPS field entrance pins, dual routing engines, and transparent 20% escrow protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Globe className="w-6 h-6" />,
              color: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
              title: 'GPS Proximity Matching',
              desc: 'Calculates exact distances between farmer field coordinates and nearby provider depots in real time using Haversine algorithm matching.',
            },
            {
              icon: <Navigation className="w-6 h-6" />,
              color: 'bg-teal-50 text-teal-600 border-teal-200/60',
              title: 'Dual Google Maps & OSRM Engine',
              desc: 'Drivers get turn-by-turn navigation straight to the farmer\'s precise field entrance gate, completely bypassing rural address confusion.',
            },
            {
              icon: <ShieldCheck className="w-6 h-6" />,
              color: 'bg-amber-50 text-amber-600 border-amber-200/60',
              title: '20% Advance Escrow Safety',
              desc: 'Farmers lock in reservations with just 20% advance held safe in escrow. The remaining 80% balance is released only upon complete job sign-off.',
            },
            {
              icon: <Users className="w-6 h-6" />,
              color: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
              title: 'Agricultural Skilled Workforce',
              desc: 'Need manual de-weeding or harvest labor teams? Book pre-vetted agricultural workforce crews with group leaders and equipment.',
            },
            {
              icon: <Zap className="w-6 h-6" />,
              color: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
              title: 'Instant Admin UPI Settlements',
              desc: 'Machinery owners receive payouts directly into their registered UPI address right after farmer confirms completed field work.',
            },
            {
              icon: <Smartphone className="w-6 h-6" />,
              color: 'bg-teal-50 text-teal-600 border-teal-200/60',
              title: 'Mobile-First & Self-Hosted Ready',
              desc: 'Fully optimized for smartphone screens, local laptop server hosting, and public tunnel domains without text wrapping or overflow bugs.',
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="bg-white rounded-3xl border border-slate-200/80 p-7 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 space-y-4 group"
            >
              <div className={`${feature.color} p-3.5 rounded-2xl border w-fit group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-extrabold text-slate-950">{feature.title}</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          6. SERVICE CATEGORIES SHOWCASE — Aspect-Video Grid
          ===================================================================== */}
      <section
        id="categories"
        ref={categoriesRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
        aria-label="Service categories"
        data-testid="landing-categories-section"
      >
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Machinery &amp; Skilled Agricultural Workforce Services
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Comprehensive on-demand agricultural support for every stage of your crop production cycle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              src: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=600&q=80',
              alt: 'Combine Harvester reaping grain in wheat field',
              badge: 'Harvesting Equipment',
              badgeStyle: 'bg-emerald-600 text-white border-emerald-400',
              title: 'Combine Harvesters',
              desc: '4WD Paddy, Grain & Crop Harvesters with high capacity cutters.',
              tag: 'Verified Direct Booking',
            },
            {
              src: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
              alt: 'Heavy tractor plowing agricultural field',
              badge: 'Plowing & Tilling',
              badgeStyle: 'bg-teal-600 text-white border-teal-400',
              title: 'Heavy Tractors & Tilling',
              desc: '50 HP+ Heavy Tractors equipped for tilling, plowing, and seed bed prep.',
              tag: 'Flexible Service Slots',
            },
            {
              src: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80',
              alt: 'Agricultural skilled workforce crew in green paddy field',
              badge: 'Field Workforce',
              badgeStyle: 'bg-amber-500 text-slate-950 border-amber-300',
              title: 'Agricultural Skilled Workforce',
              desc: 'Experienced labor teams for manual weeding, crop care & field work.',
              tag: 'Workgroup Team Dispatch',
            },
            {
              src: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80',
              alt: 'Agricultural drone precision spraying fertilizer over crops',
              badge: 'Precision Spraying',
              badgeStyle: 'bg-emerald-600 text-white border-emerald-400',
              title: 'Drone & Crop Sprayers',
              desc: 'Precision pesticide and fertilizer spraying with zero crop damage.',
              tag: 'Zero Crop Damage Guarantee',
            },
          ].map((card, i) => (
            <div
              key={card.title}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              data-testid={`service-card-${i}`}
            >
              {/* aspect-video image container */}
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={card.src}
                  alt={card.alt}
                  className="service-card-img w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                <div
                  className={`absolute bottom-3 left-3 ${card.badgeStyle} text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-xs`}
                >
                  {card.badge}
                </div>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-extrabold text-slate-900 text-base leading-snug">{card.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{card.desc}</p>
                <div className="text-emerald-700 text-xs font-extrabold pt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>{card.tag}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          7. HOW IT WORKS — INTERACTIVE ROLE SWITCHER
          ===================================================================== */}
      <section
        id="how-it-works"
        ref={howItWorksRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
        aria-label="How AgriRenta works"
        data-testid="landing-how-it-works-section"
      >
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <span className="bg-emerald-50 text-emerald-800 text-xs font-black px-4 py-1.5 rounded-full border border-emerald-200/80">
            Simple 4-Step Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            How AgriRenta Operates Seamlessly
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8" role="tablist" aria-label="User role tabs">
          <div className="bg-slate-200/80 p-1.5 rounded-2xl flex space-x-2 relative">
            <div
              className="absolute inset-y-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md transition-all duration-300 ease-out"
              style={{
                width: 'calc(50% - 6px)',
                left: activeTab === 'farmers' ? '6px' : 'calc(50% + 0px)',
              }}
              aria-hidden="true"
            />
            <button
              role="tab"
              aria-selected={activeTab === 'farmers'}
              aria-controls="tab-panel-farmers"
              onClick={() => setActiveTab('farmers')}
              className={`relative z-10 px-5 sm:px-8 py-2.5 rounded-xl font-bold text-xs sm:text-sm shrink-0 transition-colors duration-200 min-h-[40px] ${
                activeTab === 'farmers' ? 'text-white' : 'text-slate-700 hover:text-slate-950'
              }`}
              data-testid="tab-farmers"
            >
              For Farmers (Seekers)
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'providers'}
              aria-controls="tab-panel-providers"
              onClick={() => setActiveTab('providers')}
              className={`relative z-10 px-5 sm:px-8 py-2.5 rounded-xl font-bold text-xs sm:text-sm shrink-0 transition-colors duration-200 min-h-[40px] ${
                activeTab === 'providers' ? 'text-white' : 'text-slate-700 hover:text-slate-950'
              }`}
              data-testid="tab-providers"
            >
              For Owners &amp; Providers
            </button>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="relative" style={{ minHeight: '190px' }}>
          
          {/* Farmers Panel */}
          <div
            id="tab-panel-farmers"
            role="tabpanel"
            aria-labelledby="tab-farmers"
            data-testid="tab-panel-farmers"
            className={`grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-300 ${
              activeTab === 'farmers' ? 'opacity-100 translate-y-0' : 'opacity-0 absolute inset-0 translate-y-2 pointer-events-none'
            }`}
          >
            {[
              { step: '01', title: 'Search Nearby', desc: 'Filter heavy machinery or skilled labor crews by task type and field requirements.' },
              { step: '02', title: 'Book with 20% Escrow', desc: 'Pay 20% advance to hold your slot. Remaining 80% is held safe until field work is completed.' },
              { step: '03', title: 'Track GPS Dispatch', desc: 'Watch provider navigate live using Google Maps directions straight to your field entrance gate.' },
              { step: '04', title: 'Confirm & Complete', desc: 'Inspect completed field work and mark job done to release payment to provider.' },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 space-y-3"
              >
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                  {item.step}
                </div>
                <h4 className="font-black text-slate-950 text-base">{item.title}</h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Providers Panel */}
          <div
            id="tab-panel-providers"
            role="tabpanel"
            aria-labelledby="tab-providers"
            data-testid="tab-panel-providers"
            className={`grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-300 ${
              activeTab === 'providers' ? 'opacity-100 translate-y-0' : 'opacity-0 absolute inset-0 translate-y-2 pointer-events-none'
            }`}
          >
            {[
              { step: '01', title: 'List Equipment/Crew', desc: 'Add your tractors, combine harvesters, or labor teams with operating specs.' },
              { step: '02', title: 'Accept Booking', desc: 'Receive instant mobile booking notifications from nearby farmers.' },
              { step: '03', title: 'Navigate to Field', desc: 'Tap one button to open Google Maps driving directions straight to farmer\'s GPS location.' },
              { step: '04', title: 'Get Paid via UPI', desc: 'Receive full payout release directly to your UPI handle after job sign-off.' },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200 space-y-3"
              >
                <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-800 font-black text-sm flex items-center justify-center">
                  {item.step}
                </div>
                <h4 className="font-black text-slate-950 text-base">{item.title}</h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =====================================================================
          8. GPS DISPATCH & LIVE NAVIGATION TERMINAL
          ===================================================================== */}
      <section
        id="navigation"
        ref={navRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
        aria-label="GPS Navigation section"
        data-testid="landing-navigation-section"
      >
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            <div className="lg:col-span-6 space-y-4">
              <span className="bg-emerald-50 text-emerald-800 text-xs font-black px-4 py-1.5 rounded-full border border-emerald-200/80">
                GPS Field Entrance Dispatch
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Hyper-Local Distance Matching &amp; Turn-by-Turn Field Navigation
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                AgriRenta connects machinery owners and agricultural skilled workforce crews with farmers using exact GPS location matching and real-time navigation.
              </p>
              <ul className="space-y-2.5">
                {[
                  'Nearest depot found in seconds via Haversine distance formula',
                  "Google Maps deep-link opens directly with farmer's GPS pin",
                  'OSRM fallback engine for rural areas with limited connectivity',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Terminal Container */}
            <div className="lg:col-span-6">
              <div
                className="navigation-terminal bg-slate-950 text-white rounded-2xl p-6 shadow-2xl space-y-4 font-mono text-xs overflow-x-auto border border-slate-800"
                role="img"
                aria-label="GPS Navigation system terminal diagram"
                data-testid="gps-terminal"
              >
                <div className="flex items-center justify-between text-slate-400 font-sans text-xs min-w-[280px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span className="ml-2 font-bold text-slate-300">GPS System</span>
                  </span>
                  <span className="text-emerald-400 font-bold">Active Route</span>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-slate-200 gap-4 min-w-[280px]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                    <span>Machinery Depot (Provider)</span>
                  </div>
                  <span className="text-emerald-400 text-[10px] font-bold">GPS Origin</span>
                </div>

                <div className="text-center text-emerald-400 font-sans font-bold text-xs py-1 min-w-[280px]">
                  ⬇ Google Maps Driving Directions Engine ⬇
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-slate-200 gap-4 min-w-[280px]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-400 shrink-0" aria-hidden="true" />
                    <span>Farm Field Gate (Farmer)</span>
                  </div>
                  <span className="text-teal-300 text-[10px] font-bold">GPS Destination</span>
                </div>

                <div className="bg-emerald-950/60 border border-emerald-700/60 rounded-xl p-3.5 text-emerald-300 text-[11px] leading-relaxed min-w-[280px]">
                  <span className="font-bold text-emerald-400">Route Status:</span> Navigation active — Driver guided directly to farmer's field entrance gate.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================================
          9. FAQ ACCORDION
          ===================================================================== */}
      <section
        id="faq"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 space-y-8"
        aria-label="Frequently asked questions"
        data-testid="landing-faq-section"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Everything you need to know about AgriRenta equipment rentals and workforce bookings.
          </p>
        </div>

        <div className="space-y-3" role="list">
          {[
            {
              q: 'How does the 20% advance escrow payment work?',
              a: 'When a farmer books equipment or labor, only 20% is charged upfront to lock in the reservation. This amount is held securely in escrow. The remaining balance is released only after the farmer inspects and confirms the field work is completed.',
            },
            {
              q: 'How does Google Maps field navigation assist equipment drivers?',
              a: "When a provider accepts a booking, AgriRenta generates a direct Google Maps navigation URL using the exact latitude and longitude of the farmer's field entrance, ensuring drivers arrive directly without getting lost.",
            },
            {
              q: 'Can I book labor crews for manual weeding or harvesting?',
              a: 'Yes! AgriRenta lists both heavy machinery and specialized agricultural skilled workforce teams with transparent service options.',
            },
            {
              q: 'How do equipment providers receive earnings payouts?',
              a: "Once a farmer marks the job as completed, the payout is released directly to the provider's registered UPI ID (e.g., phone@upi) with instant reference confirmation.",
            },
            {
              q: 'Can I host and use AgriRenta on my local laptop or smartphone?',
              a: 'Yes. AgriRenta is fully configured with 0.0.0.0 host bindings, Vite allowedHost rules, and Cloudflare/ngrok tunnel support so you can host it locally on a laptop and access it smoothly on any mobile browser.',
            },
          ].map((faq, i) => (
            <div
              key={i}
              role="listitem"
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all shadow-2xs hover:shadow-md"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full px-6 py-4.5 text-left font-bold text-slate-900 text-xs sm:text-sm flex justify-between items-center hover:text-emerald-600 transition-colors min-h-[48px]"
                aria-expanded={openFaq === i}
                data-testid={`faq-toggle-${i}`}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 shrink-0 ml-3 ${
                    openFaq === i ? 'rotate-180 text-emerald-600' : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-4.5 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-3.5 leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          10. CALL-TO-ACTION BANNER
          ===================================================================== */}
      <section
        ref={ctaRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
        aria-label="Get started call to action"
        data-testid="landing-cta-section"
      >
        <div className="bg-[#FAF8F5] rounded-3xl p-8 sm:p-14 text-center text-slate-900 shadow-sm relative overflow-hidden border border-slate-200/90">
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Ready to Transform Your Agricultural Season?
            </h2>
            <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto font-medium">
              Join hundreds of farmers, machinery owners, and agricultural skilled workforce crews using AgriRenta for instant field entrance dispatch.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-4 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center"
                style={{ minHeight: '48px' }}
                data-testid="landing-cta-register"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 font-bold px-8 py-4 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center border border-slate-200 shadow-2xs"
                style={{ minHeight: '48px' }}
                data-testid="landing-cta-signin"
              >
                Sign In to Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          11. FOOTER
          ===================================================================== */}
      <footer
        className="bg-white border-t border-slate-200/80 text-slate-500 text-xs py-12"
        data-testid="landing-footer"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5 text-slate-950 font-black text-lg">
                <div className="bg-emerald-600 text-white p-2 rounded-xl">
                  <Tractor className="w-5 h-5" aria-hidden="true" />
                </div>
                <span>{APP_CONFIG.primaryName}</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                On-demand agricultural machinery and skilled workforce logistics platform.
              </p>
            </div>

            <div>
              <h5 className="text-slate-900 font-extrabold text-xs mb-3 uppercase tracking-wider">Quick Links</h5>
              <ul className="space-y-2 text-xs font-semibold">
                <li><a href="#features" className="hover:text-emerald-600 transition-colors">Why AgriRenta</a></li>
                <li><a href="#categories" className="hover:text-emerald-600 transition-colors">Machinery &amp; Labor</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</a></li>
                <li><a href="#navigation" className="hover:text-emerald-600 transition-colors">GPS Tracking</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-slate-900 font-extrabold text-xs mb-3 uppercase tracking-wider">Platform Portals</h5>
              <ul className="space-y-2 text-xs font-semibold">
                <li><Link to="/login" className="hover:text-emerald-600 transition-colors">Farmer Login</Link></li>
                <li><Link to="/register" className="hover:text-emerald-600 transition-colors">Create Account</Link></li>
                <li><Link to="/marketplace" className="hover:text-emerald-600 transition-colors">Live Marketplace</Link></li>
                <li><Link to="/admin" className="hover:text-emerald-600 transition-colors">Admin Escrow Hub</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-slate-900 font-extrabold text-xs mb-3 uppercase tracking-wider">Security &amp; Protection</h5>
              <p className="text-slate-500 text-xs mb-3">GPS-Matched Equipment &amp; Skilled Workforce Operations</p>
              <div className="flex items-center space-x-2 text-emerald-700 font-extrabold">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" aria-hidden="true" />
                <span>GPS &amp; 20% Escrow Protected</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-xs gap-3">
            <div>© {new Date().getFullYear()} AgriRenta. All rights reserved.</div>
            <div className="flex space-x-4 font-medium">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Self-Hosted &amp; Tunnel Ready</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
