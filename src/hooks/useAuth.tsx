import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Fetch profile data when user logs in
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id, session.user.email || '');
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setLoading(false); // Only set loading false when no user
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setLoading(false); // Only set loading false when no user
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        setLoading(false); // Set loading false even on error
        return;
      }

      if (data) {
        setProfile(data);
        setIsAdmin(data.role === 'admin');
      } else {
        // Profile doesn't exist, create it with safe upsert
        try {
          const { data: newProfile } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              email: email,
              role: 'user'
            })
            .select()
            .single();
          
          if (newProfile) {
            setProfile(newProfile);
            setIsAdmin(newProfile.role === 'admin');
          }
        } catch (upsertError) {
          console.error('Error creating profile:', upsertError);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false); // Always set loading false after profile fetch attempt
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    profile,
    isAdmin,
    loading,
    signOut,
  };
};