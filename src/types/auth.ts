
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'customer';
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
