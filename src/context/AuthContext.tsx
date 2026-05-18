import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Define the precise structure matching your new user_details table
export interface UserDetails {
  id: string;
  full_name: string;
  mobile_number: string;
  email_address: string;
  address: string;
  role: string;
  created_at: string;
  is_admin?: boolean | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserDetails | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  signInAsAdmin: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  signInAsAdmin: async () => false,
  refreshProfile: async () => {},
});

// We keep these mock variables so your old test buttons don't crash the app
const mockAdminUser = {
  id: 'admin-1020',
  email: 'admin@local',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  phone: undefined,
  created_at: new Date().toISOString(),
} as User;

const mockAdminProfile = {
  id: 'admin-1020',
  full_name: 'Admin',
  mobile_number: '',
  email_address: 'admin@local',
  address: '',
  role: 'admin',
  created_at: new Date().toISOString(),
  is_admin: true,
} as UserDetails;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDetails | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const getStoredAdmin = () => typeof window !== 'undefined' && sessionStorage.getItem('mock_admin_auth') === '1';

  // --- 100% CONNECTED TO YOUR SINGLE USER_DETAILS TABLE ---
  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_details')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user details:", error.message);
    }

    if (data) {
      setProfile(data);
      // This single line replaces the old admins table check!
      setIsAdmin(data.is_admin === true); 
    }
  }

  async function refreshProfile() {
    if (user) {
      await fetchProfile(user.id);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const storedAdmin = getStoredAdmin();
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        // We removed the old checkAdmin function here because the table is gone
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else if (storedAdmin) {
        setUser(mockAdminUser);
        setProfile(mockAdminProfile);
        setIsAdmin(true);
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const storedAdmin = getStoredAdmin();
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        (async () => {
          await fetchProfile(session.user.id);
          setLoading(false);
        })();
      } else if (storedAdmin) {
        setUser(mockAdminUser);
        setProfile(mockAdminProfile);
        setIsAdmin(true);
        setLoading(false);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('mock_admin_auth');
    }
    if (session) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  }

  // We keep this function alive so old buttons don't throw an error when clicked
  async function signInAsAdmin() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mock_admin_auth', '1');
    }
    setUser(mockAdminUser);
    setProfile(mockAdminProfile);
    setIsAdmin(true);
    return true;
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isAdmin,
        loading,
        signOut,
        signInAsAdmin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}