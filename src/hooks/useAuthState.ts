
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { AuthUser } from '@/types/auth';
import { fetchUserProfile } from '@/utils/authUtils';

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('useAuthState: Setting up auth state listener');
    
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
          await handleUserSession(session.user);
        } else {
          console.log('No initial session found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        console.log('User session found, fetching profile');
        await handleUserSession(session.user);
      } else {
        console.log('No user session');
        setUser(null);
        setIsLoading(false);
      }
    });

    initializeAuth();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const handleUserSession = async (authUser: User) => {
    try {
      const userProfile = await fetchUserProfile(authUser);
      setUser(userProfile);
    } catch (error) {
      console.error('Error handling user session:', error);
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

  return { user, setUser, isLoading, setIsLoading };
};
