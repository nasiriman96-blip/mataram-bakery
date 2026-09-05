import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Mengelola sesi login dan profil (termasuk role: "user" / "admin")
 * dari tabel public.profiles yang otomatis dibuat saat user mendaftar.
 */
export function useAuth() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile(userId) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (active) {
        setProfile(data || null);
        setLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    profile,
    loading,
    isAdmin: profile?.role === "admin",
    signOut: () => supabase.auth.signOut(),
  };
}
