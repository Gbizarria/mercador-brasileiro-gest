
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'customer';
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // Check current session first
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Initial session found:', session.user.email);
          await fetchUserProfile(session.user);
        } else {
          console.log('No initial session found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        console.log('User session found, fetching profile');
        await fetchUserProfile(session.user);
      } else {
        console.log('No user session');
        setUser(null);
        setIsLoading(false);
      }
    });

    // Initialize auth
    initializeAuth();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      console.log('Fetching profile for user:', authUser.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, email, role')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.log('Profile fetch error:', error.message);
        // If profile doesn't exist, create it or use fallback
        if (error.code === 'PGRST116') {
          console.log('Profile not found, using fallback data');
        }
        
        // Use fallback data
        setUser({
          id: authUser.id,
          name: authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          role: 'customer'
        });
      } else {
        console.log('Profile fetched successfully:', profile);
        setUser({
          id: authUser.id,
          name: profile.name,
          email: profile.email,
          role: profile.role
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Fallback user data
      setUser({
        id: authUser.id,
        name: authUser.email?.split('@')[0] || 'Usuário',
        email: authUser.email || '',
        role: 'customer'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      
      if (!email || !password) {
        console.log('Login failed: Missing email or password');
        return false;
      }

      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        setIsLoading(false);
        return false;
      }

      console.log('Login successful for:', data.user?.email);
      // Don't set isLoading to false here - let the auth state change handle it
      return !!data.user;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      if (!name || !email || !password) {
        return false;
      }

      if (password.length < 6) {
        return false;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Registration error:', error.message);
        return false;
      }

      return !!data.user;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      await supabase.auth.signOut();
      setUser(null);
      setIsLoading(false);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
