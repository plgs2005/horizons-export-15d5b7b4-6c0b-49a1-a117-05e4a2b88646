
    import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
    import { supabase, getCurrentUser, updateProfile as updateSupabaseProfile } from '@/lib/supabase.jsx';
    import { useNavigate, useLocation } from 'react-router-dom';

    const AuthContext = createContext(null);

    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    };

    export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [isAdmin, setIsAdmin] = useState(false);
      const [isManager, setIsManager] = useState(false); 
      const [loading, setLoading] = useState(true); 
      const [initialCheckDone, setInitialCheckDone] = useState(false); 
      const [showProfileCompletionModal, setShowProfileCompletionModal] = useState(false);
      const navigate = useNavigate();
      const location = useLocation(); 

      const processUserSession = useCallback(async (sessionUser) => {
        if (sessionUser) {
          const profile = await getCurrentUser(sessionUser.id);
          if (profile) {
            const fullUser = { ...sessionUser, ...profile };
            setUser(fullUser);
            setIsAdmin(fullUser.role === 'admin');
            setIsManager(fullUser.role === 'manager' || fullUser.role === 'admin');
            setShowProfileCompletionModal(!fullUser.name || !fullUser.pix_key);
            return fullUser;
          } else {
            setUser(sessionUser); 
            setIsAdmin(sessionUser.user_metadata?.role === 'admin');
            setIsManager(sessionUser.user_metadata?.role === 'manager' || sessionUser.user_metadata?.role === 'admin');
            setShowProfileCompletionModal(true); 
            return sessionUser;
          }
        } else {
          setUser(null);
          setIsAdmin(false);
          setIsManager(false);
          setShowProfileCompletionModal(false);
          return null;
        }
      }, []);

      const refreshAuthStatus = useCallback(async () => {
        setLoading(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          await processUserSession(session?.user || null);
        } catch (error) {
          console.error("AuthContext: Error in refreshAuthStatus:", error);
          await processUserSession(null); 
        } finally {
          setLoading(false);
        }
      }, [processUserSession]);

      useEffect(() => {
        let isMounted = true;
        
        const checkInitialSession = async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (isMounted) {
              await processUserSession(session?.user || null);
            }
          } catch (error) {
            console.error("AuthContext: Error in initial getSession:", error);
          } finally {
            if (isMounted) {
              setInitialCheckDone(true);
              setLoading(false); 
            }
          }
        };

        checkInitialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted || !initialCheckDone) return; 

          const sessionUser = session?.user || null;
          const processedUser = await processUserSession(sessionUser);

          if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
            if (processedUser && !processedUser.name && !processedUser.pix_key && location.pathname !== '/perfil') {
              // Modal will be shown by showProfileCompletionModal state
            } else if (processedUser && (processedUser.name && processedUser.pix_key)) {
              const from = location.state?.from?.pathname || '/apostas'; 
              if (location.pathname === '/auth' || location.pathname === '/') {
                navigate(from, { replace: true });
              }
            }
          } else if (event === 'SIGNED_OUT') {
            navigate('/auth', { replace: true });
          }
        });

        return () => {
          isMounted = false;
          if (authListener?.subscription) {
            authListener.subscription.unsubscribe();
          }
        };
      }, [processUserSession, navigate, location.state, location.pathname, initialCheckDone]);


      const signInWithMagicLink = async (email) => {
        try {
          const redirectTo = `${window.location.origin}/`;
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: redirectTo,
              shouldCreateUser: true,
            },
          });
          if (error) throw error;
          return true;
        } catch (error) {
          console.error('Error sending magic link:', error);
          return false;
        }
      };
      
      const verifyOtpCode = async (email, token) => {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'magiclink', 
          });
          if (error) throw error;
          if (data.session) {
             await processUserSession(data.session.user);
          }
          return { session: data.session, error: null };
        } catch (error) {
          console.error('Error verifying OTP:', error);
          return { session: null, error };
        }
      };


      const logout = async () => {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Error logging out:', error);
        }
      };
      
      const updateProfile = async (profileData) => {
        if (!user) return false;
        try {
          const success = await updateSupabaseProfile(user.id, profileData);
          if (success) {
            const { data: { session } } = await supabase.auth.getSession();
            await processUserSession(session?.user || null);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error updating profile in context:', error);
          return false;
        }
      };

      const value = {
        user,
        isAdmin,
        isManager,
        isAuthenticated: !!user && !showProfileCompletionModal, 
        loading: loading && !initialCheckDone, 
        signInWithMagicLink,
        verifyOtpCode,
        logout,
        updateProfile, 
        showProfileCompletionModal,
        setShowProfileCompletionModal,
        refreshAuthStatus 
      };

      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };
  