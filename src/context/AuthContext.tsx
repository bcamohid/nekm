import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
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

const mockAdminUser = {
  id: 'admin-1020',
  email: 'admin@local',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  phone: undefined,
  created_at: new Date().toISOString(),
  last_sign_in_at: undefined,
  confirmation_sent_at: undefined,
  confirmed_at: undefined,
  email_confirmed_at: undefined,
  phone_confirmed_at: undefined,
  factor_setup: undefined,
} as User;

const mockAdminProfile = {
  id: 'admin-1020',
  full_name: 'Admin',
  mobile_number: '',
  email_address: 'admin@local',
  address: '',
  role: 'farmer',
  created_at: new Date().toISOString(),
} as Profile;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const getStoredAdmin = () => typeof window !== 'undefined' && sessionStorage.getItem('mock_admin_auth') === '1';

async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data);
      // Simply set isAdmin based on the profile data!
      setIsAdmin(data.is_admin === true); 
    }
    setLoading(false);
  }

  async function checkAdmin(userId: string) {
    const { data } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    setIsAdmin(!!data);
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
        Promise.all([fetchProfile(session.user.id), checkAdmin(session.user.id)]).finally(() =>
          setLoading(false)
        );
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
          await Promise.all([fetchProfile(session.user.id), checkAdmin(session.user.id)]);
        })();
      } else if (storedAdmin) {
        setUser(mockAdminUser);
        setProfile(mockAdminProfile);
        setIsAdmin(true);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
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
