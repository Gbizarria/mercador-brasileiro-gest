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
    
    // Set up auth state listener first
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

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

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
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile');
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
      // Fallback without exposing internal error
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
      console.log('Creating profile for user:', authUser.id);
      
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
      } else {
        console.log('Profile created successfully');
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
      console.log('Attempting login for:', email);
      
      // Input validation
      if (!email || !password) {
        console.log('Login failed: Missing email or password');
        return false;
      }

      if (email.length > 254 || password.length > 128) {
        console.log('Login failed: Email or password too long');
        return false;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      console.log('Login successful for:', data.user?.email);
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
      console.log('Logging out user');
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout locally even if server call fails
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
