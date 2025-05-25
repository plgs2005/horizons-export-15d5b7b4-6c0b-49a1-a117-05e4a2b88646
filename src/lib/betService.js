
    import { supabase } from '@/lib/supabase.jsx';

    export const transformBetData = (bet) => {
      if (!bet) return null;
      
      const managerProfile = bet.profiles; 

      let parsedOptions = [];
      if (bet.options) {
        try {
          if (typeof bet.options === 'string') {
            parsedOptions = JSON.parse(bet.options);
          } else {
            parsedOptions = bet.options; 
          }
          if (!Array.isArray(parsedOptions)) {
            parsedOptions = [];
          }
        } catch (e) {
          console.error("Error parsing bet options:", e, "Options received:", bet.options);
          parsedOptions = [];
        }
      }

      return {
        ...bet,
        options: parsedOptions.map(opt => (typeof opt === 'string' ? { name: opt, value: opt } : opt)),
        manager_email: managerProfile?.email,
        manager_name: managerProfile?.name || managerProfile?.apelido || 'Desconhecido',
        manager_avatar_url: managerProfile?.avatar_url,
        created_by: bet.created_by, // Ensure created_by (user_id) is passed through
        participants_count: bet.apostadores?.length || bet.participants_count || 0,
        prize_pool: bet.apostadores?.reduce((sum, p) => sum + (p.valor_apostado || 0), 0) || bet.prize_pool || 0,
        apostadores: bet.apostadores?.map(ap => ({
          ...ap,
          profile: ap.profiles 
        })) || [],
      };
    };

    export const fetchBetsFromSupabase = async () => {
      const { data, error } = await supabase
        .from('bets')
        .select(`
          *,
          profiles:created_by (id, name, email, avatar_url, apelido),
          apostadores (
            id,
            usuario_id,
            valor_apostado,
            metodo_pagamento,
            status,
            selected_option,
            profiles:usuario_id (id, name, avatar_url, apelido)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Fetch error from fetchBetsFromSupabase:", error.message);
        throw error;
      }
      return data || [];
    };

    export const addBetToSupabase = async (newBetData, userId) => {
      const betPayload = {
        ...newBetData,
        created_by: userId,
        status: 'Aberta', 
        participants_count: 0,
        prize_pool: 0,
        options: JSON.stringify(newBetData.options) 
      };
      
      const { data: newBet, error } = await supabase
        .from('bets')
        .insert(betPayload)
        .select(`
          *,
          profiles:created_by (id, name, email, avatar_url, apelido)
        `)
        .single();

      if (error) {
        console.error("Fetch error from addBetToSupabase:", error.message);
        throw error;
      }
      return newBet;
    };

    export const updateBetInSupabase = async (betId, updatedBetData) => {
      const payload = { ...updatedBetData };
      if (payload.options && Array.isArray(payload.options)) {
        payload.options = JSON.stringify(payload.options);
      }

      const { data: updatedBet, error } = await supabase
        .from('bets')
        .update(payload)
        .eq('id', betId)
        .select(`
          *,
          profiles:created_by (id, name, email, avatar_url, apelido),
          apostadores (
            id,
            usuario_id,
            valor_apostado,
            metodo_pagamento,
            status,
            selected_option,
            profiles:usuario_id (id, name, avatar_url, apelido)
          )
        `)
        .single();
      
      if (error) {
        console.error("Fetch error from updateBetInSupabase:", error.message);
        throw error;
      }
      return updatedBet;
    };

    export const deleteBetFromSupabase = async (betId) => {
      await supabase.from('apostadores').delete().eq('aposta_id', betId);
      
      const { error } = await supabase
        .from('bets')
        .delete()
        .eq('id', betId);

      if (error) {
        console.error("Fetch error from deleteBetFromSupabase:", error.message);
        throw error;
      }
      return true;
    };

    export const placeBetInSupabase = async (betId, userId, chosenOptionValue, amount, paymentMethod) => {
      const betPayload = {
        aposta_id: betId,
        usuario_id: userId,
        selected_option: chosenOptionValue,
        valor_apostado: parseFloat(amount),
        status: paymentMethod === 'PIX' ? 'pago' : 'pendente', 
        metodo_pagamento: paymentMethod,
        data_aposta: new Date().toISOString(),
      };

      const { data: newParticipant, error } = await supabase
        .from('apostadores')
        .insert(betPayload)
        .select(`
          *,
          profiles:usuario_id (id, name, avatar_url, apelido)
        `)
        .single();
      
      if (error) {
        console.error("Insert error from placeBetInSupabase (newParticipant):", error.message);
        throw error;
      }

      const { data: updatedBetData, error: fetchError } = await supabase
        .from('bets')
        .select(`
          *,
          profiles:created_by (id, name, email, avatar_url, apelido),
          apostadores (
            id,
            usuario_id,
            valor_apostado,
            metodo_pagamento,
            status,
            selected_option,
            profiles:usuario_id (id, name, avatar_url, apelido)
          )
        `)
        .eq('id', betId)
        .single();

      if (fetchError) {
        console.error("Fetch error from placeBetInSupabase (updatedBetData):", fetchError.message);
        throw fetchError;
      }
      return { newParticipant, updatedBetData };
    };

    export const endBetInSupabase = async (betId, winningOptionValue, resultDescription) => {
      const { data: updatedBet, error } = await supabase
        .from('bets')
        .update({ 
          status: 'Encerrada', 
          correct_option: winningOptionValue,
          result: resultDescription || `Opção vencedora: ${winningOptionValue}`,
          result_date: new Date().toISOString()
        })
        .eq('id', betId)
        .select(`
          *,
          profiles:created_by (id, name, email, avatar_url, apelido),
          apostadores (
            id,
            usuario_id,
            valor_apostado,
            metodo_pagamento,
            status,
            selected_option,
            profiles:usuario_id (id, name, avatar_url, apelido)
          )
        `)
        .single();
      
      if (error) {
        console.error("Fetch error from endBetInSupabase:", error.message);
        throw error;
      }
      return updatedBet;
    };

    export const getBetByIdFromSupabase = async (id) => {
      const { data, error } = await supabase
        .from('bets')
        .select(`
          *,
          profiles:created_by (id, name, email, avatar_url, apelido),
          apostadores (
            id,
            usuario_id,
            valor_apostado,
            metodo_pagamento,
            status,
            selected_option,
            profiles:usuario_id (id, name, avatar_url, apelido)
          )
        `)
        .eq('id', id)
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116: "Searched item was not found" - not a critical error, just means no bet with that ID
        console.error("Fetch error from getBetByIdFromSupabase:", error.message);
        throw error;
      }
      return data; // Can be null if not found, which is fine
    };

    export const getUserBetsFromSupabase = async (userId) => {
      const { data: participantData, error: participantError } = await supabase
        .from('apostadores')
        .select(`
          *,
          bets (
            *,
            profiles:created_by (id, name, email, avatar_url, apelido)
          )
        `)
        .eq('usuario_id', userId);

      if (participantError) {
        console.error("Fetch error from getUserBetsFromSupabase (participantData):", participantError.message);
        throw participantError;
      }
      
      const userPlacedBets = participantData
        .filter(ab => ab.bets) 
        .map(ab => ({
          ...transformBetData(ab.bets),
          user_bet_amount: ab.valor_apostado,
          user_bet_status: ab.status,
          user_selected_option: ab.selected_option,
        }));

      const { data: managedBetsData, error: managedError } = await supabase
        .from('bets')
        .select(`
          *,
          profiles:created_by (id, name, email, avatar_url, apelido),
          apostadores (
            id,
            usuario_id,
            valor_apostado,
            selected_option,
            profiles:usuario_id (id, name, avatar_url, apelido)
          )
        `)
        .eq('created_by', userId);

      if (managedError) {
        console.error("Fetch error from getUserBetsFromSupabase (managedBetsData):", managedError.message);
        throw managedError;
      }
      
      const transformedManagedBets = managedBetsData.map(bet => ({
        ...transformBetData(bet),
        is_manager: true
      }));
      
      const combined = [...userPlacedBets];
      transformedManagedBets.forEach(mb => {
        if (!combined.find(upb => upb.id === mb.id)) {
          combined.push(mb);
        } else {
          const existingBetIndex = combined.findIndex(upb => upb.id === mb.id);
          if (existingBetIndex !== -1) {
            combined[existingBetIndex].is_manager = true;
          }
        }
      });
      
      return combined;
    };

    export const confirmParticipantPaymentInSupabase = async (participantId) => {
        const { data, error } = await supabase
            .from('apostadores')
            .update({ status: 'pago' })
            .eq('id', participantId)
            .select()
            .single();
        
        if (error) {
            console.error("Error confirming payment in Supabase:", error);
            throw error;
        }
        return data;
    };
  