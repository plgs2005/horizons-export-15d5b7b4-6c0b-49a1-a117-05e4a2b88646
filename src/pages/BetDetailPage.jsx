
    import React, { useEffect, useState, useCallback } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { useBets } from '@/contexts/BetContext.jsx';
    import { useAuth } from '@/contexts/AuthContext.jsx';
    import { useToast } from '@/components/ui/use-toast';
    
    import BetDetailHeader from '@/components/bet-detail-parts/BetDetailHeader.jsx';
    import BetInfoGrid from '@/components/bet-detail-parts/BetInfoGrid.jsx';
    import CountdownTimer from '@/components/bet-detail-parts/CountdownTimer.jsx';
    import BetActions from '@/components/bet-detail-parts/BetActions.jsx';
    import BetResultDisplay from '@/components/bet-detail-parts/BetResultDisplay.jsx';
    import ParticipantsList from '@/components/bet-detail-parts/ParticipantsList.jsx';
    import LoadingBetDetail from '@/components/bet-detail-parts/LoadingBetDetail.jsx';
    import BetShareModal from '@/components/bets/BetShareModal.jsx';
    import BetManagerActions from '@/components/bet-detail-parts/BetManagerActions.jsx';
    
    import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
    import { Button } from "@/components/ui/button";
    import { Terminal, Share2 } from "lucide-react";
    
    const BetDetailPage = () => {
      const { id: betId } = useParams();
      const navigate = useNavigate();
      const { getBetById, placeBet, endBet, loadingBets: contextLoading, confirmParticipantPayment } = useBets();
      const { user, isAuthenticated } = useAuth();
      const { toast } = useToast();
    
      const [bet, setBet] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
          
      const [selectedOptionValue, setSelectedOptionValue] = useState('');
      const [betAmount, setBetAmount] = useState(0);
      const [showShareModal, setShowShareModal] = useState(false);
      const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
    
      const fetchBetDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
          const fetchedBet = await getBetById(betId);
          if (fetchedBet) {
            setBet(fetchedBet);
            if (fetchedBet.options && fetchedBet.options.length > 0 && fetchedBet.options[0].value) {
              setSelectedOptionValue(fetchedBet.options[0].value); 
            }
            setBetAmount(fetchedBet.entry_fee || 0);
          } else {
            setError("Aposta não encontrada ou você não tem permissão para vê-la.");
            toast({ variant: "destructive", title: "Erro", description: "Aposta não encontrada." });
          }
        } catch (e) {
          console.error("Error fetching bet details:", e);
          setError("Falha ao carregar detalhes da aposta.");
          toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os detalhes da aposta." });
        } finally {
          setLoading(false);
        }
      }, [betId, getBetById, toast]);
    
      useEffect(() => {
        fetchBetDetails();
      }, [fetchBetDetails]);
    
      const handlePlaceBet = async (paymentMethod = 'PIX') => {
        if (!isAuthenticated || !user) {
          toast({ variant: "destructive", title: "Login Necessário", description: "Você precisa estar logado para apostar." });
          navigate('/auth', { state: { from: `/aposta/${betId}` } });
          return;
        }
        if (!selectedOptionValue) {
          toast({ variant: "destructive", title: "Seleção Necessária", description: "Por favor, selecione uma opção." });
          return;
        }
        if (parseFloat(betAmount) < (bet?.entry_fee || 0)) {
          toast({ variant: "destructive", title: "Valor Inválido", description: `O valor mínimo da aposta é R$ ${bet?.entry_fee.toFixed(2)}.` });
          return;
        }
        if (!user?.pix_key && paymentMethod === 'PIX') {
            toast({
                variant: "destructive",
                title: "Chave PIX Necessária",
                description: "Você precisa cadastrar uma chave PIX no seu perfil para apostar com PIX.",
            });
            navigate('/perfil');
            return;
        }
    
        const success = await placeBet(betId, selectedOptionValue, parseFloat(betAmount), paymentMethod);
        if (success) {
          const selectedOptionLabel = bet.options.find(opt => opt.value === selectedOptionValue)?.name || selectedOptionValue;
          toast({ title: "Aposta Realizada!", description: `Sua aposta em ${selectedOptionLabel} foi registrada.` });
          fetchBetDetails(); 
        }
      };
    
      const handleEndBet = async (winningOptionValue) => {
        if (!user || user?.id !== bet?.created_by) {
          toast({ variant: "destructive", title: "Não Autorizado", description: "Apenas o criador da aposta pode encerrá-la." });
          return;
        }
        const winningOptionLabel = bet.options.find(opt => opt.value === winningOptionValue)?.name || winningOptionValue;
        const resultDescription = `Opção vencedora: ${winningOptionLabel}`;
        const success = await endBet(betId, winningOptionValue, resultDescription);
        if (success) {
          toast({ title: "Aposta Encerrada!", description: `A opção ${winningOptionLabel} foi definida como vencedora.` });
          fetchBetDetails(); 
        }
      };

      const handleConfirmPayment = async (participantId) => {
        setIsConfirmingPayment(true);
        const success = await confirmParticipantPayment(participantId);
        if (success) {
            toast({ title: "Pagamento Confirmado", description: "O status do participante foi atualizado para pago." });
            fetchBetDetails();
        } else {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível confirmar o pagamento." });
        }
        setIsConfirmingPayment(false);
      };
          
      const handleOpenShareModal = () => {
        setShowShareModal(true);
      };
    
      if (loading || contextLoading) {
        return <LoadingBetDetail />;
      }
    
      if (error) {
        return (
          <div className="container mx-auto px-4 py-8 text-center">
            <Alert variant="destructive" className="max-w-lg mx-auto">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Erro ao Carregar Aposta</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
             <Button onClick={() => navigate('/apostas')} className="mt-4">Voltar para Apostas</Button>
          </div>
        );
      }
    
      if (!bet) {
        return (
           <div className="container mx-auto px-4 py-8 text-center">
            <Alert variant="default" className="max-w-lg mx-auto">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Aposta não encontrada</AlertTitle>
              <AlertDescription>Não foi possível encontrar os detalhes para esta aposta.</AlertDescription>
            </Alert>
             <Button onClick={() => navigate('/apostas')} className="mt-4">Voltar para Apostas</Button>
          </div>
        );
      }
          
      const isManager = user?.id === bet.created_by;
      const canPlaceBet = bet.status === 'Aberta' && new Date(bet.close_date) > new Date();
      const hasUserAlreadyBet = bet.apostadores?.some(p => p.usuario_id === user?.id);
      const betOptionsForActions = bet.options?.map(opt => ({ label: opt.name, value: opt.value })) || [];
    
      return (
        <div className="container mx-auto px-2 sm:px-4 py-8 space-y-8">
          <BetDetailHeader 
            title={bet.title} 
            imageUrl={bet.image_url}
            creatorName={bet.manager_name}
            isPublic={bet.is_public}
          />
    
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <BetInfoGrid bet={bet} />
              {canPlaceBet && <CountdownTimer closeDate={bet.close_date} />}
            </div>
    
            <div className="space-y-6">
              {canPlaceBet && !hasUserAlreadyBet && isAuthenticated && user && (
                <BetActions
                  options={betOptionsForActions}
                  selectedOption={selectedOptionValue}
                  onOptionChange={setSelectedOptionValue}
                  betAmount={betAmount}
                  onAmountChange={setBetAmount}
                  minAmount={bet.entry_fee}
                  onPlaceBet={handlePlaceBet}
                  isPlacingBet={contextLoading || loading} 
                  canStillBet={canPlaceBet}
                  userPixKey={user?.pix_key}
                  onNavigateToProfile={() => navigate('/perfil')}
                />
              )}
              {canPlaceBet && hasUserAlreadyBet && (
                 <Alert variant="default" className="bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-500">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Aposta Registrada!</AlertTitle>
                    <AlertDescription>Você já participou deste bolão. Boa sorte!</AlertDescription>
                </Alert>
              )}
              {!isAuthenticated && canPlaceBet && (
                 <Alert variant="default" className="bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-500">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Faça Login para Apostar</AlertTitle>
                    <AlertDescription>
                        Você precisa estar <Button variant="link" onClick={() => navigate('/auth', { state: { from: `/aposta/${betId}` } })} className="p-0 h-auto font-bold underline text-blue-700 dark:text-blue-500">logado</Button> para participar.
                    </AlertDescription>
                </Alert>
              )}

              {isManager && bet.status === 'Aberta' && (
                <BetManagerActions
                  options={betOptionsForActions}
                  selectedOption={selectedOptionValue}
                  onOptionChange={setSelectedOptionValue}
                  onEndBet={handleEndBet}
                  isLoading={contextLoading || loading}
                />
              )}
            </div>
          </div>
              
          {bet.status !== 'Aberta' && bet.result && (
             <BetResultDisplay 
                status={bet.status} 
                result={bet.correct_option} 
                options={betOptionsForActions} 
            />
          )}
    
          <ParticipantsList 
            participants={bet.apostadores || []} 
            betOptions={betOptionsForActions}
            isBetOwner={isManager}
            onConfirmPayment={handleConfirmPayment}
            loadingConfirmation={isConfirmingPayment}
          />
              
          <Button onClick={handleOpenShareModal} variant="outline" className="w-full md:w-auto">
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar Aposta
          </Button>

          {showShareModal && (
            <BetShareModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              betUrl={window.location.href}
              betTitle={bet.title}
              isPrivate={!bet.is_public}
              accessCode={bet.private_access_code}
            />
          )}
        </div>
      );
    };
    
    export default BetDetailPage;
  