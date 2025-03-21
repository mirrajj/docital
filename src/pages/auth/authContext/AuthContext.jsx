import { createContext, useContext, useState, useEffect } from 'react';
import supabase from '@/config/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const fetchUserRole = async (userId) => {
    if (!userId) return null;
    
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Role fetch timeout')), 10000)
      );
      
      // The actual query
      const queryPromise = supabase
        .from('employee')
        .select(`
          role,
          roles:role (
            role_id,
            role_name
          )
        `)
        .eq('id', userId)
        .single();
      
      // Race between timeout and query
      const { data, error } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]);
      
      if (error) {
        console.error("Role query error:", error);
        return null;
      }
      
      if (data) {
        console.log(data.roles.role_name)
        return {
          roleId: data.role,
          roleName: data.roles?.role_name || null
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCurrentUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    // Listen for auth changes
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    console.log("Auth state changed:", event);
    
    // Update session immediately
    setSession(session);
    
    // Handle specific auth events
    if (event === 'SIGNED_IN') {
      console.log('User signed in!');
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out!');
      setCurrentUser(null);
      setLoading(false);
      return; // Exit early for sign out
    }
    
    if (session?.user) {
      try {
        const role = await fetchUserRole(session.user.id);
        const userWithRole = { 
          ...session.user,
          roleId: role?.roleId || null,
          roleName: role?.roleName || null
        };
        setCurrentUser(userWithRole);
      } catch (err) {
        // Still set the user if role fetch fails
        console.error("Role fetch failed:", err);
        setCurrentUser(session.user);
      }
    } else {
      setCurrentUser(null);
    }
    
    // Always set loading to false at the end
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