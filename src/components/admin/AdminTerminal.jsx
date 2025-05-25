
    import React, { useState, useEffect, useRef } from 'react';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Terminal, ChevronRight, Download, Edit3, Eye, Server, Wifi, ShieldCheck, Power, AlertTriangle, CheckCircle, Info, HelpCircle, Trash2 } from 'lucide-react';
    import { supabase } from '@/lib/utils';
    import EfiPixService from '@/services/efiPixService.js';
    import { useToast } from '@/components/ui/use-toast';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

    // Helper functions for terminal commands
    const processEnvCommand = (args, envVars, setEnvVars, addOutput, setIsEnvEditorOpen, setCurrentEditingEnvVars) => {
      const subCommand = args[0]?.toLowerCase();
      switch (subCommand) {
        case 'create':
          const envContent = Object.entries(envVars)
            .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
            .join('\n');
          const blob = new Blob([envContent], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = '.env';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          addOutput({ type: 'success', icon: <Download size={16} />, text: "Arquivo .env gerado e download iniciado. Coloque-o na raiz do seu projeto." });
          addOutput({ type: 'info', text: "Conteúdo gerado:" });
          envContent.split('\n').forEach(line => addOutput({type: 'info', text: `  ${line}`}));
          break;
        case 'edit':
          setCurrentEditingEnvVars({ ...envVars });
          setIsEnvEditorOpen(true);
          addOutput({ type: 'system', icon: <Edit3 size={16} />, text: "Editor visual de variáveis de ambiente aberto." });
          break;
        case 'show':
          addOutput({ type: 'system', icon: <Eye size={16} />, text: "Variáveis de ambiente atuais (simuladas):" });
          Object.entries(envVars).forEach(([key, value]) => {
            addOutput({ type: 'info', text: `  ${key}=${JSON.stringify(value)}` });
          });
          break;
        default:
          addOutput({ type: 'error', icon: <AlertTriangle size={16} />, text: `Subcomando 'env ${subCommand || ""}' inválido. Use 'create', 'edit', ou 'show'.` });
      }
    };

    const processSupabaseTest = async (addOutput) => {
      addOutput({ type: 'system', icon: <Server size={16} />, text: "Testando conexão com Supabase (frontend)..." });
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) {
          addOutput({ type: 'success', icon: <ShieldCheck size={16} />, text: `Supabase conectado. Usuário autenticado: ${user.email}` });
        } else {
          addOutput({ type: 'success', icon: <ShieldCheck size={16} />, text: `Supabase conectado. Nenhum usuário autenticado (sessão anônima).` });
        }
      } catch (error) {
        addOutput({ type: 'error', icon: <AlertTriangle size={16} />, text: `Erro ao conectar com Supabase: ${error.message}` });
      }
    };

    const processEfiTest = async (addOutput, envVars) => {
      addOutput({ type: 'system', icon: <Wifi size={16} />, text: "Testando API Efí (frontend)..." });
      const efiService = new EfiPixService({
          clientId: envVars.VITE_EFI_CLIENT_ID,
          clientSecret: envVars.VITE_EFI_CLIENT_SECRET,
          sandbox: envVars.VITE_EFI_SANDBOX === "true",
          pixKey: envVars.VITE_EFI_PIX_KEY
      });
      try {
        const token = await efiService.getAccessToken();
        if (token) {
          addOutput({ type: 'success', icon: <CheckCircle size={16} />, text: `Conexão com API Efí bem-sucedida. Access token obtido (primeiros 10 chars): ${token.substring(0,10)}...` });
        } else {
          addOutput({ type: 'error', icon: <AlertTriangle size={16} />, text: "Falha ao obter access token da Efí." });
        }
      } catch (error) {
        addOutput({ type: 'error', icon: <AlertTriangle size={16} />, text: `Erro ao conectar com API Efí: ${error.message || 'Erro desconhecido'}` });
      }
    };

    const processDeploy = (addOutput) => {
      addOutput({ type: 'system', icon: <Power size={16} />, text: "Simulando processo de deploy..." });
      addOutput({ type: 'info', text: "  Verificando dependências... OK" });
      addOutput({ type: 'info', text: "  Compilando assets... OK" });
      addOutput({ type: 'info', text: "  Otimizando imagens... OK" });
      addOutput({ type: 'info', text: "  Enviando para servidor... 25%..." });
      setTimeout(() => addOutput({ type: 'info', text: "  Enviando para servidor... 50%..." }), 500);
      setTimeout(() => addOutput({ type: 'info', text: "  Enviando para servidor... 75%..." }), 1000);
      setTimeout(() => {
          addOutput({ type: 'info', text: "  Enviando para servidor... 100%... OK" });
          addOutput({ type: 'success', icon: <CheckCircle size={16} />, text: "Deploy simulado concluído com sucesso!" });
      }, 1500);
    };

    const processStatus = (addOutput) => {
      addOutput({ type: 'system', icon: <Info size={16} />, text: "Status do Projeto (Simulado):" });
      addOutput({ type: 'info', text: `  Nome do Projeto: pagoul-app (Exemplo)` });
      addOutput({ type: 'info', text: `  Versão: 0.0.1 (Exemplo)` });
      addOutput({ type: 'info', text: `  Ambiente: Desenvolvimento` });
      addOutput({ type: 'info', text: `  Conectividade Supabase: Use 'supabase test'` });
      addOutput({ type: 'info', text: `  Conectividade Efí (Frontend): Use 'efi test'` });
    };

    const CommandProcessor = ({ commandStr, envVars, setEnvVars, addOutput, setIsEnvEditorOpen, setCurrentEditingEnvVars }) => {
      const [command, ...args] = commandStr.trim().split(/\s+/);
      
      useEffect(() => {
        const executeCommand = async () => {
          addOutput({ type: 'command', text: `$ ${commandStr}` });
          switch (command.toLowerCase()) {
            case 'help':
              addOutput({ type: 'system', icon: <HelpCircle size={16} />, text: "Comandos disponíveis:" });
              addOutput({ type: 'info', text: "  env create          - Gera conteúdo para .env e oferece download." });
              addOutput({ type: 'info', text: "  env edit            - Abre editor visual para variáveis de ambiente (simulado)." });
              addOutput({ type: 'info', text: "  env show            - Mostra variáveis de ambiente atuais (simulado)." });
              addOutput({ type: 'info', text: "  supabase test       - Testa conexão com Supabase (frontend)." });
              addOutput({ type: 'info', text: "  efi test            - Testa API Efí via frontend." });
              addOutput({ type: 'info', text: "  deploy              - Simula um processo de deploy." });
              addOutput({ type: 'info', text: "  status              - Mostra status simulado do projeto." });
              addOutput({ type: 'info', text: "  clear               - Limpa o terminal." });
              addOutput({ type: 'info', text: "  help                - Lista todos os comandos." });
              break;
            case 'env':
              processEnvCommand(args, envVars, setEnvVars, addOutput, setIsEnvEditorOpen, setCurrentEditingEnvVars);
              break;
            case 'supabase':
              if (args[0]?.toLowerCase() === 'test') await processSupabaseTest(addOutput);
              else addOutput({ type: 'error', icon: <AlertTriangle size={16} />, text: `Comando 'supabase' inválido. Use 'supabase test'.` });
              break;
            case 'efi':
              if (args[0]?.toLowerCase() === 'test') await processEfiTest(addOutput, envVars);
              else addOutput({ type: 'error', icon: <AlertTriangle size={16} />, text: `Comando 'efi' inválido. Use 'efi test'.` });
              break;
            case 'deploy':
              processDeploy(addOutput);
              break;
            case 'status':
              processStatus(addOutput);
              break;
            case 'clear':
              addOutput({ type: 'clear_signal' }); // Special signal for setOutput to handle
              break;
            default:
              if (commandStr.trim() !== "") {
                addOutput({ type: 'error', icon: <AlertTriangle size={16} />, text: `Comando não reconhecido: ${commandStr}. Digite 'help'.` });
              }
          }
        };
        if(commandStr) executeCommand();
      }, [commandStr, envVars, setEnvVars, addOutput, setIsEnvEditorOpen, setCurrentEditingEnvVars]); // Removed command, args from dependency

      return null; // This component does not render anything itself
    };


    const AdminTerminal = () => {
      const [input, setInput] = useState('');
      const [output, setOutput] = useState([]);
      const [history, setHistory] = useState([]);
      const [historyIndex, setHistoryIndex] = useState(-1);
      const [envVars, setEnvVars] = useState({
        VITE_EFI_CLIENT_ID: "YOUR_EFI_CLIENT_ID_SANDBOX",
        VITE_EFI_CLIENT_SECRET: "YOUR_EFI_CLIENT_SECRET_SANDBOX",
        VITE_EFI_SANDBOX: "true",
        VITE_EFI_PIX_KEY: "your-pix-key@example.com",
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "COPIED_FROM_SUPABASE_SETTINGS",
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "COPIED_FROM_SUPABASE_SETTINGS",
      });
      const [isEnvEditorOpen, setIsEnvEditorOpen] = useState(false);
      const [currentEditingEnvVars, setCurrentEditingEnvVars] = useState({});
      const [commandToProcess, setCommandToProcess] = useState('');

      const outputEndRef = useRef(null);
      const inputRef = useRef(null);
      const { toast } = useToast();

      const scrollToBottom = () => {
        outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      useEffect(scrollToBottom, [output]);

      const addOutputLocal = (newOutput) => {
        if (newOutput.type === 'clear_signal') {
          setOutput([]);
        } else {
          setOutput(prev => [...prev, { ...newOutput, timestamp: new Date().toLocaleTimeString() }]);
        }
      };
      
      useEffect(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
        addOutputLocal({ type: 'system', icon: <Info size={16} />, text: "Bem-vindo ao Terminal Admin Simulado. Digite 'help' para ver os comandos." });
      }, []);


      const handleInputChange = (e) => {
        setInput(e.target.value);
      };
      
      const handleSaveEnvVars = () => {
        setEnvVars(currentEditingEnvVars);
        setIsEnvEditorOpen(false);
        addOutputLocal({ type: 'success', icon: <CheckCircle size={16} />, text: "Variáveis de ambiente (simuladas) atualizadas." });
        toast({ title: "Variáveis de Ambiente Salvas", description: "As alterações foram salvas no estado do terminal." });
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() === '') return;
        setCommandToProcess(input); // Set command to be processed by CommandProcessor
        if (history[history.length -1] !== input) {
            setHistory(prev => [...prev, input]);
        }
        setHistoryIndex(history.length); 
        setInput('');
      };

      const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (history.length > 0) {
            const newIndex = historyIndex <= 0 ? history.length - 1 : historyIndex - 1;
            setHistoryIndex(newIndex);
            setInput(history[newIndex] || '');
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (history.length > 0) {
            const newIndex = historyIndex >= history.length -1 ? -1 : historyIndex + 1;
            setHistoryIndex(newIndex);
            setInput(history[newIndex] || '');
          }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const knownCommands = ['env ', 'supabase ', 'efi ', 'deploy', 'status', 'clear', 'help'];
            const matchingCommand = knownCommands.find(cmd => cmd.startsWith(input.toLowerCase()));
            if (matchingCommand) {
                setInput(matchingCommand);
            }
        }
      };
      
      const quickActions = [
        { label: "Gerar .env", command: "env create", icon: <Download size={14} className="mr-1.5"/> },
        { label: "Editar .env (Sim.)", command: "env edit", icon: <Edit3 size={14} className="mr-1.5"/> },
        { label: "Testar Supabase", command: "supabase test", icon: <Server size={14} className="mr-1.5"/> },
        { label: "Testar Efí (Frontend)", command: "efi test", icon: <Wifi size={14} className="mr-1.5"/> },
      ];

      return (
        <div className="h-[calc(100vh-10rem)] flex flex-col bg-slate-900 dark:bg-black text-slate-100 rounded-lg shadow-2xl overflow-hidden border border-slate-700 dark:border-slate-800">
          {commandToProcess && 
            <CommandProcessor 
              commandStr={commandToProcess} 
              envVars={envVars} 
              setEnvVars={setEnvVars} 
              addOutput={addOutputLocal} 
              setIsEnvEditorOpen={setIsEnvEditorOpen} 
              setCurrentEditingEnvVars={setCurrentEditingEnvVars} 
            />
          }
          <div className="p-3 bg-slate-800 dark:bg-slate-900 border-b border-slate-700 dark:border-slate-800 flex items-center">
            <Terminal className="mr-2 text-green-400" />
            <span className="font-semibold text-sm">Admin Terminal Simulado</span>
          </div>
          
          <div className="p-2 space-x-2 border-b border-slate-700 dark:border-slate-800 bg-slate-800/50 dark:bg-slate-900/50">
            {quickActions.map(action => (
                <Button key={action.label} variant="outline" size="sm" 
                    className="text-xs bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200"
                    onClick={() => { setCommandToProcess(action.command); setInput(''); }}>
                    {action.icon}
                    {action.label}
                </Button>
            ))}
            <Button variant="outline" size="sm" className="text-xs bg-red-700/50 hover:bg-red-600/50 border-red-600 text-red-200" onClick={() => setOutput([])}>
                <Trash2 size={14} className="mr-1.5"/> Limpar
            </Button>
          </div>

          <div 
            className="flex-grow p-4 overflow-y-auto font-mono text-xs space-y-1"
            onClick={() => inputRef.current?.focus()}
          >
            {output.map((line, index) => (
              <div key={index} className={`flex items-start ${
                line.type === 'command' ? 'text-sky-300' :
                line.type === 'error' ? 'text-red-400' :
                line.type === 'success' ? 'text-green-400' :
                line.type === 'system' ? 'text-purple-300' :
                line.type === 'info' ? 'text-slate-300' : 'text-slate-400'
              }`}>
                <span className="text-slate-500 mr-2 select-none">[{line.timestamp}]</span>
                {line.icon && <span className="mr-1.5 mt-0.5 select-none">{line.icon}</span>}
                <span className="flex-1 whitespace-pre-wrap break-all">{line.text}</span>
              </div>
            ))}
            <div ref={outputEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-700 dark:border-slate-800 bg-slate-800 dark:bg-slate-900 flex items-center">
            <ChevronRight className="mr-2 text-green-400" />
            <Input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Digite um comando..."
              className="flex-grow bg-transparent border-none focus:ring-0 focus-visible:ring-0 text-slate-100 placeholder-slate-500 text-sm"
              autoComplete="off"
              spellCheck="false"
            />
          </form>

          <Dialog open={isEnvEditorOpen} onOpenChange={setIsEnvEditorOpen}>
            <DialogContent className="sm:max-w-[600px] bg-slate-800 dark:bg-slate-900 border-slate-700 dark:border-slate-600">
              <DialogHeader>
                <DialogTitle className="text-slate-100">Editor Visual de Variáveis (.env simulado)</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Edite os valores abaixo. Estas alterações são para testes no terminal e para gerar o arquivo .env para download.
                  Elas NÃO afetam o arquivo .env real do projeto.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                {Object.entries(currentEditingEnvVars).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={key} className="text-right text-slate-300 col-span-1 text-xs truncate" title={key}>
                      {key.replace('VITE_', '')}
                    </Label>
                    <Input
                      id={key}
                      value={value}
                      onChange={(e) => setCurrentEditingEnvVars(prev => ({ ...prev, [key]: e.target.value }))}
                      className="col-span-3 bg-slate-700 border-slate-600 text-slate-100 focus:border-primary"
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEnvEditorOpen(false)} className="text-slate-300 border-slate-600 hover:bg-slate-700">Cancelar</Button>
                <Button onClick={handleSaveEnvVars} className="bg-primary hover:bg-primary/90">Salvar Alterações (Simuladas)</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    };

    export default AdminTerminal;
  