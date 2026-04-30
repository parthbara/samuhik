import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS } from '../lib/mockData';

// ── Demo Mode Toggle ────────────────────────────────────────────────────────
// Set to false and uncomment Supabase imports when you have a live backend.
const DEMO_MODE = true;

const AuthContext = createContext();

// ═══════════════════════════════════════════════════════════════════════════
//  DEMO AUTH PROVIDER — hardcoded users, no external dependencies
// ═══════════════════════════════════════════════════════════════════════════
const DemoAuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const saved = localStorage.getItem('samuhik_demo_user');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch { /* ignore corrupt data */ }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate network latency
    await new Promise(r => setTimeout(r, 600));

    const found = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      throw new Error('Invalid email or password. Try: admin@demo.com / demo1234');
    }

    // Strip password before storing in state
    const { password: _pw, ...safeProfile } = found;
    setProfile(safeProfile);
    localStorage.setItem('samuhik_demo_user', JSON.stringify(safeProfile));
    return true;
  };

  const logout = async () => {
    setProfile(null);
    localStorage.removeItem('samuhik_demo_user');
  };

  return (
    <AuthContext.Provider value={{ user: profile, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  SUPABASE AUTH PROVIDER — real Supabase auth (for production)
// ═══════════════════════════════════════════════════════════════════════════
const SupabaseAuthProvider = ({ children }) => {
  // Lazy-import supabase only when not in demo mode
  const [supabaseModule, setSupabaseModule] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../lib/supabase').then(mod => {
      setSupabaseModule(mod);
    });
  }, []);

  useEffect(() => {
    if (!supabaseModule) return;
    const { supabase } = supabaseModule;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(supabase, session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(supabase, currentUser.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabaseModule]);

  const fetchProfile = async (supabase, uid) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*, tenants(*)')
        .eq('supabase_uid', uid)
        .single();

      if (error) {
        // If profile doesn't exist, we might be a new user or error
        console.error('Error fetching profile:', error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    if (!supabaseModule) throw new Error('Supabase not loaded yet');
    const { error } = await supabaseModule.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return true;
  };

  const logout = async () => {
    if (supabaseModule) {
      await supabaseModule.supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  Exported Provider — auto-selects demo vs real
// ═══════════════════════════════════════════════════════════════════════════
export const AuthProvider = ({ children }) => {
  if (DEMO_MODE) {
    return <DemoAuthProvider>{children}</DemoAuthProvider>;
  }
  return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
};

export const useAuth = () => useContext(AuthContext);
