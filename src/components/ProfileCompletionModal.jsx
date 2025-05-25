
    import React, { useState, useEffect } from 'react';
    import { useAuth } from '@/contexts/AuthContext.jsx';
    import { supabase } from '@/lib/supabase.jsx';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { Loader2, UserCheck, AlertTriangle } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';

    const ProfileCompletionModal = () => {
      const { user, updateUserContext, setShowProfileCompletionModal } = useAuth();
      const [name, setName] = useState(user?.name || user?.user_metadata?.name || '');
      const [pixKey, setPixKey] = useState(user?.pix_key || '');
      const [isLoading, setIsLoading] = useState(false);
      const { toast } = useToast();

      useEffect(() => {
        if (user) {
          setName(user.name || user.user_metadata?.name || '');
          setPixKey(user.pix_key || '');
        }
      }, [user]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
          toast({ variant: 'destructive', title: 'Nome Obrigatório', description: 'Por favor, insira seu nome ou apelido.' });
          return;
        }
        if (!pixKey.trim()) {
          toast({ variant: 'destructive', title: 'Chave Pix Obrigatória', description: 'Por favor, insira sua chave Pix.' });
          return;
        }

        setIsLoading(true);
        try {
          const updates = {
            id: user.id,
            name: name.trim(),
            pix_key: pixKey.trim(),
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

          if (error) throw error;

          await updateUserContext(); // Recarrega os dados do usuário no contexto
          
          toast({
            title: 'Perfil Atualizado!',
            description: 'Seu nome e chave Pix foram salvos com sucesso.',
            className: 'bg-green-500 text-white',
            icon: <UserCheck className="h-5 w-5" />
          });
          setShowProfileCompletionModal(false); // Fecha o modal

        } catch (error) {
          console.error('Erro ao atualizar perfil:', error);
          toast({
            variant: 'destructive',
            title: 'Erro ao Salvar',
            description: error.message || 'Não foi possível atualizar seu perfil. Tente novamente.',
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      // O modal não deve ser fechável pelo usuário até que o perfil seja completado.
      // A prop `open` é controlada pelo AuthContext (showProfileCompletionModal)
      // Para impedir o fechamento via Esc ou clique fora, não passamos onOpenChange ou usamos e.preventDefault() em onInteractOutside/onEscapeKeyDown

      return (
        <Dialog open={true} onOpenChange={() => { /* Não permitir fechar externamente */ }}>
          <DialogContent 
            className="sm:max-w-[480px] bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white border-slate-700 shadow-2xl rounded-xl overflow-hidden"
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <DialogHeader className="p-6 border-b border-slate-700">
                <DialogTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                  Complete Seu Cadastro!
                </DialogTitle>
                <DialogDescription className="text-center text-slate-400 pt-2">
                  Para aproveitar todas as emoções do Pagoul, precisamos de mais algumas informações.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300 font-semibold">Nome ou Apelido</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Como podemos te chamar?"
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pixKey" className="text-slate-300 font-semibold">Chave Pix</Label>
                    <Input
                      id="pixKey"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="Sua chave Pix para receber prêmios!"
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                    <p className="text-xs text-slate-500">Ex: CPF, e-mail, telefone ou chave aleatória.</p>
                  </div>
                  <AlertTriangle className="inline-block h-4 w-4 mr-1 text-yellow-400" /> 
                  <span className="text-xs text-yellow-400">
                    Essas informações são essenciais para participar das apostas e receber seus ganhos.
                  </span>
                </div>
                <DialogFooter className="p-6 border-t border-slate-700">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-3 text-lg rounded-lg shadow-lg transform transition-all duration-150 ease-in-out hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <UserCheck className="mr-2 h-5 w-5" />
                    )}
                    Salvar e Continuar a Diversão!
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          </DialogContent>
        </Dialog>
      );
    };

    export default ProfileCompletionModal;
  