
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
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session:', !!session);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await fetchUserProfile(session.user);
        }
      }
    });

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          await fetchUserProfile(session.user);
        } else if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, email, role')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          await createUserProfile(authUser);
          return;
        }
        
        // Fallback to basic user info
        setUser({
          id: authUser.id,
          name: authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          role: 'customer'
        });
      } else {
        setUser({
          id: authUser.id,
          name: profile.name,
          email: profile.email,
          role: profile.role
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Fallback
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

  const createUserProfile = async (authUser: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          role: 'customer'
        });

      if (error) {
        console.error('Error creating profile:', error);
      }

      // Fetch the profile again
      await fetchUserProfile(authUser);
    } catch (error) {
      console.error('Error creating user profile:', error);
      // Set fallback user data
      setUser({
        id: authUser.id,
        name: authUser.email?.split('@')[0] || 'Usuário',
        email: authUser.email || '',
        role: 'customer'
      });
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Input validation
      if (!email || !password) {
        console.error('Email and password are required');
        return false;
      }

      if (email.length > 254 || password.length > 128) {
        console.error('Email or password too long');
        return false;
      }

      console.log('Attempting login for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      console.log('Login successful:', !!data.user);
      return !!data.user;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Input validation
      if (!name || !email || !password) {
        return false;
      }

      if (name.length > 100 || email.length > 254 || password.length > 128) {
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
          emailRedirectTo: `${window.location.origin}/login`
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
      console.log('Logging out...');
      
      // Clear user state immediately
      setUser(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      } else {
        console.log('Logout successful');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
