
    import React from 'react';
    import { NavLink } from 'react-router-dom';
    import { LayoutDashboard, Users, ListChecks, Settings, BarChart3, BellDot, LogOut, TerminalSquare } from 'lucide-react';
    import { useAuth } from '@/contexts/AuthContext';
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
    import { Button } from '@/components/ui/button';

    const AdminSidebarLink = ({ to, icon: Icon, label }) => (
      <NavLink
        to={to}
        end={to === "/admin"} // Use 'end' for exact matching of parent routes like '/admin' for overview
        className={({ isActive }) =>
          `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors
           ${isActive 
             ? 'bg-primary text-primary-foreground shadow-lg' 
             : 'text-slate-100 hover:bg-slate-700/50 hover:text-white'
           }`
        }
      >
        <Icon className="mr-3 h-5 w-5" />
        {label}
      </NavLink>
    );

    const AdminDashboardLayout = ({ children, pageTitle }) => {
      const { user, logout } = useAuth();

      const getAvatarFallback = (name) => {
        if (!name) return "A";
        const parts = name.split(" ");
        if (parts.length > 1 && parts[0] && parts[parts.length -1]) {
          return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        if (name && name.length >=2) return name.substring(0, 2).toUpperCase();
        if (name && name.length === 1) return name.toUpperCase();
        return "AD";
      };

      return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
          {/* Sidebar */}
          <aside className="w-64 bg-slate-800 dark:bg-slate-950 text-white flex flex-col shadow-xl">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={user?.avatar_url || `https://avatar.vercel.sh/${user?.email}.png`} alt={user?.name || user?.email} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getAvatarFallback(user?.name || user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-white">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-slate-400">{user?.role}</p>
                </div>
              </div>
            </div>
            
            <nav className="flex-grow p-4 space-y-2">
              <AdminSidebarLink to="/admin" icon={LayoutDashboard} label="Visão Geral" />
              <AdminSidebarLink to="/admin/users" icon={Users} label="Usuários" />
              <AdminSidebarLink to="/admin/bets" icon={ListChecks} label="Apostas" />
              <AdminSidebarLink to="/admin/reports" icon={BarChart3} label="Relatórios" />
              <AdminSidebarLink to="/admin/notifications" icon={BellDot} label="Notificações" />
              <AdminSidebarLink to="/admin/settings" icon={Settings} label="Configurações" />
              <AdminSidebarLink to="/admin/terminal" icon={TerminalSquare} label="Terminal" />
            </nav>

            <div className="p-4 mt-auto border-t border-slate-700">
              <Button onClick={logout} variant="ghost" className="w-full justify-start text-slate-300 hover:bg-red-500/20 hover:text-red-300">
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white dark:bg-slate-800 shadow-sm p-4">
              <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{pageTitle || 'Painel Administrativo'}</h1>
            </header>
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-slate-900 p-6">
              {children} 
            </main>
          </div>
        </div>
      );
    };

    export default AdminDashboardLayout;
  