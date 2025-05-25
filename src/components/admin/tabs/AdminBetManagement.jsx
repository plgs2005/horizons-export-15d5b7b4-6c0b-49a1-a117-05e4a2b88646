
    import React, { useState, useEffect, useCallback } from 'react';
    import { useBets } from '@/contexts/BetContext.jsx';
    import AdminBetList from '@/components/admin/AdminBetList.jsx';
    import { motion } from 'framer-motion';
    import { AlertCircle, Loader2, PlusCircle } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useNavigate } from 'react-router-dom';
    import BetFormModal from '@/components/admin/BetFormModal.jsx'; 

    const AdminBetManagement = () => {
      const { bets, loadingBets, fetchBets, deleteBet } = useBets();
      const navigate = useNavigate();
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingBet, setEditingBet] = useState(null);

      const loadAllBets = useCallback(() => {
        fetchBets({}); // Pass empty filter to fetch all bets
      }, [fetchBets]);

      useEffect(() => {
        loadAllBets();
      }, [loadAllBets]);

      const handleEditBet = (bet) => {
        setEditingBet(bet);
        setIsModalOpen(true);
      };

      const handleDeleteBet = async (betId) => {
        await deleteBet(betId);
      };

      const openCreateModal = () => {
        setEditingBet(null);
        setIsModalOpen(true);
      };

      if (loadingBets && bets.length === 0) {
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
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">Gerenciamento de Apostas</h2>
            <Button onClick={() => navigate('/criar-aposta')} className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-5 w-5" /> Criar Nova Aposta
            </Button>
          </div>

          {bets.length === 0 && !loadingBets ? (
             <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow">
              <AlertCircle className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Nenhuma aposta encontrada</h3>
              <p className="text-slate-500 dark:text-slate-400">Ainda não há apostas cadastradas no sistema.</p>
            </div>
          ) : (
            <AdminBetList 
              bets={bets} 
              onEditBet={handleEditBet} 
              onDeleteBet={handleDeleteBet} 
            />
          )}
          
          {isModalOpen && (
            <BetFormModal 
              isOpen={isModalOpen} 
              onClose={() => {
                setIsModalOpen(false);
                setEditingBet(null);
                loadAllBets(); // Refresh list after modal close
              }} 
              bet={editingBet} 
            />
          )}
        </motion.div>
      );
    };

    export default AdminBetManagement;
  