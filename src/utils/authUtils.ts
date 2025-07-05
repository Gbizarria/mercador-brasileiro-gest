
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { AuthUser } from '@/types/auth';

export const fetchUserProfile = async (authUser: User): Promise<AuthUser> => {
  console.log('Fetching profile for user:', authUser.id);
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('name, email, role')
    .eq('id', authUser.id)
    .single();

  if (error) {
    console.log('Profile fetch error:', error.message);
    
    if (error.code === 'PGRST116') {
      console.log('Profile not found, using fallback data');
    }
    
    // Use fallback data
    return {
      id: authUser.id,
      name: authUser.email?.split('@')[0] || 'Usuário',
      email: authUser.email || '',
      role: 'customer'
    };
  }

  console.log('Profile fetched successfully:', profile);
  return {
    id: authUser.id,
    name: profile.name,
    email: profile.email,
    role: profile.role
  };
};

export const loginUser = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log('Attempting login for:', email);
    
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
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

export const registerUser = async (name: string, email: string, password: string): Promise<boolean> => {
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

export const logoutUser = async (): Promise<void> => {
  try {
    console.log('Logging out user');
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};
