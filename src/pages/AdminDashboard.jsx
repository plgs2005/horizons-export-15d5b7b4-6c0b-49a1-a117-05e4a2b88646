
    import React from 'react';
    import { Routes, Route, Navigate } from 'react-router-dom';
    import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout.jsx';
    import AdminOverview from '@/components/admin/tabs/AdminOverview.jsx';
    import AdminUserManagement from '@/components/admin/tabs/AdminUserManagement.jsx';
    import AdminBetManagement from '@/components/admin/tabs/AdminBetManagement.jsx';
    import AdminSystemSettings from '@/components/admin/tabs/AdminSystemSettings.jsx';
    // Placeholder para futuras abas
    // import AdminReports from '@/components/admin/tabs/AdminReports.jsx';
    // import AdminNotifications from '@/components/admin/tabs/AdminNotifications.jsx';

    const AdminDashboard = () => {
      // O AdminDashboard agora atua como um container para o layout e as rotas aninhadas.
      // A lógica de abas e conteúdo específico foi movida para os componentes em /tabs/
      // e o AdminDashboardLayout gerencia a navegação lateral.

      // Se você quiser manter a navegação por Tabs dentro de cada rota aninhada,
      // essa lógica de Tabs pode ser colocada dentro de AdminDashboardLayout ou
      // cada componente de aba (AdminOverview, etc.) pode ser uma página completa.
      // Para este exemplo, estou assumindo que AdminDashboardLayout tem uma navegação
      // lateral e o <Outlet/> (ou {children} como está agora) renderiza o conteúdo da rota.

      // Para simplificar e alinhar com a estrutura de AdminDashboardLayout,
      // vamos usar rotas aninhadas para cada "aba" do painel.
      // O AdminDashboardLayout já tem links na sidebar.
      // O conteúdo principal será renderizado por <Outlet /> se usarmos rotas aninhadas
      // ou diretamente se passarmos children.

      // A estrutura atual de AdminDashboardLayout usa {children}.
      // Vamos passar os componentes das abas como children baseados na rota.
      // Ou, melhor ainda, usar <Outlet /> dentro de AdminDashboardLayout e definir rotas aninhadas aqui.

      return (
        <AdminDashboardLayout>
           <Routes>
                <Route index element={<AdminOverview />} /> 
                <Route path="users" element={<AdminUserManagement />} />
                <Route path="bets" element={<AdminBetManagement />} />
                <Route path="settings" element={<AdminSystemSettings />} />
                {/* Rotas futuras podem ser adicionadas aqui */}
                {/* <Route path="reports" element={<AdminReports />} /> */}
                {/* <Route path="notifications" element={<AdminNotifications />} /> */}
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </AdminDashboardLayout>
      );
    };

    export default AdminDashboard;
  