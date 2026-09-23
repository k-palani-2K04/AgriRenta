import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { NotificationBanner } from './NotificationBanner';
import { useAuth } from '../context/AuthContext';
import { 
  Tractor, 
  Navigation, 
  Calendar, 
  Briefcase, 
  ClipboardList, 
  ShieldCheck 
} from 'lucide-react';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const role = user?.role || 'farmer';

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Body Shell */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Dynamic Page Content (with bottom padding on mobile for navbar) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
          <NotificationBanner />
          <Outlet />
        </main>

        {/* Smartphone Bottom Quick Navigation Bar (Visible on mobile viewports < lg) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-3 flex items-center justify-around shadow-lg">
          {role === 'farmer' && (
            <>
              <NavLink
                to="/marketplace"
                className={({ isActive }) =>
                  `flex flex-col items-center space-y-0.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    isActive ? 'text-emerald-600 font-extrabold' : 'text-slate-500'
                  }`
                }
              >
                <Tractor className="w-5 h-5" />
                <span>Marketplace</span>
              </NavLink>

              <NavLink
                to="/tracking"
                className={({ isActive }) =>
                  `flex flex-col items-center space-y-0.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    isActive ? 'text-emerald-600 font-extrabold' : 'text-slate-500'
                  }`
                }
              >
                <Navigation className="w-5 h-5" />
                <span>Live Map</span>
              </NavLink>

              <NavLink
                to="/my-bookings"
                className={({ isActive }) =>
                  `flex flex-col items-center space-y-0.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    isActive ? 'text-emerald-600 font-extrabold' : 'text-slate-500'
                  }`
                }
              >
                <Calendar className="w-5 h-5" />
                <span>Bookings</span>
              </NavLink>
            </>
          )}

          {role === 'provider' && (
            <>
              <NavLink
                to="/provider/dashboard"
                className={({ isActive }) =>
                  `flex flex-col items-center space-y-0.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    isActive ? 'text-emerald-600 font-extrabold' : 'text-slate-500'
                  }`
                }
              >
                <Briefcase className="w-5 h-5" />
                <span>Control Center</span>
              </NavLink>

              <NavLink
                to="/provider/requests"
                className={({ isActive }) =>
                  `flex flex-col items-center space-y-0.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    isActive ? 'text-emerald-600 font-extrabold' : 'text-slate-500'
                  }`
                }
              >
                <ClipboardList className="w-5 h-5" />
                <span>Requests</span>
              </NavLink>

              <NavLink
                to="/tracking"
                className={({ isActive }) =>
                  `flex flex-col items-center space-y-0.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    isActive ? 'text-emerald-600 font-extrabold' : 'text-slate-500'
                  }`
                }
              >
                <Navigation className="w-5 h-5" />
                <span>Map Nav</span>
              </NavLink>
            </>
          )}

          {role === 'admin' && (
            <>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `flex flex-col items-center space-y-0.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    isActive ? 'text-emerald-600 font-extrabold' : 'text-slate-500'
                  }`
                }
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Admin Hub</span>
              </NavLink>

              <NavLink
                to="/marketplace"
                className={({ isActive }) =>
                  `flex flex-col items-center space-y-0.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    isActive ? 'text-emerald-600 font-extrabold' : 'text-slate-500'
                  }`
                }
              >
                <Tractor className="w-5 h-5" />
                <span>Marketplace</span>
              </NavLink>

              <NavLink
                to="/tracking"
                className={({ isActive }) =>
                  `flex flex-col items-center space-y-0.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    isActive ? 'text-emerald-600 font-extrabold' : 'text-slate-500'
                  }`
                }
              >
                <Navigation className="w-5 h-5" />
                <span>Map Tracker</span>
              </NavLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
