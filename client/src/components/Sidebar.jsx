import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Tractor, 
  PlusCircle, 
  Calendar, 
  TrendingUp, 
  CloudSun, 
  UserCheck,
  HelpCircle,
  Briefcase,
  Navigation,
  Bell,
  ClipboardList,
  ShieldCheck,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'farmer';
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

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

  const navItems = [
    {
      title: 'Admin Escrow Hub',
      path: '/admin/dashboard',
      icon: ShieldCheck,
      roles: ['admin']
    },
    {
      title: 'Marketplace',
      path: '/marketplace',
      icon: Tractor,
      roles: ['farmer', 'admin']
    },
    {
      title: 'My Bookings',
      path: '/my-bookings',
      icon: Calendar,
      roles: ['farmer', 'admin']
    },
    {
      title: 'Live Geo Tracker',
      path: '/tracking',
      icon: Navigation,
      roles: ['farmer', 'provider', 'admin']
    },
    {
      title: 'Provider Control Center',
      path: '/provider/dashboard',
      icon: Briefcase,
      roles: ['provider']
    },
    {
      title: 'Rental Requests',
      path: '/provider/requests',
      icon: ClipboardList,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
      roles: ['provider']
    }
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Dark Backdrop (z-40 behind sidebar z-50) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer Panel (z-50 on top of backdrop) */}
      <aside
        className={`fixed lg:static top-0 lg:top-0 h-full lg:h-full left-0 z-50 lg:z-10 w-72 lg:w-64 shrink-0 bg-white border-r border-slate-200/80 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header with Close Button */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between lg:hidden shrink-0">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-600 p-1.5 rounded-xl text-white">
              <Tractor className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-base tracking-tight">AgriRenta Menu</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card inside Sidebar */}
        {user && (
          <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center space-x-3 shrink-0" data-testid="sidebar-user-profile">
            <div className="bg-emerald-600 text-white rounded-2xl p-2.5 shadow-xs shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account Profile</p>
              <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-[11px] text-emerald-700 font-semibold truncate">
                {user.village}, {user.district}
              </p>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Main Navigation
          </p>
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const testId = `sidebar-nav-${item.path.replace(/\//g, '-').replace(/^-/, '')}`;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                data-testid={testId}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-3 text-xs sm:text-sm font-bold rounded-2xl transition-all ${
                    isActive
                      ? 'bg-[#E8F5E9] text-[#0F763E] font-extrabold border-l-4 border-[#0F763E] shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center">
                  <Icon className="w-4.5 h-4.5 mr-3 shrink-0" />
                  <span>{item.title}</span>
                </div>

                {item.badge && (
                  <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
