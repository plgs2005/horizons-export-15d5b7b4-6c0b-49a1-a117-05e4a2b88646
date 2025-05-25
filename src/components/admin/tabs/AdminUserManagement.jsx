
    import React, { useState, useEffect } from 'react';
    import { useToast } from '@/components/ui/use-toast';
    import { getAllUsers } from '@/lib/supabase.jsx';
    import UserManagementTable from '@/components/admin/UserManagementTable.jsx';
    import { AlertCircle, Loader2 } from 'lucide-react';
    import { motion } from 'framer-motion';

    const AdminUserManagement = () => {
      const { toast } = useToast();
      const [allUsers, setAllUsers] = useState([]);
      const [loadingUsers, setLoadingUsers] = useState(true);

      useEffect(() => {
        const fetchUsers = async () => {
          setLoadingUsers(true);
          try {
            const usersData = await getAllUsers();
            setAllUsers(usersData || []);
          } catch (error) {
            console.error("Failed to fetch users for admin management:", error);
            toast({ variant: "destructive", title: "Erro ao buscar usuários", description: error.message });
            setAllUsers([]);
          } finally {
            setLoadingUsers(false);
          }
        };
        fetchUsers();
      }, [toast]);

      if (loadingUsers) {
        return (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        );
      }

      return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
          {allUsers.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow">
              <AlertCircle className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Nenhum usuário encontrado</h3>
              <p className="text-slate-500 dark:text-slate-400">Ainda não há usuários cadastrados no sistema.</p>
            </div>
          ) : (
            <UserManagementTable users={allUsers} setUsers={setAllUsers} />
          )}
        </motion.div>
      );
    };

    export default AdminUserManagement;
  