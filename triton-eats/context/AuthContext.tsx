import { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  hasProfile: boolean | null;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetProfileFlag: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
    hasProfile: null,
  });

  async function checkProfile(userId: string) {
    const { data } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    return !!data;
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      let hasProfile: boolean | null = null;
      if (session?.user) {
        hasProfile = await checkProfile(session.user.id);
      }
      setState({ session, user: session?.user ?? null, loading: false, hasProfile });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        let hasProfile: boolean | null = null;
        if (session?.user) {
          hasProfile = await checkProfile(session.user.id);
        }
        setState({ session, user: session?.user ?? null, loading: false, hasProfile });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (state.user) {
      const hasProfile = await checkProfile(state.user.id);
      setState((prev) => ({ ...prev, hasProfile }));
    }
  };

  const resetProfileFlag = () => {
    setState((prev) => ({ ...prev, hasProfile: false }));
  };

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, refreshProfile, resetProfileFlag }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
