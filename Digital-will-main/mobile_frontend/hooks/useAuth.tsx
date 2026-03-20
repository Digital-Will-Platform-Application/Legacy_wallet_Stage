import { useState, useEffect, createContext, useContext, useRef, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/** Same as Legacy_wallet-main (web): only this email gets admin panel. Password is validated by Supabase at login (e.g. Varun@2005). */
const SUPER_ADMIN_CREDENTIAL_EMAIL = 'admin@legacywallet.com';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminLoading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; data?: { user: User | null; session: Session | null } }>;
  signInWithOtpPhone: (phone: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  updateUser: (data: { full_name?: string }) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const isSigningOutRef = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isSigningOutRef.current && session != null) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) setAdminLoading(true);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (isSigningOutRef.current) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user?.email) setAdminLoading(true);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.email) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setAdminLoading(false);
      return;
    }
    setAdminLoading(true);
    const emailLower = user.email.trim().toLowerCase();
    const envAdmin = (process.env.EXPO_PUBLIC_ADMIN_EMAIL as string | undefined)?.trim().toLowerCase();
    const isEnvAdmin = Boolean(envAdmin && emailLower === envAdmin);
    const isCredentialAdmin = emailLower === SUPER_ADMIN_CREDENTIAL_EMAIL;
    void (async () => {
      try {
        const { data } = await supabase.from('admin_emails').select('email, role');
        const rows = data as Array<{ email: string; role: string }> | null;
        const row = rows?.find((r) => (r.email ?? '').trim().toLowerCase() === emailLower);
        setIsAdmin(!!row || isEnvAdmin || isCredentialAdmin);
        setIsSuperAdmin(row?.role === 'super_admin' || isEnvAdmin || isCredentialAdmin);
      } catch {
        setIsAdmin(isEnvAdmin || isCredentialAdmin);
        setIsSuperAdmin(isEnvAdmin || isCredentialAdmin);
      } finally {
        setAdminLoading(false);
      }
    })();
  }, [user?.id, user?.email]);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    const emailLower = email.trim().toLowerCase();
    if (emailLower === SUPER_ADMIN_CREDENTIAL_EMAIL) {
      return { error: new Error('This email is reserved for administration. You cannot create an account with it.') };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, ...(phone ? { phone } : {}) },
      },
    });
    return { error: error ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ?? null, data: data ? { user: data.user, session: data.session } : undefined };
  };

  const signInWithOtpPhone = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`,
    });
    return { error: error ?? null };
  };

  const signOut = async () => {
    isSigningOutRef.current = true;
    setSession(null);
    setUser(null);
    setLoading(false);
    supabase.auth.signOut().finally(() => {
      isSigningOutRef.current = false;
    });
    setTimeout(() => {
      isSigningOutRef.current = false;
    }, 3000);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error ?? null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ?? null };
  };

  const updateUser = async (data: { full_name?: string }) => {
    const { error } = await supabase.auth.updateUser({ data });
    return { error: error ?? null };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, isSuperAdmin, adminLoading, signUp, signIn, signInWithOtpPhone, signOut, resetPassword, updatePassword, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
