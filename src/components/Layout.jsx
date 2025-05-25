
    import React from 'react';
    import { Link, NavLink, useLocation } from 'react-router-dom';
    import { Home, Ticket, PlusCircle, UserCircle, LogIn, LogOut, ShieldCheck, Sun, Moon, Settings, LayoutDashboard } from 'lucide-react';
    import { useAuth } from '@/contexts/AuthContext.jsx';
    import { useTheme } from '@/contexts/ThemeContext.jsx';
    import { Button } from '@/components/ui/button';
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
    import AnimatedLogo from '@/components/AnimatedLogo.jsx'; // Importa o novo logo animado
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
      DropdownMenuSub,
      DropdownMenuSubTrigger,
      DropdownMenuPortal,
      DropdownMenuSubContent
    } from "@/components/ui/dropdown-menu";
    import { motion, AnimatePresence } from 'framer-motion';

    const NavItem = ({ to, icon: Icon, children }) => (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
           ${isActive 
             ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground' 
             : 'text-slate-700 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:bg-slate-700/50'
           }`
        }
      >
        <Icon className="mr-3 h-5 w-5" />
        {children}
      </NavLink>
    );

    const Layout = ({ children }) => {
      const { isAuthenticated, user, isAdmin, logout } = useAuth();
      const { theme, toggleTheme, setSpecificTheme } = useTheme();
      const location = useLocation();

      const getAvatarFallback = (name) => {
        if (!name) return "P";
        const parts = name.split(" ");
        if (parts.length > 1) {
          return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      };
      
      const navItems = [
        { path: "/", label: "Início", icon: Home, authRequired: false, adminRequired: false },
        { path: "/apostas", label: "Apostas", icon: Ticket, authRequired: true, adminRequired: false },
        { path: "/criar-aposta", label: "Criar Bolão", icon: PlusCircle, authRequired: true, adminRequired: false }, 
      ];

      return (
        <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
          <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <AnimatedLogo className="h-10" /> {/* Substituído o logo antigo */}
                
                <nav className="hidden md:flex items-center space-x-1">
                  {navItems.map(item => (
                    (!item.authRequired || isAuthenticated) && 
                    (!item.adminRequired || isAdmin) &&
                    <NavItem key={item.path} to={item.path} icon={item.icon}>
                      {item.label}
                    </NavItem>
                  ))}
                </nav>
                <div className="flex items-center space-x-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                        {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        <span className="sr-only">Alternar tema</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSpecificTheme('light')}>
                        <Sun className="mr-2 h-4 w-4" />
                        Claro
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSpecificTheme('dark')}>
                        <Moon className="mr-2 h-4 w-4" />
                        Escuro
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => setSpecificTheme('system')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Sistema
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {isAuthenticated && user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                           <Avatar className="h-9 w-9 border-2 border-primary/50">
                            <AvatarImage src={user.avatar_url || `https://avatar.vercel.sh/${user.email}.png`} alt={user.name || user.email} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {getAvatarFallback(user.name || user.email)}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/perfil">
                            <UserCircle className="mr-2 h-4 w-4" />
                            Meu Perfil
                          </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem asChild>
                            <Link to="/admin">
                              <LayoutDashboard className="mr-2 h-4 w-4" />
                              Painel Admin
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400 focus:bg-red-100 dark:focus:bg-red-700/50 focus:text-red-700 dark:focus:text-red-300">
                          <LogOut className="mr-2 h-4 w-4" />
                          Sair
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button asChild variant="ghost" className="text-slate-700 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:bg-slate-700/50">
                      <Link to="/auth">
                        <LogIn className="mr-2 h-5 w-5" />
                        Entrar
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-2 flex justify-around shadow-top-lg z-40">
              {navItems.map(item => (
                (!item.authRequired || isAuthenticated) &&
                (!item.adminRequired || isAdmin) &&
                <NavLink
                  key={item.path + "-mobile"}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center p-2 rounded-md transition-colors duration-150 ease-in-out w-1/4
                     ${isActive 
                       ? 'text-primary dark:text-primary-foreground' 
                       : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-foreground'
                     }`
                  }
                >
                  <item.icon className="h-6 w-6 mb-0.5" />
                  <span className="text-xs">{item.label}</span>
                </NavLink>
              ))}
               {(!isAuthenticated) && (
                 <NavLink
                    to="/auth"
                    className={({ isActive }) =>
                    `flex flex-col items-center justify-center p-2 rounded-md transition-colors duration-150 ease-in-out w-1/4
                     ${isActive 
                       ? 'text-primary dark:text-primary-foreground' 
                       : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-foreground'
                     }`
                  }
                  >
                    <LogIn className="h-6 w-6 mb-0.5" />
                    <span className="text-xs">Entrar</span>
                  </NavLink>
               )}
            </nav>
          </header>

          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16 md:mb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-center py-6 border-t border-slate-300 dark:border-slate-700">
            <p className="text-sm">&copy; {new Date().getFullYear()} PAGOUL! - Todos os direitos reservados.</p>
            <p className="text-xs mt-1">Apostas com responsabilidade. Se precisar de ajuda, procure orientação.</p>
          </footer>
        </div>
      );
    };

    export default Layout;
  