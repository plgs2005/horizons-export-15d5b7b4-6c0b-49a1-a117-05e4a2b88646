// src/components/PixPaymentModal.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from "@/components/ui/use-toast";
import { 
  Copy, 
  Check, 
  Clock, 
  Loader2, 
  X, 
  AlertCircle, 
  RefreshCw,
  CheckCircle2 
} from 'lucide-react';

const PixPaymentModal = ({ 
  isOpen, 
  onClose, 
  betDetails,
  onPaymentSuccess 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, generating, pending, paid, expired, error
  const [chargeData, setChargeData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Reset modal state when opened/closed
  const resetModalState = useCallback(() => {
    setPaymentStatus('idle');
    setChargeData(null);
    setError(null);
    setCopied(false);
    setCountdown(0);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  // Generate PIX charge
  const generatePixCharge = useCallback(async () => {
    if (!betDetails || !user) return;

    setPaymentStatus('generating');
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('create-pix-charge', {
        body: {
          apostId: betDetails.id,
          userId: user.id,
          valor: parseFloat(betDetails.entry_fee),
          selectedOption: betDetails.selectedOption,
          payerName: user.name,
          payerCpf: user.pix_key,
          description: `Aposta: ${betDetails.title}`
        }
      });

      if (invokeError) throw invokeError;
      if (data.error) throw new Error(data.error);

      setChargeData(data);
      setPaymentStatus('pending');
      
      // Start countdown
      if (data.expiracao) {
        const expirationTime = new Date(data.expiracao).getTime();
        const updateCountdown = () => {
          const now = new Date().getTime();
          const distance = expirationTime - now;
          
          if (distance < 0) {
            setCountdown(0);
            setPaymentStatus('expired');
            if (pollingInterval) {
              clearInterval(pollingInterval);
              setPollingInterval(null);
            }
            return;
          }
          
          setCountdown(Math.floor(distance / 1000));
        };
        
        updateCountdown();
        const intervalId = setInterval(updateCountdown, 1000);
        setPollingInterval(intervalId);
      }

    } catch (err) {
      console.error('Error generating PIX charge:', err);
      setError(err.message || 'Erro ao gerar cobrança PIX');
      setPaymentStatus('error');
      toast({
        variant: "destructive",
        title: "Erro ao Gerar PIX",
        description: err.message || 'Não foi possível gerar a cobrança PIX.'
      });
    }
  }, [betDetails, user, toast, pollingInterval]);

  // Start payment status polling
  useEffect(() => {
    if (paymentStatus === 'pending' && chargeData?.txid && user?.id && betDetails?.id) {
      const pollInterval = setInterval(async () => {
        try {
          const { data: apostador, error: pollError } = await supabase
            .from('apostadores')
            .select('status')
            .eq('aposta_id', betDetails.id)
            .eq('usuario_id', user.id)
            .eq('status', 'pago')
            .maybeSingle();

          if (pollError && pollError.code !== 'PGRST116') {
            console.error('Polling error:', pollError);
          } else if (apostador) {
            setPaymentStatus('paid');
            toast({
              title: "Pagamento Confirmado!",
              description: `Sua participação na aposta foi registrada.`
            });
            if (typeof onPaymentSuccess === 'function') {
              onPaymentSuccess();
            }
          }
        } catch (e) {
          console.error('Error during payment status polling:', e);
        }
      }, 3000);

      return () => clearInterval(pollInterval);
    }
  }, [paymentStatus, chargeData?.txid, user?.id, betDetails?.id, onPaymentSuccess, toast]);

  // Initialize charge generation when modal opens
  useEffect(() => {
    if (isOpen && paymentStatus === 'idle') {
      generatePixCharge();
    } else if (!isOpen) {
      resetModalState();
    }
  }, [isOpen, paymentStatus, generatePixCharge, resetModalState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handleCopy = () => {
    if (chargeData?.pixCopiaECola) {
      navigator.clipboard.writeText(chargeData.pixCopiaECola).then(() => {
        setCopied(true);
        toast({
          title: "Copiado!",
          description: "Código PIX copiado para a área de transferência."
        });
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Pagamento PIX
          </h2>
          <button 
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 min-h-[200px]">
          
          {/* Generating State */}
          {paymentStatus === 'generating' && (
            <div className="flex flex-col items-center justify-center space-y-3 py-8">
              <Loader2 size={48} className="text-blue-600 animate-spin" />
              <p className="text-slate-600 dark:text-slate-400">
                Gerando cobrança PIX...
              </p>
            </div>
          )}

          {/* Error State */}
          {paymentStatus === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-md text-center">
              <AlertCircle size={32} className="mx-auto mb-2" />
              <p className="font-semibold">Erro ao Gerar Cobrança</p>
              <p className="text-sm mb-3">{error}</p>
              <button 
                onClick={generatePixCharge}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
              >
                <RefreshCw size={16} className="mr-2" />
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Pending Payment State */}
          {paymentStatus === 'pending' && chargeData && (
            <>
              <p className="text-center text-slate-600 dark:text-slate-400">
                Escaneie o QR Code ou copie o código PIX para pagar a aposta: <strong>{betDetails?.title}</strong>
              </p>
              
              <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <QRCodeSVG 
                  value={chargeData.pixCopiaECola} 
                  size={180} 
                  includeMargin={true} 
                  level="H" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  PIX Copia e Cola:
                </label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={chargeData.pixCopiaECola} 
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-sm truncate"
                  />
                  <button 
                    onClick={handleCopy}
                    className="p-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    {copied ? (
                      <Check size={20} className="text-green-500" />
                    ) : (
                      <Copy size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-center text-blue-600 dark:text-blue-400 font-semibold text-lg flex items-center justify-center">
                <Clock size={20} className="mr-2" />
                Expira em: {formatTime(countdown)}
              </div>

              <div className="flex flex-col items-center justify-center pt-2">
                <Loader2 size={24} className="text-blue-600 animate-spin" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Aguardando confirmação do pagamento...
                </p>
              </div>
            </>
          )}

          {/* Payment Confirmed State */}
          {paymentStatus === 'paid' && (
            <div className="text-center py-8">
              <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-semibold text-green-600 dark:text-green-400">
                Pagamento Confirmado!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Sua participação na aposta <strong>{betDetails?.title}</strong> foi registrada com sucesso.
              </p>
            </div>
          )}

          {/* Expired State */}
          {paymentStatus === 'expired' && (
            <div className="text-center py-8">
              <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-red-600 dark:text-red-400">
                Cobrança PIX Expirada!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                O tempo para pagamento desta cobrança PIX terminou.
              </p>
              <button 
                onClick={generatePixCharge}
                className="mt-4 bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md text-sm font-medium inline-flex items-center"
              >
                <RefreshCw size={16} className="mr-2" />
                Gerar Nova Cobrança PIX
              </button>
            </div>
          )}
          
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 text-right">
          <button 
            onClick={handleClose}
            className="px-6 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-md transition-colors"
          >
            Fechar
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default PixPaymentModal;
