
    import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = 'https://aorrtyshybjgxkmvoxcr.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvcnJ0eXNoeWJqZ3hrbXZveGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MTMxMDgsImV4cCI6MjA2Mjk4OTEwOH0.5Ywa9AdK_bc3HZB7uGoMSx_MrXaqvhIc_l5xsWa2gno';

    export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    export const getCurrentUser = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        return null;
      }
      if (!session?.user) {
        return null;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116: "Row to update not found" (no profile yet)
        console.error('Error fetching profile:', profileError);
        return { ...session.user, email: session.user.email }; // Return basic user if profile fetch fails
      }
      
      if (!profile) {
         const newUserMetadata = session.user.user_metadata || {};
         const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ 
            id: session.user.id, 
            email: session.user.email,
            name: newUserMetadata.name || session.user.email, 
            role: newUserMetadata.role || 'participante',
            is_active: typeof newUserMetadata.is_active === 'boolean' ? newUserMetadata.is_active : true,
            pix_key: newUserMetadata.pix_key || null,
            avatar_url: newUserMetadata.avatar_url || `https://avatar.vercel.sh/${session.user.email}.png`
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Error inserting new profile:', insertError);
          return { ...session.user, email: session.user.email }; // Return basic user if profile insert fails
        }
        return { ...session.user, ...newProfile };
      }

      return { ...session.user, ...profile }; // Combine auth user data with profile data
    };

    export const updateProfile = async (userId, updates) => {
      const profileUpdates = { ...updates };
      delete profileUpdates.id;
      delete profileUpdates.email;
      delete profileUpdates.created_at;
      delete profileUpdates.updated_at;

      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      
      // Update auth user metadata if role is changed
      if (updates.role && updates.role !== (await supabase.auth.getUser()).data.user?.user_metadata?.role) {
        const { error: authUpdateError } = await supabase.auth.updateUser({
          data: { role: updates.role } 
        });
        if (authUpdateError) console.error("Error updating auth user metadata for role:", authUpdateError);
      }
      // Update auth user metadata if is_active is changed
      if (typeof updates.is_active === 'boolean' && updates.is_active !== (await supabase.auth.getUser()).data.user?.user_metadata?.is_active) {
        const { error: authUpdateError } = await supabase.auth.updateUser({
          data: { is_active: updates.is_active } 
        });
        if (authUpdateError) console.error("Error updating auth user metadata for is_active:", authUpdateError);
      }


      return data;
    };

    export const uploadAvatar = async (userId, file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    };

    export const getAllUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error("Error fetching all users:", error);
        throw error;
      }
      return data;
    };

    export const updateUserStatus = async (userId, isActive) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating user status:", error);
        throw error;
      }

      // Also update Supabase Auth user_metadata if necessary
      const { data: { user: authUser }, error: authUserError } = await supabase.auth.getUser(userId);
      if (authUser && authUser.user_metadata?.is_active !== isActive) {
        await supabase.auth.updateUser({ data: { is_active: isActive } });
      }

      return data;
    };
  