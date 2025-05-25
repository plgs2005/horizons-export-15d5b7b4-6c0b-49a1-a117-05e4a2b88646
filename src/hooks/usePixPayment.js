
    import { useState, useCallback } from 'react';
    import { supabase } from '@/lib/utils';
    import EfiPixService from '@/services/efiPixService.js';
    import { useAuth } from '@/contexts/AuthContext.jsx';
    import { useToast } from "@/components/ui/use-toast";

    const usePixPayment = () => {
      const { user, profile } = useAuth();
      const { toast } = useToast();
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState(null);
      const [chargeData, setChargeData] = useState(null);

      const efiService = new EfiPixService(
        import.meta.env.VITE_EFI_CLIENT_ID, 
        import.meta.env.VITE_EFI_CLIENT_SECRET,
        import.meta.env.VITE_EFI_SANDBOX === 'true',
        import.meta.env.VITE_EFI_PIX_KEY 
      );

      const generatePixCharge = useCallback(async (betDetails) => {
        if (!user || !profile) {
          setError('Usuário não autenticado ou perfil não carregado.');
          toast({ title: "Erro", description: "Usuário não autenticado. Faça login para continuar.", variant: "destructive" });
          return null;
        }
        
        if (!profile.pix_key || !profile.name) {
             setError('CPF/CNPJ ou Nome não encontrado no perfil do usuário para o devedor.');
             toast({ title: "Dados Incompletos", description: "Seu CPF/CNPJ e Nome completo são necessários para gerar a cobrança PIX. Por favor, complete seu perfil.", variant: "destructive" });
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

          const devedorCpf = profile.pix_key; 
          const devedorNome = profile.name;
          const infoAdicionais = [{ nome: "Aposta", valor: betDetails.title }];
          const expiracaoSegundos = 30 * 60; // 30 minutos

          const efiChargeResponse = await efiService.createImmediateCharge(
            amount,
            devedorCpf,
            devedorNome,
            infoAdicionais,
            expiracaoSegundos
          );
          
          setChargeData(efiChargeResponse);

          const { error: apostadorError } = await supabase
            .from('apostadores')
            .insert({
              aposta_id: betDetails.id,
              usuario_id: user.id,
              selected_option: betDetails.selectedOption,
              valor_apostado: amount,
              status: 'pendente', 
              metodo_pagamento: 'pix_efi',
              data_aposta: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (apostadorError) {
            console.error('Supabase error inserting apostador:', apostadorError);
            throw new Error(`Falha ao registrar sua participação na aposta: ${apostadorError.message}`);
          }
          
          const { error: pagamentoError } = await supabase
            .from('pagamentos')
            .insert({
              aposta_id: betDetails.id,
              apostador_id: null, 
              tipo: 'entrada_aposta',
              status: 'pendente_efi',
              valor_enviado: amount,
              txid_efi: efiChargeResponse.txid,
              data_criacao: new Date().toISOString(),
              data_ultima_atualizacao: new Date().toISOString(),
            });
          
          if (pagamentoError) {
            console.error('Supabase error inserting pagamento:', pagamentoError);
            throw new Error(`Falha ao registrar o pagamento: ${pagamentoError.message}`);
          }
          
          toast({ title: "Cobrança PIX Gerada", description: "Escaneie o QR Code ou copie o código para pagar." });
          return efiChargeResponse;

        } catch (err) {
          console.error('Error generating PIX charge or saving to Supabase:', err);
          setError(err.message || 'Ocorreu um erro desconhecido.');
          toast({ title: "Erro ao Gerar PIX", description: err.message || 'Não foi possível gerar a cobrança PIX.', variant: "destructive" });
          return null;
        } finally {
          setIsLoading(false);
        }
      }, [user, profile, efiService, toast]);

      return { generatePixCharge, isLoading, error, chargeData, setError, setChargeData };
    };

    export default usePixPayment;
  