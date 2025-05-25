
    import React, { useState, useEffect } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { Checkbox } from '@/components/ui/checkbox';
    import { useToast } from '@/components/ui/use-toast';
    import { AlertCircle, Save, Loader2, Info, Terminal, Wifi, WifiOff, Eye, EyeOff, HelpCircle } from 'lucide-react';
    import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
    import { supabase } from '@/lib/supabase.jsx';
    import {
      Popover,
      PopoverContent,
      PopoverTrigger,
    } from "@/components/ui/popover";

    const SETTINGS_KEY_PAYMENTS = 'pagoul_system_settings_payments';

    const PaymentIntegrationSettingsCard = () => {
      const { toast } = useToast();
      const [efiClientIdSecretNameState, setEfiClientIdSecretNameState] = useState('EFI_CLIENT_ID');
      const [showClientIdSecretName, setShowClientIdSecretName] = useState(false);
      const [efiClientSecretSecretNameState, setEfiClientSecretSecretNameState] = useState('EFI_CLIENT_SECRET');
      const [showClientSecretSecretName, setShowClientSecretSecretName] = useState(false);
      const [useEfiSandboxState, setUseEfiSandboxState] = useState(true);
      const [isSavingPayments, setIsSavingPayments] = useState(false);
      const [isTestingConnection, setIsTestingConnection] = useState(false);
      const [testLog, setTestLog] = useState([]);

      useEffect(() => {
        const saved = localStorage.getItem(SETTINGS_KEY_PAYMENTS);
        if (saved) {
          const s = JSON.parse(saved);
          setEfiClientIdSecretNameState(s.efiClientIdSecretName || 'EFI_CLIENT_ID');
          setEfiClientSecretSecretNameState(s.efiClientSecretSecretName || 'EFI_CLIENT_SECRET');
          setUseEfiSandboxState(typeof s.useEfiSandbox === 'boolean' ? s.useEfiSandbox : true);
        }
      }, []);

      const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setTestLog(prevLog => [...prevLog, { timestamp, message, type }]);
      };

      const handleSavePaymentSettings = async (e) => {
        e.preventDefault();
        setIsSavingPayments(true);
        const settingsToSave = { 
          efiClientIdSecretName: efiClientIdSecretNameState, 
          efiClientSecretSecretName: efiClientSecretSecretNameState, 
          useEfiSandbox: useEfiSandboxState 
        };
        localStorage.setItem(SETTINGS_KEY_PAYMENTS, JSON.stringify(settingsToSave));
        
        addLog("Configurações de pagamento salvas localmente.", "success");
        addLog("Lembre-se: Os valores reais dos segredos devem estar configurados no Supabase com os nomes exatos fornecidos aqui.", "warning");

        await new Promise(resolve => setTimeout(resolve, 700));
        setIsSavingPayments(false);
        toast({ title: "Configurações de Pagamento Salvas", description: "As configurações de integração de pagamento foram atualizadas localmente." });
      };

      const handleTestConnection = async () => {
        setIsTestingConnection(true);
        setTestLog([]);
        addLog("Iniciando teste de conexão PIX Efí...");

        try {
          addLog(`Usando modo Sandbox: ${useEfiSandboxState}`);
          addLog(`Nome do segredo Client ID (enviado para Edge Function): ${efiClientIdSecretNameState}`);
          addLog(`Nome do segredo Client Secret (enviado para Edge Function): ${efiClientSecretSecretNameState}`);

          const { data, error: functionError } = await supabase.functions.invoke('efi-test-connection', {
            body: { 
              useSandbox: useEfiSandboxState,
              clientIdName: efiClientIdSecretNameState,
              clientSecretName: efiClientSecretSecretNameState,
            }
          });
          
          if (functionError) {
            throw functionError;
          }
          
          addLog(`Resposta bruta da Edge Function: ${JSON.stringify(data)}`, 'info');

          if (data && data.status === "debug_success" && data.simple_tests) {
            addLog("Formato de resposta 'efi-test-debug' detectado.", "info");
            data.simple_tests.forEach(test => {
              let logType = 'info';
              if (test.status === 'SUCCESS') logType = 'success';
              else if (test.status === 'BLOCKED' || test.status === 'FAILURE') logType = 'error';
              else if (test.status === 'SKIPPED') logType = 'warning';
              addLog(`${test.name}: ${test.status} - ${test.error || test.http_status || ''}`, logType);
            });
            addLog(`Conclusão Efí: ${data.efi_conclusion || 'N/A'}`, data.efi_conclusion === 'EFI_CONNECTION_OK' ? 'success' : 'warning');
            addLog(`Recomendação: ${data.recommendation || 'N/A'}`, 'info');

            if (data.efi_conclusion === 'EFI_CONNECTION_OK') {
              toast({ title: "Teste de Conexão Efí", description: data.recommendation || "Conexão com Efí parece OK!" });
            } else if (data.efi_conclusion === 'MISSING_SUPABASE_SECRETS') {
              toast({ variant: "destructive", title: "Segredos Supabase Ausentes", description: data.recommendation });
            } else {
              toast({ variant: "destructive", title: "Falha no Teste de Conexão Efí", description: data.recommendation || "Verifique os logs para detalhes." });
            }
          } else if (data && data.status === "success" && data.message) {
            addLog("Formato de resposta 'efi-test-connection' (simples) detectado.", "info");
            addLog(`Mensagem: ${data.message}`, "success");
            toast({ title: "Teste de Conexão Efí", description: data.message });
          } else if (data && data.status === "error" && (data.error || data.details)) {
            addLog("Formato de resposta 'efi-test-connection' (erro) detectado.", "info");
            addLog(`Erro: ${data.error} - Detalhes: ${data.details || 'N/A'}`, "error");
            toast({ variant: "destructive", title: "Erro no Teste de Conexão Efí", description: data.details || data.error });
          } else {
            addLog(`Resposta inesperada da Edge Function. Verifique a implementação da função 'efi-test-connection'.`, "warning");
            toast({ variant: "destructive", title: "Resposta inesperada", description: "A Edge Function retornou uma resposta não esperada."});
          }

        } catch (err) {
          let errorMessage = err.message;
          if (err.context && err.context.errorMessage) {
             errorMessage = err.context.errorMessage;
          } else if (err.details) {
            errorMessage = err.details;
          }
          
          addLog(`Erro crítico ao invocar Edge Function: ${errorMessage}`, "error");
          console.error("Error testing PIX connection:", err);
          toast({ variant: "destructive", title: "Erro ao Testar Conexão", description: `Falha ao invocar a Edge Function. ${errorMessage}` });
        } finally {
          setIsTestingConnection(false);
        }
      };


      return (
        <Card className="shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl text-slate-700 dark:text-slate-200">Integrações de Pagamento (Efí)</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Configure os nomes dos segredos do Supabase para a API da Efí e o modo Sandbox.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePaymentSettings} className="space-y-6">
              <Alert variant="info" className="bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700">
                <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <AlertTitle className="font-semibold text-blue-700 dark:text-blue-300">Configuração de Segredos e Sandbox</AlertTitle>
                <AlertDescription className="text-blue-600 dark:text-blue-400 space-y-1">
                  <p>Insira abaixo os <strong className="font-semibold">nomes exatos</strong> dos segredos (Client ID e Client Secret) que você configurou no seu projeto Supabase (em Project Settings &gt; Secrets).</p>
                  <p>Exemplos: <code className="bg-slate-200 dark:bg-slate-700 text-blue-800 dark:text-blue-200 px-1 rounded text-xs">EFI_CLIENT_ID</code>, <code className="bg-slate-200 dark:bg-slate-700 text-blue-800 dark:text-blue-200 px-1 rounded text-xs">EFI_CLIENT_SECRET</code>.</p>
                  <p>As Edge Functions usarão esses nomes para buscar os valores reais dos segredos.</p>
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="efiClientIdSecretName" className="font-medium text-slate-600 dark:text-slate-300">Nome do Segredo para Client ID da Efí</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-0 h-6 w-6 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                <HelpCircle size={16} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 text-sm">
                            Este é o NOME do segredo que você criou no Supabase (em Project Settings &gt; Secrets) para armazenar o Client ID da Efí. 
                            Por exemplo, se você criou um segredo chamado <code className="font-mono text-xs">EFI_CLIENT_ID_SANDBOX</code>, digite esse nome aqui.
                            A Edge Function usará este nome para buscar o valor real do segredo.
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="relative">
                  <Input 
                    id="efiClientIdSecretName" 
                    type={showClientIdSecretName ? "text" : "password"}
                    value={efiClientIdSecretNameState}
                    onChange={(e) => setEfiClientIdSecretNameState(e.target.value)}
                    placeholder="Ex: EFI_CLIENT_ID"
                    className="border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 px-0"
                    onClick={() => setShowClientIdSecretName(!showClientIdSecretName)}
                  >
                    {showClientIdSecretName ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="efiClientSecretSecretName" className="font-medium text-slate-600 dark:text-slate-300">Nome do Segredo para Client Secret da Efí</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-0 h-6 w-6 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                <HelpCircle size={16} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 text-sm">
                            Este é o NOME do segredo que você criou no Supabase para armazenar o Client Secret da Efí. 
                            Por exemplo, <code className="font-mono text-xs">EFI_CLIENT_SECRET_SANDBOX</code>.
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="relative">
                    <Input 
                      id="efiClientSecretSecretName" 
                      type={showClientSecretSecretName ? "text" : "password"}
                      value={efiClientSecretSecretNameState}
                      onChange={(e) => setEfiClientSecretSecretNameState(e.target.value)}
                      placeholder="Ex: EFI_CLIENT_SECRET"
                      className="border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 pr-10"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 px-0"
                        onClick={() => setShowClientSecretSecretName(!showClientSecretSecretName)}
                    >
                        {showClientSecretSecretName ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="useEfiSandbox"
                  checked={useEfiSandboxState}
                  onCheckedChange={setUseEfiSandboxState}
                  className="dark:border-slate-500"
                />
                <Label htmlFor="useEfiSandbox" className="text-sm font-normal text-slate-600 dark:text-slate-400">
                  Ativar modo Sandbox da Efí
                </Label>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 -mt-1">
                Se marcado, a Edge Function deve usar as credenciais de Sandbox e o endpoint de Sandbox da Efí.
              </p>
              
               <Alert variant="warning" className="bg-amber-50 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700">
                <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                <AlertTitle className="font-semibold text-amber-700 dark:text-amber-300">Importante: Nomes dos Segredos</AlertTitle>
                <AlertDescription className="text-amber-600 dark:text-amber-400">
                  Certifique-se de que os nomes dos segredos inseridos acima (<code className="bg-slate-200 dark:bg-slate-700 text-amber-800 dark:text-amber-200 px-1 rounded text-xs">{efiClientIdSecretNameState || "EFI_CLIENT_ID"}</code> e <code className="bg-slate-200 dark:bg-slate-700 text-amber-800 dark:text-amber-200 px-1 rounded text-xs">{efiClientSecretSecretNameState || "EFI_CLIENT_SECRET"}</code>)
                  correspondem <strong className="font-semibold">exatamente</strong> aos nomes dos segredos configurados no seu projeto Supabase (Project Settings &gt; Secrets).
                  Qualquer diferença, incluindo espaços ou newlines (<code className="font-mono text-xs">\n</code>), fará com que a Edge Function não encontre os segredos.
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isSavingPayments}>
                 {isSavingPayments ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                 Salvar Configurações de Pagamento
              </Button>
            </form>

            <div className="mt-8 space-y-4">
              <Button onClick={handleTestConnection} className="w-full" variant="outline" disabled={isTestingConnection}>
                {isTestingConnection ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wifi className="mr-2 h-4 w-4" />}
                Testar Conexão com API PIX Efí
              </Button>
              {testLog.length > 0 && (
                <div className="mt-4 p-4 bg-slate-900 dark:bg-black rounded-md max-h-72 overflow-y-auto">
                  <div className="flex items-center mb-2">
                    <Terminal className="h-5 w-5 mr-2 text-green-400" />
                    <h4 className="text-sm font-semibold text-slate-300 dark:text-slate-400">Log do Teste:</h4>
                  </div>
                  {testLog.map((entry, index) => (
                    <p key={index} className={`text-xs font-mono break-all ${
                      entry.type === 'error' ? 'text-red-400' : 
                      entry.type === 'success' ? 'text-green-400' : 
                      entry.type === 'warning' ? 'text-yellow-400' : 
                      'text-slate-400 dark:text-slate-500'
                    }`}>
                      <span className="text-slate-500 dark:text-slate-600">[{entry.timestamp}]</span> {entry.message}
                    </p>
                  ))}
                   {!isTestingConnection && testLog.some(log => log.type === 'error' || log.message?.toLowerCase().includes('blocked') || log.message?.toLowerCase().includes('failure') || log.message?.toLowerCase().includes('ausentes')) && (
                    <p className="text-xs font-mono text-red-400 mt-2">
                      <WifiOff className="inline h-4 w-4 mr-1" /> Teste falhou ou indicou problemas. Verifique os logs e as configurações, especialmente os nomes dos segredos no Supabase.
                    </p>
                  )}
                  {!isTestingConnection && testLog.length > 0 && !testLog.some(log => log.type === 'error' || log.message?.toLowerCase().includes('blocked') || log.message?.toLowerCase().includes('failure') || log.message?.toLowerCase().includes('ausentes')) && (
                    <p className="text-xs font-mono text-green-400 mt-2">
                      <Wifi className="inline h-4 w-4 mr-1" /> Teste concluído. Verifique os logs para detalhes.
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    };

    export default PaymentIntegrationSettingsCard;
  