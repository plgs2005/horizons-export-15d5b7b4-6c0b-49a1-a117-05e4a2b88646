
    import React from 'react';
    import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
    import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout.jsx';
    import AdminOverview from '@/components/admin/tabs/AdminOverview.jsx';
    import AdminUserManagement from '@/components/admin/tabs/AdminUserManagement.jsx';
    import AdminBetManagement from '@/components/admin/tabs/AdminBetManagement.jsx';
    import AdminSystemSettings from '@/components/admin/tabs/AdminSystemSettings.jsx';
    import AdminReports from '@/components/admin/tabs/AdminReports.jsx';
    import AdminNotifications from '@/components/admin/tabs/AdminNotifications.jsx';
    import AdminTerminal from '@/components/admin/AdminTerminal.jsx';

    const adminTabs = [
      { path: '', element: <AdminOverview />, title: 'Visão Geral', exact: true },
      { path: 'users', element: <AdminUserManagement />, title: 'Gerenciamento de Usuários' },
      { path: 'bets', element: <AdminBetManagement />, title: 'Gerenciamento de Apostas' },
      { path: 'settings', element: <AdminSystemSettings />, title: 'Configurações do Sistema' },
      { path: 'reports', element: <AdminReports />, title: 'Relatórios e Análises' },
      { path: 'notifications', element: <AdminNotifications />, title: 'Notificações' },
      { path: 'terminal', element: <AdminTerminal />, title: 'Terminal Admin' },
    ];

    const AdminDashboardPageContent = () => {
      const location = useLocation();
      
      const getPageTitle = () => {
        const currentPath = location.pathname.replace('/admin', '').replace(/^\//, ''); // remove /admin and leading slash
        const matchedTab = adminTabs.find(tab => tab.path === currentPath);
        return matchedTab ? matchedTab.title : 'Painel Administrativo';
      };

      return (
        <AdminDashboardLayout pageTitle={getPageTitle()}>
           <Routes>
              {adminTabs.map(tab => (
                <Route 
                  key={tab.path || 'index'} 
                  index={tab.exact} 
                  path={tab.exact ? undefined : tab.path} 
                  element={tab.element} 
                />
              ))}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </AdminDashboardLayout>
      );
    };
        
    const AdminDashboard = () => {
      return <AdminDashboardPageContent />;
    };

    export default AdminDashboard;
  