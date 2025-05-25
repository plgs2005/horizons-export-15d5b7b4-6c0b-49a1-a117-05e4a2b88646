
    import React, { useState, useEffect, useCallback } from 'react';
    import { Link } from 'react-router-dom';
    import { supabase } from '@/lib/supabase.jsx';
    import { Button } from '@/components/ui/button';
    import { Zap, PartyPopper, SearchX } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useAuth } from '@/contexts/AuthContext.jsx';
    import PageLoader from '@/components/PageLoader.jsx'; 
    import BetCard from '@/components/bets/BetCard.jsx'; 
    import { transformBetData } from '@/lib/betService.js';

    const FakeBetReplay = () => {
      const friends = ["João", "Maria", "Carlos", "Ana", "Pedro"];
      const prize = (Math.random() * 500 + 100).toFixed(2);

      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-center p-8 md:p-12 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 rounded-xl shadow-2xl text-white"
        >
          <PartyPopper className="mx-auto h-16 w-16 mb-6 animate-bounce" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Que Festa! 🎉</h2>
          <p className="text-lg md:text-xl mb-6">
            No último bolão, {friends.join(', ')} e mais uma galera levaram a bolada de <strong className="font-extrabold text-yellow-300">R$ {prize}</strong>!
          </p>
          <p className="text-md mb-8">Fique de olho, o próximo pode ser você!</p>
          <div className="flex justify-center space-x-4">
            <Button asChild variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/50 backdrop-blur-sm">
              <Link to="/criar-aposta">Crie seu Bolão Agora!</Link>
            </Button>
            <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-slate-900">
              <Link to="/auth">Entrar e Participar</Link>
            </Button>
          </div>
        </motion.div>
      );
    };


    const BetsPage = () => {
      const [bets, setBets] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const { isAuthenticated, isManager } = useAuth(); // Changed isAdmin to isManager

      const fetchPublicBets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
          const { data, error: fetchError } = await supabase
            .from('bets')
            .select(`
              *,
              profiles:created_by (id, name, apelido, avatar_url),
              apostadores (id, usuario_id)
            `)
            .eq('is_public', true)
            .order('status', { ascending: true }) 
            .order('close_date', { ascending: true });

          if (fetchError) throw fetchError;
          
          const transformedBets = data.map(transformBetData);
          setBets(transformedBets || []);

        } catch (err) {
          console.error('Erro ao buscar apostas públicas:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }, []);

      useEffect(() => {
        fetchPublicBets();
      }, [fetchPublicBets]);

      const activePublicBets = bets.filter(bet => bet.status === 'Aberta');
      const closedPublicBets = bets.filter(bet => bet.status !== 'Aberta');
      const hasAnyPublicBetsEver = bets.length > 0;


      if (loading) {
        return <PageLoader message="Buscando os melhores bolões..." />;
      }

      if (error) {
        return (
            <div className="container mx-auto px-4 py-10 text-center">
                <SearchX className="mx-auto h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-semibold text-red-600 mb-2">Oops! Algo deu errado.</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Não foi possível carregar os bolões no momento.</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mb-2">Detalhe do erro: {error}</p>
                <Button onClick={fetchPublicBets} variant="outline">Tentar Novamente</Button>
            </div>
        );
      }

      return (
        <div className="container mx-auto px-2 sm:px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white mb-3">
              Bolões <span className="text-primary">Públicos</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Participe dos bolões abertos à comunidade ou crie o seu!
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {activePublicBets.length > 0 ? (
              <motion.div 
                key="active-public-bets"
                initial="initial" animate="animate" exit="exit"
                variants={{
                  initial: { opacity: 0 },
                  animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
                  exit: { opacity: 0 }
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"
              >
                {activePublicBets.map((bet) => (
                  <BetCard key={bet.id} bet={bet} />
                ))}
              </motion.div>
            ) : hasAnyPublicBetsEver && closedPublicBets.length > 0 ? ( 
              <motion.div key="replay-public-bets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FakeBetReplay />
              </motion.div>
            ) : ( 
              <motion.div 
                key="no-public-bets-ever"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-xl shadow-xl"
              >
                <Zap className="mx-auto h-16 w-16 text-primary mb-6 opacity-70" />
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Nenhum Bolão Público no Ar!</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                  Parece que a emoção está esperando por você para começar.
                  {isManager ? " Que tal criar o primeiro bolão público?" : " Fique de olho, logo teremos novidades!"}
                </p>
                {isManager && (
                    <Button asChild size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg transform transition-transform hover:scale-105">
                        <Link to="/criar-aposta">Criar Bolão Público!</Link>
                    </Button>
                )}
                 {!isManager && !isAuthenticated && (
                     <Button asChild size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg transform transition-transform hover:scale-105">
                        <Link to="/auth">Entrar para ver mais</Link>
                    </Button>
                 )}
              </motion.div>
            )}
          </AnimatePresence>

          {closedPublicBets.length > 0 && (
             <div className="mt-16">
                <motion.h2 
                  initial={{ opacity: 0, y:20 }} animate={{opacity:1, y:0}} transition={{delay:0.2, duration:0.5}}
                  className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-8 text-center"
                >
                  Bolões Públicos Encerrados
                </motion.h2>
                 <motion.div 
                    variants={{
                      initial: { opacity: 0 },
                      animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
                    }}
                    initial="initial" animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 opacity-70"
                 >
                    {closedPublicBets.map((bet) => (
                        <BetCard key={bet.id} bet={bet} />
                    ))}
                </motion.div>
             </div>
          )}
        </div>
      );
    };

    export default BetsPage;
  