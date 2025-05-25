
    # PAGOUL! - Apostas entre Amigos

    Bem-vindo ao PAGOUL!, uma plataforma vibrante para criar e participar de bolões e apostas entre amigos. Este README fornecerá todas as informações necessárias para configurar, executar e entender o projeto localmente.

    ## Visão Geral do Projeto

    PAGOUL! permite que usuários se cadastrem, criem apostas (bolões) sobre diversos temas, definam opções, taxas de entrada e convidem amigos para participar. A plataforma gerencia os participantes, os valores apostados e, futuramente, a distribuição dos prêmios, com integração de pagamento via PIX (Efí). Possui um painel de administração para gerenciamento de usuários, apostas e configurações do sistema.

    ## Tecnologias Utilizadas

    *   **Frontend:**
        *   React 18.2.0
        *   Vite (Build Tool e Dev Server)
        *   React Router 6.16.0 (Navegação)
        *   TailwindCSS 3.3.3 (Estilização)
        *   shadcn/ui (Componentes de UI baseados em Radix UI)
        *   Lucide React (Ícones)
        *   Framer Motion (Animações)
        *   JavaScript (.jsx para componentes React, .js para utilitários)
    *   **Backend (BaaS):**
        *   Supabase (Banco de Dados PostgreSQL, Autenticação, Storage, Edge Functions)
    *   **Pagamentos:**
        *   Efí (API PIX) - Integração via Supabase Edge Function

    ## Pré-requisitos

    *   Node.js (versão especificada em `.nvmrc`, atualmente `20.19.1`)
        *   Recomendamos usar o [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) para gerenciar as versões do Node.js.
    *   npm (geralmente vem com o Node.js)
    *   Uma conta no [Supabase](https://supabase.com/)
    *   Uma conta na [Efí (antiga Gerencianet)](https://efi.com.br/) (para funcionalidade de pagamento)

    ## Configuração do Ambiente Local

    1.  **Clonar o Repositório:**
        ```bash
        git clone <URL_DO_SEU_REPOSITORIO>
        cd pagoul-app
        ```

    2.  **Configurar a Versão do Node.js (usando nvm):**
        ```bash
        nvm install
        nvm use
        ```

    3.  **Instalar Dependências:**
        ```bash
        npm install
        ```

    ## Configuração do Supabase

    1.  **Criar Projeto no Supabase:**
        *   Acesse o [painel do Supabase](https://app.supabase.com/) e crie um novo projeto.
        *   Guarde o **URL do Projeto** e a **Chave Anônima (Anon Key)**.

    2.  **Configurar Variáveis de Ambiente no Frontend:**
        *   Crie um arquivo chamado `.env` na raiz do projeto.
        *   Copie o conteúdo do arquivo `.env.example` para o seu novo `.env`.
        *   Preencha as seguintes variáveis com as informações do seu projeto Supabase:
            ```env
            VITE_SUPABASE_URL=SUA_SUPABASE_URL
            VITE_SUPABASE_ANON_KEY=SUA_SUPABASE_ANON_KEY
            ```

    3.  **Configurar o Banco de Dados:**
        *   No painel do seu projeto Supabase, vá para "SQL Editor".
        *   Clique em "+ New query".
        *   Copie todo o conteúdo do arquivo `database_schema.sql` (que está na raiz deste projeto) e cole no editor SQL.
        *   Clique em "RUN". Isso criará todas as tabelas e relações necessárias.

    4.  **Configurar Segredos do Supabase (para API Efí e outros):**
        *   No painel do Supabase, vá para "Project Settings" -> "Secrets".
        *   Adicione os seguintes segredos. Os valores para `EFI_CLIENT_ID` e `EFI_CLIENT_SECRET` você obterá do seu painel da Efí (distinguindo entre ambiente de sandbox e produção).
            *   `EFI_CLIENT_ID`: Seu Client ID da Efí.
            *   `EFI_CLIENT_SECRET`: Seu Client Secret da Efí.
            *   `SUPABASE_URL`: O URL do seu projeto Supabase (o mesmo de `VITE_SUPABASE_URL`).
            *   `SUPABASE_ANON_KEY`: Sua chave anônima do Supabase (a mesma de `VITE_SUPABASE_ANON_KEY`).
            *   `SUPABASE_SERVICE_ROLE_KEY`: Encontrada em "Project Settings" -> "API" -> "Service role key" no Supabase (esta chave tem mais privilégios e é usada por Edge Functions seguras, se necessário).
            *   `EFI_SANDBOX`: Configure como `true` ou `false` (string) para indicar se a Edge Function deve usar o ambiente de sandbox da Efí. (Este não é um segredo em si, mas uma configuração que a Edge Function pode ler do ambiente).

    5.  **Implantar Edge Functions:**
        *   Atualmente, temos a função `efi-test-connection`.
        *   **Instalar a Supabase CLI:** Siga as [instruções oficiais](https://supabase.com/docs/guides/cli/getting-started).
        *   **Login na Supabase CLI:**
            ```bash
            supabase login
            ```
        *   **Linkar com seu projeto Supabase:**
            ```bash
            supabase link --project-ref SEU_PROJECT_ID
            ```
            (Você encontra o `SEU_PROJECT_ID` na URL do seu painel Supabase ou em "Project Settings" -> "General").
        *   **Criar a Edge Function:**
            O código da função `efi-test-connection` já foi fornecido em interações anteriores. Você precisará criar o arquivo localmente, por exemplo: `supabase/functions/efi-test-connection/index.ts`.
            O conteúdo da função `efi-test-connection` é:
            ```typescript
            // Conteúdo da supabase/functions/efi-test-connection/index.ts
            import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

            const defaultHeaders = {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
              "Content-Type": "application/json",
            };

            serve(async (req) => {
              if (req.method === "OPTIONS") {
                return new Response("ok", { headers: defaultHeaders });
              }

              let body;
              try {
                if (req.headers.get("content-type")?.includes("application/json")) {
                  body = await req.json();
                } else {
                  return new Response(
                    JSON.stringify({ error: "Request body must be JSON.", details: `Content-Type: ${req.headers.get("content-type")}` }),
                    { status: 400, headers: defaultHeaders }
                  );
                }
              } catch (e) {
                console.error("Error parsing JSON body:", e.message);
                return new Response(
                  JSON.stringify({ error: "Invalid JSON body.", details: e.message }),
                  { status: 400, headers: defaultHeaders }
                );
              }

              const { useSandbox, clientIdName, clientSecretName } = body;

              if (!clientIdName) {
                return new Response(JSON.stringify({ error: "Client ID Name (clientIdName) must be provided." }), {
                  status: 400,
                  headers: defaultHeaders,
                });
              }
              if (!clientSecretName) {
                return new Response(JSON.stringify({ error: "Client Secret Name (clientSecretName) must be provided." }), {
                  status: 400,
                  headers: defaultHeaders,
                });
              }
              if (typeof useSandbox !== 'boolean') {
                return new Response(JSON.stringify({ error: "useSandbox (boolean) must be provided." }), {
                  status: 400,
                  headers: defaultHeaders,
                });
              }

              const EFI_CLIENT_ID = Deno.env.get(clientIdName);
              const EFI_CLIENT_SECRET = Deno.env.get(clientSecretName);

              if (!EFI_CLIENT_ID) {
                return new Response(JSON.stringify({ error: `Supabase secret for Client ID ('${clientIdName}') not found.` }), {
                  status: 500,
                  headers: defaultHeaders,
                });
              }
              if (!EFI_CLIENT_SECRET) {
                return new Response(JSON.stringify({ error: `Supabase secret for Client Secret ('${clientSecretName}') not found.` }), {
                  status: 500,
                  headers: defaultHeaders,
                });
              }
              
              const authString = btoa(`${EFI_CLIENT_ID}:${EFI_CLIENT_SECRET}`);
              const efiAuthUrl = useSandbox 
                ? "https://apisandbox.developer.efi.com.br/oauth/token"
                : "https://api.efi.com.br/oauth/token";

              try {
                const response = await fetch(efiAuthUrl, {
                  method: "POST",
                  headers: {
                    "Authorization": `Basic ${authString}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ grant_type: "client_credentials" }),
                });

                const responseData = await response.json();

                if (!response.ok) {
                  return new Response(
                    JSON.stringify({ 
                      error: "Failed to authenticate with Efí API.", 
                      details: responseData,
                      status: response.status
                    }),
                    { status: response.status, headers: defaultHeaders }
                  );
                }
                
                return new Response(JSON.stringify({ message: "Successfully authenticated with Efí API!", data: responseData }), {
                  status: 200,
                  headers: defaultHeaders,
                });

              } catch (error) {
                console.error("Error during Efí API call:", error);
                return new Response(JSON.stringify({ error: "Internal server error during Efí API call.", details: error.message }), {
                  status: 500,
                  headers: defaultHeaders,
                });
              }
            });
            ```
        *   **Implantar a Função:**
            ```bash
            supabase functions deploy efi-test-connection --no-verify-jwt
            ```
            (A flag `--no-verify-jwt` é usada se a função não requer um JWT de usuário autenticado para ser chamada. Se ela precisar, remova a flag e garanta que o frontend envie o token de autenticação).

    ## Variáveis de Ambiente (Resumo)

    *   `.env` (na raiz do projeto frontend):
        *   `VITE_SUPABASE_URL`: URL do seu projeto Supabase.
        *   `VITE_SUPABASE_ANON_KEY`: Chave anônima do seu projeto Supabase.

    *   Segredos no Painel do Supabase (Project Settings -> Secrets):
        *   `EFI_CLIENT_ID`
        *   `EFI_CLIENT_SECRET`
        *   `SUPABASE_URL`
        *   `SUPABASE_ANON_KEY`
        *   `SUPABASE_SERVICE_ROLE_KEY`
        *   `EFI_SANDBOX` (opcional, como configuração para a Edge Function)

    ## Como Executar o Projeto

    Após a configuração completa, inicie o servidor de desenvolvimento Vite:

    ```bash
    npm run dev
    ```
    O aplicativo estará disponível em `http://localhost:5173` (ou outra porta, se a 5173 estiver ocupada).

    ## Como Fazer o Build para Produção

    Para criar uma versão otimizada para produção:

    ```bash
    npm run build
    ```
    Os arquivos de build estarão na pasta `dist/`.

    ## Estrutura do Projeto

    ```
    pagoul-app/
    ├── public/               # Arquivos estáticos
    ├── supabase/             # Configurações e funções do Supabase (gerenciadas pela Supabase CLI)
    │   └── functions/
    │       └── efi-test-connection/
    │           └── index.ts  # Código da Edge Function
    ├── src/
    │   ├── assets/           # Imagens, fontes, etc.
    │   ├── components/       # Componentes React reutilizáveis
    │   │   ├── ui/           # Componentes shadcn/ui (botões, inputs, cards, etc.)
    │   │   ├── admin/        # Componentes específicos do painel de administração
    │   │   ├── bets/         # Componentes relacionados a apostas (cards, formulários)
    │   │   └── ...           # Outros componentes genéricos (Layout, Logo Animado, etc.)
    │   ├── contexts/         # Contextos React (AuthContext, BetContext, ThemeContext)
    │   ├── hooks/            # Hooks customizados (se houver)
    │   ├── lib/              # Bibliotecas auxiliares e configuração de clientes
    │   │   ├── supabase.jsx  # Configuração do cliente Supabase e funções auxiliares
    │   │   ├── betService.js # Lógica de serviço para operações de apostas com Supabase
    │   │   └── utils.js      # Funções utilitárias genéricas (ex: cn para classnames)
    │   ├── pages/            # Componentes de página (rotas principais)
    │   │   ├── admin/        # Sub-rotas e componentes do painel de administração
    │   │   └── ...           # HomePage, AuthPage, BetsPage, etc.
    │   ├── services/         # Lógica de chamadas API (se não estiver em contextos/lib)
    │   ├── styles/           # Arquivos CSS globais ou específicos (se index.css não for suficiente)
    │   ├── App.jsx           # Componente raiz da aplicação, define rotas e providers
    │   ├── main.jsx          # Ponto de entrada da aplicação React
    │   └── index.css         # Estilos globais TailwindCSS
    ├── .env                  # Variáveis de ambiente locais (NÃO versionar)
    ├── .env.example          # Exemplo de arquivo .env
    ├── .eslintrc.cjs         # Configuração do ESLint
    ├── .gitignore            # Arquivos ignorados pelo Git
    ├── .nvmrc                # Versão do Node.js recomendada
    ├── database_schema.sql   # Schema do banco de dados para Supabase
    ├── index.html            # Arquivo HTML principal
    ├── package.json          # Dependências e scripts do projeto
    ├── postcss.config.js     # Configuração do PostCSS (para TailwindCSS)
    ├── tailwind.config.js    # Configuração do TailwindCSS
    └── vite.config.js        # Configuração do Vite
    ```

    ### Fluxo de Dados e Autenticação

    *   **Autenticação:** Gerenciada pelo `AuthContext.jsx` usando Supabase Auth.
        *   Login com link mágico.
        *   Persistência de sessão.
        *   Verificação de perfil completo (nome, chave PIX); caso contrário, um modal (`ProfileCompletionModal.jsx`) é exibido.
        *   Controle de rotas protegidas e rotas de administrador (`ProtectedRoute` em `App.jsx`).
    *   **Gerenciamento de Apostas:** Gerenciado pelo `BetContext.jsx` e `lib/betService.js`.
        *   Busca, criação, atualização e participação em apostas.
        *   Interação direta com as tabelas `bets`, `apostadores`, e `profiles` do Supabase.
    *   **Temas:** Gerenciado pelo `ThemeContext.jsx` (claro, escuro, sistema).
    *   **Estado Global:** Os contextos fornecem estado e funções para seus respectivos domínios.
    *   **Componentes de UI:** Reutilização extensiva de componentes `shadcn/ui` customizados e componentes próprios.

    ## Principais Funcionalidades Implementadas

    *   Autenticação de usuários (Magic Link).
    *   Criação e listagem de apostas.
    *   Detalhes da aposta com informações e formulário para apostar.
    *   Contagem regressiva para o fechamento das apostas.
    *   Perfil do usuário (visualização e edição).
    *   Modal para forçar o preenchimento do perfil.
    *   Painel de Administração (em desenvolvimento) com:
        *   Visão geral.
        *   Gerenciamento de usuários.
        *   Gerenciamento de apostas.
        *   Configurações do sistema (gerais, apostas, integração de pagamento).
        *   Teste de conexão com API PIX da Efí (via Edge Function).
    *   Temas claro/escuro/sistema.
    *   Layout responsivo com navegação principal e mobile.
    *   Animações sutis com Framer Motion.
    *   SplashScreen e PageLoader personalizados.

    ## Pontos de Atenção e Próximos Passos

    *   **Finalizar CRUDs no Admin:** As operações de Criar, Ler, Atualizar e Deletar no painel de administração ainda precisam ser totalmente implementadas com Supabase.
    *   **Lógica de Pagamento PIX:** A integração com a Efí para processar pagamentos (entrada nas apostas e distribuição de prêmios) é a próxima grande funcionalidade. A Edge Function `efi-test-connection` é apenas o primeiro passo.
    *   **Notificações:** Implementar um sistema de notificações para usuários.
    *   **Testes:** Adicionar testes unitários e de integração.
    *   **Validações:** Melhorar validações de formulário no frontend e, se necessário, adicionar RLS (Row Level Security) e Policies no Supabase para maior segurança no backend.
    *   **Otimizações:** Continuar monitorando performance e otimizar queries e renderizações conforme necessário.
    *   **Segurança:** Revisar todas as interações com Supabase e Edge Functions para garantir as melhores práticas de segurança.
    *   **Documentação de API (Edge Functions):** Se mais Edge Functions forem criadas, documentar seus endpoints e payloads.

    ---

    Este handover deve fornecer uma base sólida para continuar o desenvolvimento do PAGOUL!. Se tiver dúvidas, consulte a documentação das tecnologias utilizadas e o código existente. Boa sorte!
  