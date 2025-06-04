import { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/auth';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Sign in function
  const signIn = async (login, password) => {
    try {
      setLoading(true);
      setError(null);

      // Use the auth API to sign in
      const response = await authApi.signIn(login, password);
      setUser(response.data);

      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Use the auth API to sign up
      const response = await authApi.signUp(name, email, password);
      setUser(response.user);

      return response.user;
    } catch (err) {
      setError(err.message || 'Failed to sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the auth API to sign out
      await authApi.signOut();
      setUser(null);
    } catch (err) {
      setError(err.message || 'Failed to sign out');
      // Still remove user from state even if API call fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  };


  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};