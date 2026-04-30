// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from '../axiosConfig';

// 1. Create the Context
const AuthContext = createContext();

// 2. Create a custom hook so we can easily use this context in other files
export const useAuth = () => useContext(AuthContext);

// 3. Create the Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When the app first loads, check if we saved a user profile in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login Function
  const login = async (email, password) => {
    // This automatically saves the JWT cookie
    const response = await axios.post('/auth/login', { email, password });
    setUser(response.data);
    localStorage.setItem('user', JSON.stringify(response.data));
  };

  // Register Function
  const register = async (name, email, password, role) => {
    const response = await axios.post('/auth/register', { name, email, password, role });
    setUser(response.data);
    localStorage.setItem('user', JSON.stringify(response.data));
  };

  // Logout Function
  const logout = async () => {
    await axios.post('/auth/logout'); // Tells backend to destroy the cookie
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};