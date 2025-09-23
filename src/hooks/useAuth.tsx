import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { toast } = useToast();

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
    if (isSigningOut) return; // Prevent multiple calls
    
    
    setIsSigningOut(true);
    
    try {
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      
      // Try to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // Ignore "session_not_found" errors - user is already signed out
      if (error && !error.message?.includes('session_not_found')) {
        console.error('SignOut error (non-critical):', error);
      }
      
      // Clear localStorage as fallback
      localStorage.removeItem('sb-xgvvcovmjqcpfmghawdy-auth-token');
      
      toast({
        title: "Wylogowano pomyślnie",
        description: "Zostałeś wylogowany z panelu administratora.",
      });
      
      // Redirect to home page
      window.location.href = '/';
      
    } catch (error) {
      console.error('Unexpected signOut error:', error);
      
      // Even if there's an error, clear local state and redirect
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      localStorage.removeItem('sb-xgvvcovmjqcpfmghawdy-auth-token');
      
      toast({
        title: "Wylogowano",
        description: "Sesja została zakończona.",
      });
      
      window.location.href = '/';
    } finally {
      setIsSigningOut(false);
    }
  };

  return {
    user,
    session,
    profile,
    isAdmin,
    loading,
    isSigningOut,
    signOut,
  };
};