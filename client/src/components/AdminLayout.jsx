import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appName';
import { ShieldCheck, LogOut, Tractor, Wallet, ArrowLeft } from 'lucide-react';
import { NotificationBanner } from './NotificationBanner';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Portal Name */}
            <div className="flex items-center space-x-3">
              <Link to="/admin/dashboard" className="flex items-center space-x-2.5 group">
                <div className="bg-emerald-600 text-white p-2 rounded-2xl group-hover:bg-emerald-500 transition-colors shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg text-white tracking-tight leading-none">
                    {APP_CONFIG.primaryName} <span className="text-amber-400">Admin</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Platform Owner & Escrow Control Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Right Side: Admin User Profile & Sign Out */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-slate-200">{user.name || 'Platform Admin'}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-md border border-emerald-500/30 uppercase">
                    Admin
                  </span>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3.5 min-h-12 rounded-xl text-xs font-semibold transition-colors active:scale-95"
                title="Sign out of Admin Portal"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit Portal</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Dynamic Admin Body Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <NotificationBanner />
        <Outlet />
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 bg-slate-900">
        AgriRenta Admin Escrow Management Console • Verified Platform Owner Account
      </footer>

    </div>
  );
};
