
    import React, { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/utils';
    import usePixPayment from '@/hooks/usePixPayment.js';
    import { useToast } from "@/components/ui/use-toast";

    import PixPaymentModalHeader from '@/components/pix/PixPaymentModalHeader.jsx';
    import PixPaymentModalFooter from '@/components/pix/PixPaymentModalFooter.jsx';
    import PixPaymentGenerating from '@/components/pix/PixPaymentGenerating.jsx';
    import PixPaymentError from '@/components/pix/PixPaymentError.jsx';
    import PixPaymentPending from '@/components/pix/PixPaymentPending.jsx';
    import PixPaymentPaid from '@/components/pix/PixPaymentPaid.jsx';
    import PixPaymentExpired from '@/components/pix/PixPaymentExpired.jsx';

    const PixPaymentModal = ({ 
      isOpen, 
      onClose, 
      betDetails, 
      onPaymentSuccess
    }) => {
      const { toast } = useToast();
      const { 
        generatePixCharge, 
        isLoading: isLoadingHook, 
        error: hookError, 
        chargeData: hookChargeData,
        setError: setHookError,
        setChargeData: setHookChargeData
      } = usePixPayment();

      const [copied, setCopied] = useState(false);
      const [countdown, setCountdown] = useState(0);
      const [paymentStatus, setPaymentStatus] = useState('idle'); 
      const [pollingIntervalId, setPollingIntervalId] = useState(null);
      
      const currentChargeData = hookChargeData;
      const isLoading = isLoadingHook;
      const error = hookError;

      const resetModalState = useCallback(() => {
        setCopied(false);
        setCountdown(0);
        setPaymentStatus('idle');
        if (pollingIntervalId) clearInterval(pollingIntervalId);
        setPollingIntervalId(null);
        setHookChargeData(null);
        setHookError(null);
      }, [pollingIntervalId, setHookChargeData, setHookError]);

      const handleGenerateInitialCharge = useCallback(async () => {
        if (!betDetails) return;
        setPaymentStatus('generating');
        const newCharge = await generatePixCharge(betDetails);
        if (newCharge) {
          setPaymentStatus('pending');
        } else {
          setPaymentStatus('error');
        }
      }, [betDetails, generatePixCharge]);

      useEffect(() => {
        if (!isOpen) {
          resetModalState();
        } else if (isOpen && betDetails && paymentStatus === 'idle' && !currentChargeData && !isLoading && !error) {
           handleGenerateInitialCharge();
        }
      }, [isOpen, betDetails, paymentStatus, currentChargeData, isLoading, error, resetModalState, handleGenerateInitialCharge]);

      useEffect(() => {
        if (isOpen && currentChargeData?.dataExpiracao && paymentStatus === 'pending') {
          const expirationTime = new Date(currentChargeData.dataExpiracao).getTime();
          const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = expirationTime - now;
            if (distance < 0) {
              setCountdown(0);
              setPaymentStatus('expired');
              if (pollingIntervalId) {
                clearInterval(pollingIntervalId);
                setPollingIntervalId(null);
              }
              return;
            }
            setCountdown(Math.floor(distance / 1000));
          };
          updateCountdown();
          const intervalId = setInterval(updateCountdown, 1000);
          setPollingIntervalId(prevId => { 
            if(prevId) clearInterval(prevId); 
            return intervalId;
          });
          return () => clearInterval(intervalId);
        }
      }, [isOpen, currentChargeData?.dataExpiracao, paymentStatus ]);
      
      useEffect(() => {
        let intervalId = null;
        if (isOpen && currentChargeData?.txid && paymentStatus === 'pending' && betDetails?.userId && betDetails?.id && betDetails?.selectedOption) {
           intervalId = setInterval(async () => {
            try {
              const { data: apostador, error: pollError } = await supabase
                .from('apostadores')
                .select('status')
                .eq('aposta_id', betDetails.id)
                .eq('usuario_id', betDetails.userId)
                .eq('selected_option', betDetails.selectedOption) 
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

              if (pollError && pollError.code !== 'PGRST116') { 
                console.error('Polling error:', pollError);
              } else if (apostador && apostador.status === 'pago') {
                setPaymentStatus('paid');
                toast({ title: "Pagamento Confirmado!", description: `Sua participação na aposta ${betDetails.title} foi registrada.`});
                if(typeof onPaymentSuccess === 'function') onPaymentSuccess();
              }
            } catch (e) {
              console.error('Error during payment status polling:', e);
            }
          }, 5000); 
          setPollingIntervalId(prevId => { 
            if(prevId) clearInterval(prevId); 
            return intervalId;
          });
        }
        
        return () => {
          if (intervalId) {
            clearInterval(intervalId);
          }
        };
      }, [isOpen, currentChargeData?.txid, paymentStatus, betDetails, onPaymentSuccess, toast]);

      useEffect(() => {
        if(paymentStatus === 'paid' || paymentStatus === 'expired') {
            if(pollingIntervalId) {
                clearInterval(pollingIntervalId);
                setPollingIntervalId(null);
            }
        }
      }, [paymentStatus, pollingIntervalId]);

      if (!isOpen) return null;

      const handleCopy = () => {
        if(currentChargeData?.pixCopiaECola) {
          navigator.clipboard.writeText(currentChargeData.pixCopiaECola).then(() => {
            setCopied(true);
            toast({ title: "Copiado!", description: "Código PIX copiado para a área de transferência." });
            setTimeout(() => setCopied(false), 2000);
          });
        }
      };
      
      const handleCloseModal = () => {
        resetModalState();
        onClose();
      }

      const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      };

      const renderContent = () => {
        if (isLoading || paymentStatus === 'generating') {
          return <PixPaymentGenerating />;
        }

        if (error || paymentStatus === 'error') {
          return <PixPaymentError error={error} onRetry={handleGenerateInitialCharge} isLoading={isLoading} />;
        }
        
        if (paymentStatus === 'pending' && currentChargeData) {
          return <PixPaymentPending 
                    chargeData={currentChargeData} 
                    betTitle={betDetails?.title} 
                    copied={copied} 
                    onCopy={handleCopy} 
                    countdown={countdown} 
                    formatTime={formatTime} 
                  />;
        }

        if (paymentStatus === 'paid') {
          return <PixPaymentPaid betTitle={betDetails?.title} />;
        }

        if (paymentStatus === 'expired') {
          return <PixPaymentExpired onRetry={handleGenerateInitialCharge} isLoading={isLoading} />;
        }
        return <div className="min-h-[200px] flex items-center justify-center"><p>Carregando informações do pagamento...</p></div>;
      };

      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 transition-opacity duration-300 ease-in-out"
             style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}>
          <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out"
               style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)', opacity: isOpen ? 1 : 0 }}>
            
            <PixPaymentModalHeader onClose={handleCloseModal} />
            <div className="p-6 space-y-6 min-h-[200px]">
              {renderContent()}
            </div>
            <PixPaymentModalFooter onClose={handleCloseModal} />
          </div>
        </div>
      );
    };

    export default PixPaymentModal;
  