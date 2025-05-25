
    import React, { useState, useMemo, useEffect, useCallback } from 'react';
    import { useBets } from '@/contexts/BetContext.jsx';
    import { useToast } from '@/components/ui/use-toast';
    import { getAllUsers, supabase } from '@/lib/supabase.jsx'; // Import supabase client
    import StatCard from '@/components/admin/StatCard.jsx';
    import SystemAlerts from '@/components/admin/SystemAlerts.jsx';
    import { Users, DollarSign, TrendingUp, Trophy, ListFilter, Settings2, Loader2, Wifi, WifiOff, Activity } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

    const AdminOverview = () => {
      const { bets, loadingBets: loadingBetsContext, fetchBets } = useBets(); 
      const { toast } = useToast();
      const [allUsers, setAllUsers] = useState([]);
      const [loadingUsers, setLoadingUsers] = useState(true);
      const [pixTestStatus, setPixTestStatus] = useState(null); // 'success', 'error', 'pending'
      const [pixTestLog, setPixTestLog] = useState([]);

      const loadInitialData = useCallback(async () => {
        setLoadingUsers(true);
        setLoadingUsers(true); // ensure bets are also re-fetched or use loadingBetsContext
        try {
          await fetchBets(); // from BetContext
          const usersData = await getAllUsers();
          setAllUsers(usersData || []);
        } catch (error) {
          console.error("Failed to fetch initial data for admin overview:", error);
          toast({ variant: "destructive", title: "Erro ao buscar dados", description: error.message });
          setAllUsers([]);
        } finally {
          setLoadingUsers(false);
        }
      }, [toast, fetchBets]);


      useEffect(() => {
        loadInitialData();
      }, [loadInitialData]);

      const stats = useMemo(() => {
        const totalBetsValue = bets.reduce((sum, bet) => sum + (bet.prize_pool || 0), 0);
        const activeBetsCount = bets.filter(bet => bet.status === 'Aberta').length;
        const completedBetsCount = bets.filter(bet => bet.status === 'Encerrada' || bet.status === 'Finalizada').length;
        
        const validBetsForCompletion = bets.filter(bet => ['Aberta', 'Encerrada', 'Finalizada'].includes(bet.status));
        const completionRateValue = validBetsForCompletion.length > 0 ? (completedBetsCount / validBetsForCompletion.length) * 100 : 0;
        
        const betsWithParticipants = bets.filter(bet => (bet.participants_count || 0) > 0); 
        const avgBetSizeValue = betsWithParticipants.length > 0 ? totalBetsValue / betsWithParticipants.length : 0;

        return {
          totalUsers: allUsers.length, 
          totalBets: bets.length,
          totalVolume: totalBetsValue,
          activeBets: activeBetsCount,
          avgBetSize: avgBetSizeValue,
          completionRate: completionRateValue
        };
      }, [bets, allUsers]);

      const handleTestPixConnection = async () => {
        setPixTestStatus('pending');
        setPixTestLog(prev => [...prev, { time: new Date().toLocaleTimeString(), message: "Iniciando teste de conexão PIX Efí...", type: 'info' }]);
        
        try {
          // Nomes dos segredos e config de sandbox podem vir do localStorage ou de um estado global de config.
          // Para este exemplo, vamos assumir que estão disponíveis ou fixos para a Edge Function.
          // A Edge Function 'efi-test-connection' precisaria ser criada no Supabase.
          const { data, error } = await supabase.functions.invoke('efi-test-connection', {
            body: JSON.stringify({ 
              // Você pode passar configurações específicas aqui se necessário,
              // por exemplo, o nome dos segredos a serem usados pela Edge Function,
              // ou se o modo sandbox deve ser ativado.
              // Esses valores podem ser lidos das configurações do sistema (localStorage).
              efiClientIdSecretName: localStorage.getItem('pagoul_system_settings_payments_efiClientIdSecretName') || 'EFI_CLIENT_ID',
              efiClientSecretSecretName: localStorage.getItem('pagoul_system_settings_payments_efiClientSecretSecretName') || 'EFI_CLIENT_SECRET',
              useEfiSandbox: JSON.parse(localStorage.getItem('pagoul_system_settings_payments_useEfiSandbox') || 'true'),
             })
          });

          if (error) {
            throw error;
          }

          if (data.success) {
            setPixTestStatus('success');
            setPixTestLog(prev => [...prev, { time: new Date().toLocaleTimeString(), message: `Sucesso: ${data.message || 'Conexão com API Efí estabelecida.'}`, type: 'success' }]);
            toast({ title: "Teste PIX Efí", description: data.message || 'Conexão bem-sucedida!', variant: 'success' });
          } else {
            setPixTestStatus('error');
            setPixTestLog(prev => [...prev, { time: new Date().toLocaleTimeString(), message: `Falha: ${data.message || 'Não foi possível conectar à API Efí.'}`, type: 'error' }]);
            toast({ title: "Teste PIX Efí Falhou", description: data.message || 'Verifique as configurações e segredos.', variant: 'destructive' });
          }
        } catch (err) {
          setPixTestStatus('error');
          const errorMessage = err.message || 'Erro desconhecido ao testar conexão PIX.';
          setPixTestLog(prev => [...prev, { time: new Date().toLocaleTimeString(), message: `Erro crítico: ${errorMessage}`, type: 'error' }]);
          toast({ title: "Erro Crítico no Teste PIX", description: errorMessage, variant: 'destructive' });
          console.error("Error testing PIX connection:", err);
        }
      };


      if (loadingUsers || loadingBetsContext) {
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
            className="space-y-8"
        >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Total de Usuários" value={stats.totalUsers.toString()} icon={Users} description={`${allUsers.filter(u => u.is_active).length} ativos`} />
                <StatCard title="Volume Total Arrecadado" value={`R$ ${stats.totalVolume.toFixed(2)}`} icon={DollarSign} description="Soma dos pots de apostas" />
                <StatCard title="Apostas Ativas" value={stats.activeBets.toString()} icon={ListFilter} description="Aguardando resultado" />
                <StatCard title="Média por Aposta (Pot)" value={`R$ ${stats.avgBetSize.toFixed(2)}`} icon={Trophy} description="Valor médio do pot" />
                <StatCard title="Taxa de Conclusão" value={`${stats.completionRate.toFixed(1)}%`} icon={TrendingUp} description="Apostas finalizadas" />
                <StatCard title="Total de Apostas Criadas" value={stats.totalBets.toString()} icon={Settings2} description="Número total de bolões" />
            </div>
            <SystemAlerts 
                pendingBetsCount={bets.filter(b => b.status === 'Aberta' && new Date(b.close_date || b.deadline) < new Date()).length}
                unresolvedDisputesCount={0} 
            />

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-slate-700 dark:text-slate-100 flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-primary" />
                        Teste de Conexão API PIX (Efí)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={handleTestPixConnection} disabled={pixTestStatus === 'pending'} className="w-full md:w-auto">
                        {pixTestStatus === 'pending' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {pixTestStatus === 'success' && <Wifi className="mr-2 h-4 w-4 text-green-400" />}
                        {pixTestStatus === 'error' && <WifiOff className="mr-2 h-4 w-4 text-red-400" />}
                        {!pixTestStatus && <Wifi className="mr-2 h-4 w-4" />}
                        Testar Conexão com Efí
                    </Button>
                    {pixTestLog.length > 0 && (
                        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-md max-h-60 overflow-y-auto">
                            <h4 className="text-sm font-semibold mb-2 text-slate-600 dark:text-slate-300">Log do Teste:</h4>
                            <ul className="space-y-1">
                                {pixTestLog.slice().reverse().map((logEntry, index) => (
                                    <li key={index} className={`text-xs ${
                                        logEntry.type === 'success' ? 'text-green-600 dark:text-green-400' : 
                                        logEntry.type === 'error' ? 'text-red-600 dark:text-red-400' : 
                                        'text-slate-500 dark:text-slate-400'
                                    }`}>
                                      <span className="font-mono">[{logEntry.time}]</span> {logEntry.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Este teste tentará autenticar com a API da Efí usando as credenciais e configurações de Sandbox definidas nas Configurações do Sistema. 
                        Uma Edge Function chamada <code className="text-xs bg-slate-200 dark:bg-slate-700 p-0.5 rounded">efi-test-connection</code> é necessária no Supabase.
                    </p>
                </CardContent>
            </Card>

        </motion.div>
      );
    };

    export default AdminOverview;
  