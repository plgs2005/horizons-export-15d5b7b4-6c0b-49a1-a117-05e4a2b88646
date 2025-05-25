
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
          } else {
            parsedOptions = parsedOptions.map(opt => 
              typeof opt === 'string' ? { name: opt, value: opt } : (opt && typeof opt === 'object' ? opt : { name: String(opt), value: String(opt) })
            );
          }
        } catch (e) {
          console.error("Error parsing bet options:", e, "Options received:", bet.options);
          parsedOptions = [];
        }
      }

      return {
        ...bet,
        options: parsedOptions,
        manager_email: managerProfile?.email,
        manager_name: managerProfile?.name || managerProfile?.apelido || 'Desconhecido',
        manager_avatar_url: managerProfile?.avatar_url,
        created_by: bet.created_by, 
        participants_count: bet.apostadores?.length || bet.participants_count || 0,
        prize_pool: bet.apostadores?.reduce((sum, p) => sum + (p.valor_apostado || 0), 0) || bet.prize_pool || 0,
        apostadores: bet.apostadores?.map(ap => ({
          ...ap,
          profile: ap.profiles 
        })) || [],
      };
    };

    export const fetchBetsFromSupabase = async (filters = {}) => {
      let query = supabase
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

      if (filters.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error("Fetch error from fetchBetsFromSupabase:", error.message);
        throw error;
      }
      return data ? data.map(transformBetData) : [];
    };

    export const addBetToSupabase = async (newBetData, userId) => {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      const isUserAdmin = userProfile?.role === 'admin';
      
      const finalIsPublic = isUserAdmin ? newBetData.is_public : false;
      const finalAccessCode = finalIsPublic ? null : newBetData.private_access_code;

      const betPayload = {
        ...newBetData,
        created_by: userId,
        status: 'Aberta', 
        participants_count: 0,
        prize_pool: 0,
        options: JSON.stringify(newBetData.options.map(opt => ({name: opt.name || opt.value, value: opt.value || opt.name }))),
        is_public: finalIsPublic, 
        private_access_code: finalAccessCode,
        image_url: newBetData.image_url || null,
        max_participants: newBetData.max_participants || null,
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
        console.error("Fetch error from addBetToSupabase:", error.message, "Payload:", betPayload);
        throw error;
      }
      return transformBetData(newBet);
    };

    export const updateBetInSupabase = async (betId, updatedBetData, userId) => {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      const isUserAdmin = userProfile?.role === 'admin';

      const payload = { ...updatedBetData };
      if (payload.options && Array.isArray(payload.options)) {
        payload.options = JSON.stringify(payload.options.map(opt => ({name: opt.name || opt.value, value: opt.value || opt.name })));
      }
      
      if (!isUserAdmin && payload.hasOwnProperty('is_public')) {
        // Non-admins cannot change publicity. If the bet is already private, it stays private.
        // If they somehow try to make it public, this ensures it's ignored or forced to false.
        // For simplicity, we can fetch the current bet's is_public status or just disallow change.
        // The RLS policy will be the ultimate enforcer.
        // Here, we ensure that if is_public is in payload from non-admin, it's set to false.
        payload.is_public = false; 
      }
      
      if (payload.is_public === true) { // If admin makes it public
        payload.private_access_code = null;
      } else if (payload.is_public === false && !payload.private_access_code) { // If admin makes it private and no code provided
         payload.private_access_code = Math.random().toString(36).substring(2, 8).toUpperCase();
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
        console.error("Fetch error from updateBetInSupabase:", error.message, "Payload:", payload);
        throw error;
      }
      return transformBetData(updatedBet);
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
      return { newParticipant, updatedBetData: transformBetData(updatedBetData) };
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
      return transformBetData(updatedBet);
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
      if (error && error.code !== 'PGRST116') { 
        console.error("Fetch error from getBetByIdFromSupabase:", error.message);
        throw error;
      }
      return transformBetData(data); 
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
      
      return combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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

    export const hasUserBetOnBet = async (userId, betId) => {
      const { data, error, count } = await supabase
        .from('apostadores')
        .select('id', { count: 'exact', head: true })
        .eq('usuario_id', userId)
        .eq('aposta_id', betId)
        .eq('status', 'pago'); 
    
      if (error) {
        console.error('Error checking if user has bet:', error);
        return false; 
      }
      return count > 0;
    };
  