
    import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabase.jsx';
    import { useAuth } from '@/contexts/AuthContext.jsx';
    import { 
      transformBetData, 
      fetchBetsFromSupabase,
      addBetToSupabase,
      updateBetInSupabase,
      deleteBetFromSupabase,
      placeBetInSupabase,
      endBetInSupabase,
      getBetByIdFromSupabase,
      getUserBetsFromSupabase,
      confirmParticipantPaymentInSupabase,
      hasUserBetOnBet as checkUserBet
    } from '@/lib/betService.js';

    const BetContext = createContext(null);

    export const BetProvider = ({ children }) => {
      const [bets, setBets] = useState([]);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();
      const { user } = useAuth();

      const fetchBets = useCallback(async (filters = { is_public: true }) => {
        setLoading(true);
        try {
          const data = await fetchBetsFromSupabase(filters);
          setBets(data || []);
        } catch (error) {
          console.error("Error fetching bets:", error);
          toast({ variant: "destructive", title: "Erro ao buscar apostas", description: error.message });
          setBets([]);
        } finally {
          setLoading(false);
        }
      }, [toast]);

      useEffect(() => {
        fetchBets({ is_public: true }); // Fetch only public bets initially
      }, [fetchBets]);
      
      const addBet = async (newBetData) => {
        if (!user) {
          toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado para criar uma aposta." });
          return null;
        }
        setLoading(true);
        try {
          const newBet = await addBetToSupabase(newBetData, user.id);
          
          setBets(prevBets => [newBet, ...prevBets].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
          toast({ title: "Sucesso!", description: "Aposta criada." });
          return newBet;
        } catch (error) {
          console.error("Error creating bet:", error);
          toast({ variant: "destructive", title: "Erro ao criar aposta", description: error.message });
          return null;
        } finally {
          setLoading(false);
        }
      };
      
      const updateBet = async (betId, updatedBetData) => {
        if (!user) {
          toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado para atualizar uma aposta." });
          return null;
        }
        setLoading(true);
        try {
          const updatedBet = await updateBetInSupabase(betId, updatedBetData, user.id);
          setBets(prevBets => prevBets.map(b => (b.id === betId ? updatedBet : b)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
          toast({ title: "Sucesso!", description: "Aposta atualizada." });
          return updatedBet;
        } catch (error) {
          console.error("Error updating bet:", error);
          toast({ variant: "destructive", title: "Erro ao atualizar aposta", description: error.message });
          return null;
        } finally {
          setLoading(false);
        }
      };

      const deleteBet = async (betId) => {
        setLoading(true);
        try {
          await deleteBetFromSupabase(betId);
          setBets(prevBets => prevBets.filter(b => b.id !== betId));
          toast({ title: "Sucesso!", description: "Aposta excluída." });
          return true;
        } catch (error) {
          console.error("Error deleting bet:", error);
          toast({ variant: "destructive", title: "Erro ao excluir aposta", description: error.message });
          return false;
        } finally {
          setLoading(false);
        }
      };

      const placeBet = async (betId, chosenOptionValue, amount, paymentMethod = 'Dinheiro') => {
        if (!user) {
          toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado para apostar." });
          return null;
        }
        setLoading(true);
        try {
          const { newParticipant, updatedBetData } = await placeBetInSupabase(betId, user.id, chosenOptionValue, amount, paymentMethod);
          
          setBets(prevBets => prevBets.map(b => (b.id === betId ? updatedBetData : b)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
          toast({ title: "Aposta Confirmada!", description: `Você apostou R$ ${amount} em ${chosenOptionValue}.` });
          return { ...newParticipant, profile: newParticipant.profiles };

        } catch (error) {
          console.error("Error placing bet:", error);
          toast({ variant: "destructive", title: "Erro ao realizar aposta", description: error.message });
          return null;
        } finally {
          setLoading(false);
        }
      };

      const endBet = async (betId, winningOptionValue, resultDescription) => {
        setLoading(true);
        try {
          const updatedBet = await endBetInSupabase(betId, winningOptionValue, resultDescription);
          setBets(prevBets => prevBets.map(b => (b.id === betId ? updatedBet : b)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
          toast({ title: "Aposta Encerrada!", description: `O resultado foi: ${winningOptionValue}.` });
          return updatedBet;
        } catch (error) {
          console.error("Error ending bet:", error);
          toast({ variant: "destructive", title: "Erro ao encerrar aposta", description: error.message });
          return null;
        } finally {
          setLoading(false);
        }
      };
      
      const getBetById = useCallback(async (id) => {
        setLoading(true);
        try {
          const data = await getBetByIdFromSupabase(id);
          if (!data) {
            toast({ variant: "destructive", title: "Aposta não encontrada", description: "Não foi possível carregar os dados desta aposta." });
            return null;
          }
          
          setBets(prev => {
            const index = prev.findIndex(b => b.id === id);
            if (index !== -1) {
              const newBets = [...prev];
              newBets[index] = data;
              return newBets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            }
            return [...prev, data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); 
          });
          return data;

        } catch (error) {
          console.error(`Error fetching bet by ID ${id}:`, error);
          toast({ variant: "destructive", title: "Erro ao buscar detalhes da aposta", description: error.message });
          return null;
        } finally {
          setLoading(false);
        }
      }, [toast]);

      const getUserBets = useCallback(async (userId) => {
        if (!userId) return [];
        setLoading(true);
        try {
          const combined = await getUserBetsFromSupabase(userId);
          return combined;
        } catch (error) {
          console.error("Error fetching user bets:", error);
          toast({ variant: "destructive", title: "Erro ao buscar suas apostas", description: error.message });
          return [];
        } finally {
          setLoading(false);
        }
      }, [toast]);

      const confirmParticipantPayment = async (participantId) => {
        setLoading(true);
        try {
            const success = await confirmParticipantPaymentInSupabase(participantId);
            if (success) {
                toast({ title: "Pagamento Confirmado", description: "Status do participante atualizado." });
                // Optionally, refresh the specific bet data here
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error confirming payment:", error);
            toast({ variant: "destructive", title: "Erro ao confirmar pagamento", description: error.message });
            return false;
        } finally {
            setLoading(false);
        }
      };

      const hasUserBet = useCallback(async (userId, betId) => {
        if (!userId || !betId) return false;
        try {
          return await checkUserBet(userId, betId);
        } catch (error) {
          console.error("Error checking user bet status:", error);
          return false;
        }
      }, []);


      if (loading && bets.length === 0 && !user) { 
        return (
          <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="p-4 rounded-lg">
              <p className="text-primary">Carregando apostas...</p>
            </div>
          </div>
        );
      }

      return (
        <BetContext.Provider value={{ 
          bets, 
          addBet, 
          placeBet, 
          endBet, 
          getBetById, 
          getUserBets, 
          fetchBets, 
          updateBet, 
          deleteBet, 
          loadingBets: loading,
          confirmParticipantPayment,
          hasUserBet
        }}>
          {children}
        </BetContext.Provider>
      );
    };

    export const useBets = () => {
      const context = useContext(BetContext);
      if (context === undefined) {
        throw new Error('useBets must be used within a BetProvider');
      }
      return context;
    };
  