
    -- Certifique-se de que a extensão uuid-ossp está habilitada
    -- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Tabela de Perfis de Usuários
    CREATE TABLE IF NOT EXISTS public.profiles (
        id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
        email text UNIQUE,
        name text,
        apelido text,
        role text DEFAULT 'participante'::text, -- 'participante', 'manager', 'admin'
        is_active boolean DEFAULT true,
        pix_key text,
        avatar_url text,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE -- Garante que o perfil é de um usuário auth
    );
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Tabela de Apostas (Bolões)
    CREATE TABLE IF NOT EXISTS public.bets (
        id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
        title text NOT NULL,
        description text,
        options jsonb NOT NULL, -- Ex: [{"name": "Opção A", "value": "opt_a"}, {"name": "Opção B", "value": "opt_b"}]
        correct_option text, -- Armazena o 'value' da opção correta
        created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
        category text,
        status text DEFAULT 'Aberta'::text NOT NULL, -- 'Aberta', 'Fechada', 'Em Andamento', 'Finalizada', 'Cancelada'
        result text, -- Descrição do resultado final
        image_url text,
        max_participants integer,
        entry_fee numeric DEFAULT 0,
        prize_pool numeric DEFAULT 0,
        close_date timestamp with time zone NOT NULL, -- Data e hora limite para apostar
        result_date timestamp with time zone, -- Data e hora da divulgação do resultado
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        participants_count integer DEFAULT 0,
        is_public boolean DEFAULT true,
        private_access_code text -- Para bolões privados
    );
    ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

    -- Tabela de Apostadores (quem apostou em qual bolão)
    CREATE TABLE IF NOT EXISTS public.apostadores (
        id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
        aposta_id uuid NOT NULL REFERENCES public.bets(id) ON DELETE CASCADE,
        usuario_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        selected_option text NOT NULL, -- 'value' da opção escolhida pelo apostador
        status text DEFAULT 'Pendente'::text NOT NULL, -- 'Pendente', 'Pago', 'Cancelado', 'Vencedor', 'Perdedor'
        metodo_pagamento text, -- 'PIX', 'Dinheiro'
        valor_apostado numeric NOT NULL,
        data_aposta timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        UNIQUE (aposta_id, usuario_id) -- Um usuário só pode fazer uma aposta por bolão
    );
    ALTER TABLE public.apostadores ENABLE ROW LEVEL SECURITY;

    -- Tabela de Pagamentos (histórico de transações PIX, etc.)
    CREATE TABLE IF NOT EXISTS public.pagamentos (
        id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
        apostador_id uuid REFERENCES public.apostadores(id) ON DELETE SET NULL, -- Pagamento de entrada
        ganhador_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- Pagamento de prêmio
        aposta_id uuid REFERENCES public.bets(id) ON DELETE CASCADE, -- A qual aposta se refere
        tipo text NOT NULL, -- 'ENTRADA', 'PREMIO'
        status text DEFAULT 'Pendente'::text NOT NULL, -- 'Pendente', 'Processando', 'Concluido', 'Falhou', 'Reembolsado'
        tentativas_efi integer DEFAULT 0,
        valor_enviado numeric,
        txid_efi text, -- ID da transação na Efí
        log_erro_efi jsonb, -- Para armazenar erros da API Efí
        data_criacao timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        data_ultima_atualizacao timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
    );
    ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

    -- Policies de Exemplo (AJUSTAR CONFORME NECESSÁRIO PARA SEGURANÇA)

    -- Profiles
    CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
    CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    CREATE POLICY "Allow users to insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

    -- Bets
    CREATE POLICY "Allow public read access to public bets" ON public.bets FOR SELECT USING (is_public = true OR created_by = auth.uid());
    CREATE POLICY "Allow authenticated users to create bets" ON public.bets FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager'));
    CREATE POLICY "Allow bet creators or admins to update bets" ON public.bets FOR UPDATE USING (auth.uid() = created_by OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') WITH CHECK (auth.uid() = created_by OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
    CREATE POLICY "Allow bet creators or admins to delete bets" ON public.bets FOR DELETE USING (auth.uid() = created_by OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


    -- Apostadores
    CREATE POLICY "Allow users to see their own bets and bets they participate in" ON public.apostadores FOR SELECT USING (auth.uid() = usuario_id OR aposta_id IN (SELECT id FROM public.bets WHERE created_by = auth.uid()));
    CREATE POLICY "Allow authenticated users to place bets" ON public.apostadores FOR INSERT WITH CHECK (auth.uid() = usuario_id AND (SELECT status FROM public.bets WHERE id = aposta_id) = 'Aberta');
    CREATE POLICY "Allow bet creators/admins to update bettor status (e.g. payment)" ON public.apostadores FOR UPDATE USING (
        auth.uid() = (SELECT created_by FROM public.bets WHERE id = aposta_id) OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

    -- Pagamentos
    -- (Definir policies mais restritivas, geralmente apenas admins ou o sistema via service_role podem criar/atualizar pagamentos)
    CREATE POLICY "Allow admins to manage payments" ON public.pagamentos FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
    CREATE POLICY "Allow users to see their own payment entries" ON public.pagamentos FOR SELECT USING (
        apostador_id IN (SELECT id FROM public.apostadores WHERE usuario_id = auth.uid()) OR
        ganhador_id = auth.uid()
    );


    -- Funções para Triggers (Exemplo: atualizar contagem de participantes)
    CREATE OR REPLACE FUNCTION public.update_bet_participants_count()
    RETURNS TRIGGER AS $$
    BEGIN
        IF (TG_OP = 'INSERT') THEN
            UPDATE public.bets
            SET participants_count = COALESCE(participants_count, 0) + 1,
                prize_pool = COALESCE(prize_pool, 0) + NEW.valor_apostado
            WHERE id = NEW.aposta_id;
        ELSIF (TG_OP = 'DELETE') THEN
            UPDATE public.bets
            SET participants_count = GREATEST(0, COALESCE(participants_count, 1) - 1),
                prize_pool = GREATEST(0, COALESCE(prize_pool, NEW.valor_apostado) - OLD.valor_apostado)
            WHERE id = OLD.aposta_id;
        END IF;
        RETURN NULL; -- resultado é ignorado para AFTER triggers
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE TRIGGER on_apostador_change
    AFTER INSERT OR DELETE ON public.apostadores
    FOR EACH ROW EXECUTE FUNCTION public.update_bet_participants_count();

    -- Função para atualizar 'updated_at' automaticamente
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = timezone('utc', now());
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

    CREATE TRIGGER set_bets_updated_at
    BEFORE UPDATE ON public.bets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

    CREATE TRIGGER set_apostadores_updated_at
    BEFORE UPDATE ON public.apostadores
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

    CREATE TRIGGER set_pagamentos_updated_at
    BEFORE UPDATE ON public.pagamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

    -- Habilitar RLS para as tabelas (se ainda não estiver)
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.apostadores ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

    -- Storage: Criar bucket para avatars (se não existir)
    -- No painel do Supabase: Storage -> Create Bucket
    -- Nome: avatars
    -- Acesso Público: Sim (para exibir avatares publicamente)
    -- Allowed MIME types: image/jpeg, image/png, image/gif (ou conforme necessário)
    -- File size limit: ex: 1MB

    -- RLS para Storage (Avatars)
    -- Permite que usuários autenticados façam upload no bucket 'avatars'
    CREATE POLICY "Allow authenticated uploads to avatars"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK ( bucket_id = 'avatars' );

    -- Permite que qualquer um leia (SELECT) objetos do bucket 'avatars' (se o bucket for público)
    CREATE POLICY "Public read access for avatars"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'avatars' );

    -- Permite que usuários atualizem/deletem seus próprios avatares
    -- (O nome do arquivo geralmente contém o user_id para facilitar essa policy)
    CREATE POLICY "Allow users to manage their own avatars"
    ON storage.objects FOR UPDATE USING ( auth.uid() = owner AND name LIKE auth.uid()::text || '%' )
    WITH CHECK ( auth.uid() = owner AND name LIKE auth.uid()::text || '%' );

    CREATE POLICY "Allow users to delete their own avatars"
    ON storage.objects FOR DELETE USING ( auth.uid() = owner AND name LIKE auth.uid()::text || '%' );

  