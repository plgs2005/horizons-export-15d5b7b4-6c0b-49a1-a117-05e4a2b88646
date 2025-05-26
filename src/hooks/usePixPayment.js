// src/hooks/usePixPayment.js

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from "@/components/ui/use-toast";

const usePixPayment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chargeData, setChargeData] = useState(null);

  const generatePixCharge = useCallback(async (betDetails) => {
    if (!user) {
      setError('Usuário não autenticado.');
      toast({ 
        title: "Erro", 
        description: "Usuário não autenticado. Faça login para continuar.", 
        variant: "destructive" 
      });
      return null;
    }
    
    if (!user.pix_key || !user.name) {
      setError('Chave PIX ou Nome não encontrado no perfil do usuário.');
      toast({ 
        title: "Dados Incompletos", 
        description: "Sua chave PIX e nome completo são necessários. Complete seu perfil.", 
        variant: "destructive" 
      });
      return null;
    }

    setIsLoading(true);
    setError(null);
    setChargeData(null);

    try {
      const amount = parseFloat(betDetails.entry_fee);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Valor da aposta inválido.');
      }

      const { data, error: invokeError } = await supabase.functions.invoke('create-pix-charge', {
        body: {
          apostId: betDetails.id,
          userId: user.id,
          valor: amount,
          selectedOption: betDetails.selectedOption,
          payerName: user.name,
          payerCpf: user.pix_key,
          description: `Aposta: ${betDetails.title}`
        }
      });
      
      if (invokeError) throw invokeError;
      if (data.error) throw new Error(data.error);
      
      setChargeData(data);
      toast({ 
        title: "Cobrança PIX Gerada", 
        description: "Escaneie o QR Code ou copie o código para pagar." 
      });
      
      return data;

    } catch (err) {
      console.error('Error generating PIX charge:', err);
      setError(err.message || 'Ocorreu um erro desconhecido.');
      toast({ 
        title: "Erro ao Gerar PIX", 
        description: err.message || 'Não foi possível gerar a cobrança PIX.', 
        variant: "destructive" 
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const checkPaymentStatus = useCallback(async (apostId, userId) => {
    try {
      const { data: apostador, error: pollError } = await supabase
        .from('apostadores')
        .select('status')
        .eq('aposta_id', apostId)
        .eq('usuario_id', userId)
        .eq('status', 'pago')
        .maybeSingle();

      if (pollError && pollError.code !== 'PGRST116') {
        throw pollError;
      }
      
      return !!apostador;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setChargeData(null);
  }, []);

  return { 
    generatePixCharge, 
    checkPaymentStatus,
    isLoading, 
    error, 
    chargeData, 
    setError, 
    setChargeData,
    reset
  };
};

export default usePixPayment;
