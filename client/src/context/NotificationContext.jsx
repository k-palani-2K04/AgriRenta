import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const showBrowserPush = (title, body) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/vite.svg', tag: title });
  } catch {
    // Ignore browsers that block constructor without service worker
  }
};

export const NotificationProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [banner, setBanner] = useState(null);
  const [pushEnabled, setPushEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const seenIdsRef = useRef(new Set());

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/notifications?unread=true');
      if (!res.data.success) return;
      const list = res.data.notifications || [];
      setUnreadCount(res.data.unreadCount || 0);
      setNotifications(list);

      const fresh = list.filter((n) => !seenIdsRef.current.has(n._id));
      if (fresh.length > 0) {
        const latest = fresh[0];
        setBanner(latest);
        showBrowserPush(latest.title, latest.body);
        fresh.forEach((n) => seenIdsRef.current.add(n._id));
      }
    } catch {
      // Silent poll failures (offline / unauthenticated)
    }
  }, [token]);

  const enablePush = async () => {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    setPushEnabled(granted);
    if (granted) {
      showBrowserPush('AgriRenta alerts on', 'You will receive payment, dispatch, and payout updates.');
    }
    return granted;
  };

  const dismissBanner = async () => {
    if (banner?._id) {
      try {
        await axios.put(`/api/notifications/${banner._id}/read`);
      } catch {
        /* ignore */
      }
    }
    setBanner(null);
    fetchNotifications();
  };

  const markAllRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setBanner(null);
      setUnreadCount(0);
      setNotifications([]);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!token || !user) {
      setNotifications([]);
      setUnreadCount(0);
      setBanner(null);
      return;
    }
    fetchNotifications();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchNotifications();
    }, 8000);
    return () => clearInterval(interval);
  }, [token, user, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        banner,
        pushEnabled,
        enablePush,
        dismissBanner,
        markAllRead,
        fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
};
