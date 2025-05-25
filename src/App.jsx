
    import React from 'react';
    import { Routes, Route, Navigate, useLocation as useReactRouterLocation } from 'react-router-dom';
    import { Toaster } from '@/components/ui/toaster';
    import Layout from '@/components/Layout';
    import HomePage from '@/pages/HomePage';
    import BetsPage from '@/pages/BetsPage';
    import CreateBetPage from '@/pages/CreateBetPage';
    import ProfilePage from '@/pages/ProfilePage';
    import BetDetailPage from '@/pages/BetDetailPage';
    import AuthPage from '@/pages/AuthPage';
    import AdminDashboard from '@/pages/AdminDashboard';
    import { AuthProvider, useAuth } from '@/contexts/AuthContext.jsx';
    import { BetProvider } from '@/contexts/BetContext.jsx';
    import { ThemeProvider, useTheme } from '@/contexts/ThemeContext.jsx';
    import ProfileCompletionModal from '@/components/ProfileCompletionModal.jsx';
    import SplashScreenComponent from '@/components/SplashScreen.jsx';
    import { AnimatePresence } from 'framer-motion';

    function ProtectedRoute({ children, adminOnly = false, managerOnly = false }) {
      const { isAuthenticated, user, isAdmin, isManager, loading, showProfileCompletionModal } = useAuth(); 
      const location = useReactRouterLocation();
      
      if (loading) { 
        return null; 
      }

      if (showProfileCompletionModal && user) {
        if (location.pathname === '/perfil') {
            return children;
        }
        return <Navigate to="/perfil" state={{ from: location }} replace />;
      }
      
      if (!isAuthenticated && !user) { 
        return <Navigate to="/auth" state={{ from: location }} replace />;
      }

      if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
      }

      if (managerOnly && !isManager) { // Check for manager role if managerOnly is true
        return <Navigate to="/apostas" replace />;
      }
      
      return children;
    }

    function AppRoutes() {
      const { showProfileCompletionModal, user } = useAuth();
      const location = useReactRouterLocation();

      return (
        <Layout>
          <Routes location={location.state?.background || location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/apostas" 
              element={<BetsPage />} 
            />
            <Route 
              path="/criar-aposta" 
              element={<ProtectedRoute managerOnly={true}><CreateBetPage /></ProtectedRoute>}
            />
            <Route 
              path="/perfil" 
              element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
            />
            <Route 
              path="/aposta/:id" 
              element={<BetDetailPage />} 
            />
            <Route 
              path="/admin/*" 
              element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <AnimatePresence>
            {showProfileCompletionModal && user && (
              <ProfileCompletionModal />
            )}
          </AnimatePresence>
        </Layout>
      );
    }
    
    function AppWrapper() {
      const { loading: authLoading } = useAuth(); 
      const { theme } = useTheme();

      React.useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
      }, [theme]);

      if (authLoading) {
        return <SplashScreenComponent />;
      }

      return (
        <>
          <AppRoutes />
          <Toaster />
        </>
      );
    }

    function App() {
      return (
        <AuthProvider>
          <BetProvider>
            <ThemeProvider>
              <AppWrapper />
            </ThemeProvider>
          </BetProvider>
        </AuthProvider>
      );
    }

    export default App;
  