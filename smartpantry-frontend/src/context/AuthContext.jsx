import { createContext, useState, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );

  const register = async (userData) => {
    const res = await API.post('/auth/register/', userData);
    return res.data;
  };

  // Returns either { requires2fa: true, email } — caller should show the
  // OTP entry step and call verifyOtp() next — or the logged-in user object
  // if 2FA wasn't required.
  const login = async (email, password) => {
    const res = await API.post('/auth/login/', { email, password });

    if (res.data.requires_2fa) {
      return { requires2fa: true, email: res.data.email };
    }

    const { access, refresh, user: userData } = res.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const verifyOtp = async (email, otp) => {
    const res = await API.post('/auth/verify-otp/', { email, otp });
    const { access, refresh, user: userData } = res.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, verifyOtp, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);