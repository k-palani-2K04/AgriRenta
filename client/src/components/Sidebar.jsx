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
  ShieldCheck
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'farmer';
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Fetch pending requests badge count for provider with automated 3-second live polling
  useEffect(() => {
    if (user && user.role === 'provider') {
      const fetchPendingCount = async () => {
        try {
          const res = await axios.get('/api/bookings/provider-requests');
          if (res.data.success) {
            setPendingRequestsCount(res.data.pendingCount || 0);
          }
        } catch (err) {
          console.error('Error fetching pending requests count:', err);
        }
      };

      fetchPendingCount();
      const interval = setInterval(fetchPendingCount, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const navItems = [
    {
      title: 'Marketplace',
      path: '/marketplace',
      icon: Tractor,
      roles: ['farmer']
    },
    {
      title: 'My Bookings',
      path: '/my-bookings',
      icon: Calendar,
      roles: ['farmer']
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
      icon: Bell,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
      roles: ['provider']
    }
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* User Card inside Sidebar */}
        {user && (
          <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 flex items-center space-x-3">
            <div className="bg-indigo-600 text-white rounded-2xl p-2.5 shadow-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account Profile</p>
              <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-[11px] text-indigo-700 font-semibold truncate">
                {user.village}, {user.district}
              </p>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-2xl transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-3 shrink-0" />
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
