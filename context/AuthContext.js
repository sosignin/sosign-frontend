'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state
  const [walletBalance, setWalletBalance] = useState(0);

  // Function to fetch current user
  const fetchUser = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);

        // Check if token exists and is not expired
        if (userData.token) {
          try {
            // Decode the JWT token to check expiration
            const tokenPayload = JSON.parse(atob(userData.token.split('.')[1]));
            const currentTime = Date.now() / 1000;

            if (tokenPayload.exp && tokenPayload.exp < currentTime) {
              // Token is expired, clear it
              console.log('Token expired, clearing user data');
              localStorage.removeItem('user');
              setUser(null);
            } else {
              setUser(userData);
              
              // Fetch fresh profile data to keep state in sync (hasPassword flag, etc.)
              const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
              axios.get(`${backendUrl}/api/users/profile`, {
                headers: {
                  'Authorization': `Bearer ${userData.token}`,
                },
              }).then(response => {
                const freshData = { ...userData, ...response.data };
                setUser(freshData);
                localStorage.setItem('user', JSON.stringify(freshData));
              }).catch(err => {
                console.error('Failed to fetch fresh profile:', err);
                if (err.response?.status === 401) {
                  logout();
                }
              });
            }
          } catch (tokenError) {
            // Token is malformed, clear it
            console.error('Invalid token format, clearing user data:', tokenError);
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          // No token, clear user data
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Failed to retrieve user from local storage:', error);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;

      const userData = JSON.parse(storedUser);
      if (!userData.token) return;

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await axios.get(`${backendUrl}/api/wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`,
        },
      });

      if (response.data && typeof response.data.balance === 'number') {
        setWalletBalance(response.data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/users/login', { email, password });
      const userData = response.data;

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData)); // Store full user data including token
      return userData;
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const signup = async (name, designation, email, mobileNumber, password) => {
    try {
      const response = await axios.post('/api/users/register', {
        name,
        designation,
        email,
        mobileNumber,
        password,
      });
      const userData = response.data;

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData)); // Store full user data including token
      return userData;
    } catch (error) {
      console.error('Signup failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/users/logout'); // Call backend logout endpoint
    } catch (error) {
      console.error('Logout failed:', error.response?.data?.message || error.message);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  // Function to clear user data (useful for token expiration)
  const clearUser = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Function to update user profile
  const updateProfile = async (formData) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser?.token) {
        throw new Error('Not authenticated');
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await axios.put(`${backendUrl}/api/users/profile`, formData, {
        headers: {
          'Authorization': `Bearer ${storedUser.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedData = response.data;

      // Merge updated data with existing user data
      const newUserData = {
        ...storedUser,
        name: updatedData.name,
        bio: updatedData.bio,
        profilePicture: updatedData.profilePicture,
        designation: updatedData.designation,
        mobileNumber: updatedData.mobileNumber,
        socialLinks: updatedData.socialLinks,
        aadhaarKyc: updatedData.aadhaarKyc || storedUser.aadhaarKyc,
      };

      setUser(newUserData);
      localStorage.setItem('user', JSON.stringify(newUserData));
      return updatedData;
    } catch (error) {
      console.error('Profile update failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser?.token) {
        throw new Error('Not authenticated');
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await axios.put(`${backendUrl}/api/users/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${storedUser.token}`,
        },
      });

      const updatedData = response.data;
      
      // Update local state if successful
      if (updatedData.hasPassword) {
        const newUserData = { ...storedUser, hasPassword: true };
        setUser(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData));
      }

      return updatedData;
    } catch (error) {
      console.error('Password change failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Password update failed');
    }
  };

  const googleLogin = async (googleUser) => {
    try {
      const response = await axios.post('/api/users/google-auth', {
        email: googleUser.email,
        name: googleUser.displayName,
        photoURL: googleUser.photoURL,
        uid: googleUser.uid,
      });
      const userData = response.data;

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData)); // Store full user data including token
      return userData;
    } catch (error) {
      console.error('Google Login failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Google Login failed');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Fetch wallet balance when user logs in
  useEffect(() => {
    if (user) {
      fetchWalletBalance();
    } else {
      setWalletBalance(0);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, signup, loading, googleLogin, clearUser, updateProfile, changePassword, walletBalance, fetchWalletBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

