import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { STATES_AND_DISTRICTS, DEFAULT_STATE, DEFAULT_DISTRICT } from '../data/districts';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('agrirenta_token') || null);
  const [loading, setLoading] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [selectedState, setSelectedState] = useState(DEFAULT_STATE);
  const [selectedDistrict, setSelectedDistrict] = useState(DEFAULT_DISTRICT);

  const [userLocation, setUserLocation] = useState(null);

  // Set default axios Auth header cleanly in useEffect
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Reverse Geocoding Helper: Converts browser GPS (lat, lng) to State & District
  const detectLiveLocation = async () => {
    if (!navigator.geolocation) return null;
    setDetectingLocation(true);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            setUserLocation({ latitude, longitude });
            const res = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            if (res.data && res.data.address) {
              const addr = res.data.address;
              const detectedStateName = addr.state || '';
              const detectedDistName = addr.state_district || addr.county || addr.city || addr.district || '';

              // Match against known states
              const matchedState = Object.keys(STATES_AND_DISTRICTS).find(
                s => s.toLowerCase() === detectedStateName.toLowerCase()
              ) || selectedState;

              const availableDistricts = STATES_AND_DISTRICTS[matchedState] || [];
              const matchedDistrict = availableDistricts.find(
                d => detectedDistName.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(detectedDistName.toLowerCase())
              ) || availableDistricts[0] || selectedDistrict;

              setSelectedState(matchedState);
              setSelectedDistrict(matchedDistrict);
              resolve({ state: matchedState, district: matchedDistrict, latitude, longitude });
              return;
            }
          } catch (e) {
            console.warn('[AuthContext] Reverse geocoding failed:', e);
          } finally {
            setDetectingLocation(false);
          }
          resolve(null);
        },
        (err) => {
          console.warn('[AuthContext] Geolocation permission denied:', err);
          setDetectingLocation(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  };

  // Load User profile on initial mount or token change
  useEffect(() => {
    const fetchMe = async () => {
      // Always trigger live GPS location detection by default on app mount
      detectLiveLocation();

      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get('/api/auth/me');
        if (response.data.success) {
          const userData = response.data.user;
          setUser(userData);
          if (userData.state) setSelectedState(userData.state);
          if (userData.district) setSelectedDistrict(userData.district);
          if (userData.location?.latitude && userData.location?.longitude) {
            setUserLocation({ latitude: userData.location.latitude, longitude: userData.location.longitude });
          }
        }
      } catch (error) {
        console.error('[AuthContext] Session validation failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (phone, password) => {
    const response = await axios.post('/api/auth/login', { phone, password });
    if (response.data.success) {
      const newToken = response.data.token;
      const userData = response.data.user;
      localStorage.setItem('agrirenta_token', newToken);
      setToken(newToken);
      setUser(userData);
      if (userData.state) setSelectedState(userData.state);
      if (userData.district) setSelectedDistrict(userData.district);
      if (userData.location?.latitude && userData.location?.longitude) {
        setUserLocation({ latitude: userData.location.latitude, longitude: userData.location.longitude });
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return userData;
    }
  };

  const register = async (userData) => {
    const response = await axios.post('/api/auth/register', userData);
    if (response.data.success) {
      const newToken = response.data.token;
      const newUser = response.data.user;
      localStorage.setItem('agrirenta_token', newToken);
      setToken(newToken);
      setUser(newUser);
      if (newUser.state) setSelectedState(newUser.state);
      if (newUser.district) setSelectedDistrict(newUser.district);
      if (newUser.location?.latitude && newUser.location?.longitude) {
        setUserLocation({ latitude: newUser.location.latitude, longitude: newUser.location.longitude });
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return newUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('agrirenta_token');
    setToken(null);
    setUser(null);
    setUserLocation(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        detectingLocation,
        selectedState,
        setSelectedState,
        selectedDistrict,
        setSelectedDistrict,
        userLocation,
        setUserLocation,
        detectLiveLocation,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
