
    import React, { useState, useEffect } from 'react';
    import { Link } from 'react-router-dom';
    import { supabase } from '@/lib/supabase.jsx';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge';
    import { ArrowRight, Users, CalendarDays, DollarSign, Gift, Globe, LockKeyhole, Image as ImageIcon } from 'lucide-react';
    import { motion } from 'framer-motion';
    import BetCardCountdown from '@/components/bets/BetCardCountdown.jsx';

    const BetCard = ({ bet }) => {
      const [creatorName, setCreatorName] = useState('Carregando...');
      const [participantsCount, setParticipantsCount] = useState(bet.participants_count || 0);
      
      useEffect(() => {
        const fetchCreatorDetails = async () => {
          if (bet.created_by) {
            if (bet.profiles && typeof bet.profiles === 'object') {
              setCreatorName(bet.profiles.name || bet.profiles.apelido || 'Anônimo');
            } else if (typeof bet.created_by === 'object' && bet.created_by !== null && bet.created_by.id) {
              setCreatorName(bet.created_by.name || bet.created_by.apelido || 'Anônimo');
            } else { 
              const { data: profileData } = await supabase
                .from('profiles')
                .select('name, apelido')
                .eq('id', bet.created_by)
                .single();
              setCreatorName(profileData?.name || profileData?.apelido || 'Anônimo');
            }
          } else {
            setCreatorName('Desconhecido');
          }
        };

        const fetchParticipantsCount = async () => {
            if (Array.isArray(bet.apostadores)) {
                setParticipantsCount(bet.apostadores.length);
            } else if (bet.id && !Array.isArray(bet.apostadores)) { 
                const { count } = await supabase
                .from('apostadores')
                .select('*', { count: 'exact', head: true })
                .eq('aposta_id', bet.id);
                if (count !== null) {
                    setParticipantsCount(count);
                }
            }
        };
        
        fetchCreatorDetails();
        fetchParticipantsCount();

      }, [bet.created_by, bet.id, bet.apostadores, bet.profiles]);


      const getStatusBadgeVariant = (status) => {
        switch (status) {
          case 'Aberta': return 'success';
          case 'Encerrada': return 'warning';
          case 'Finalizada': return 'destructive';
          default: return 'default';
        }
      };
      const getStatusText = (status) => {
        switch (status) {
          case 'Aberta': return 'Em Andamento';
          case 'Encerrada': return 'Encerrado';
          case 'Finalizada': return 'Finalizado';
          default: return status;
        }
      }
      
      const showCountdown = !bet.image_url && bet.status === 'Aberta' && new Date(bet.close_date) > new Date();
      const hasImage = !!bet.image_url;

      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex"
        >
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            {hasImage ? (
              <div className="h-48 w-full overflow-hidden relative">
                <img-replace src={bet.image_url} alt={bet.title || 'Imagem da aposta'} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                <div className={`absolute top-2 right-2 p-1.5 rounded-full text-white ${bet.is_public ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                    {bet.is_public ? <Globe size={16} /> : <LockKeyhole size={16} />}
                </div>
              </div>
            ) : showCountdown ? (
                <div className="relative"> 
                    <BetCardCountdown closeDate={bet.close_date} />
                    <div className={`absolute top-2 right-2 z-20 p-1.5 rounded-full text-white ${bet.is_public ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                        {bet.is_public ? <Globe size={16} /> : <LockKeyhole size={16} />}
                    </div>
                </div>
            ) : (
                <div className="h-48 w-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-700 relative text-slate-400 dark:text-slate-500">
                    <ImageIcon className="h-16 w-16 mb-2" />
                    <p className="text-sm">Sem imagem para esta aposta</p>
                    {bet.options && bet.options.length === 2 && (
                        <p className="text-xs mt-1 font-semibold">
                            {bet.options[0].name || 'Opção 1'} vs {bet.options[1].name || 'Opção 2'}
                        </p>
                    )}
                     <div className={`absolute top-2 right-2 p-1.5 rounded-full text-white ${bet.is_public ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                        {bet.is_public ? <Globe size={16} /> : <LockKeyhole size={16} />}
                    </div>
                </div>
            )}

            <CardHeader className="p-4 border-b dark:border-slate-700/50">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">{bet.title}</CardTitle>
                <Badge variant={getStatusBadgeVariant(bet.status)} className="ml-2 shrink-0">
                  {getStatusText(bet.status)}
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Por: {creatorName}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 flex-grow">
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{bet.description}</p>
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <DollarSign className="h-4 w-4 mr-2 text-primary" />
                Entrada: R$ {Number(bet.entry_fee).toFixed(2)}
              </div>
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <Users className="h-4 w-4 mr-2 text-primary" />
                Participantes: {participantsCount} {bet.max_participants ? `/ ${bet.max_participants}` : ''}
              </div>
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                Encerra em: {new Date(bet.close_date).toLocaleDateString()}
              </div>
              {bet.prize_pool > 0 && (
                <div className="flex items-center text-sm font-semibold text-green-600 dark:text-green-400">
                  <Gift className="h-4 w-4 mr-2" />
                  Prêmio estimado: R$ {Number(bet.prize_pool).toFixed(2)}
                </div>
              )}
            </CardContent>
            <CardFooter className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700/50 mt-auto">
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform hover:scale-105">
                <Link to={`/aposta/${bet.id}`}>
                  Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default BetCard;
  