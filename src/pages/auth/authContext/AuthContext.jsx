// src/utils/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import supabase from '@/config/supabaseClient';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCurrentUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setCurrentUser(session?.user || null);
        setLoading(false);
      }
    );

    // Cleanup on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Login with email and password
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error logging in:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Sign up new user
  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: '', // Redirect link after confirmation
          },
      });

      if (error) throw error;
      return { 
        success: true, 
        user: data.user,
        message: "Confirmation email sent. Please check your inbox." 
      };
    } catch (error) {
      console.error('Error signing up:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  const value = {
    currentUser,
    session,
    login,
    signUp,
    logout,
    isAuthenticated: !!currentUser,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};