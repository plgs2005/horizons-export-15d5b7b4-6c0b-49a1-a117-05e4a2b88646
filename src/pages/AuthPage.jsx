
    import React, { useState, useEffect, useCallback } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useAuth } from '@/contexts/AuthContext.jsx';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Mail, LogIn, Loader2, RefreshCw } from 'lucide-react';

    const RESEND_COOLDOWN_SECONDS = 60;

    const AuthPage = () => {
      const navigate = useNavigate();
      const { signInWithMagicLink, isAuthenticated, loading, user, refreshAuthStatus } = useAuth();
      const { toast } = useToast();
      const [email, setEmail] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [magicLinkSent, setMagicLinkSent] = useState(false);
      const [resendCooldown, setResendCooldown] = useState(0);
      const [lastSentEmail, setLastSentEmail] = useState('');

      const startResendCooldown = () => {
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        const intervalId = setInterval(() => {
          setResendCooldown((prevCooldown) => {
            if (prevCooldown <= 1) {
              clearInterval(intervalId);
              return 0;
            }
            return prevCooldown - 1;
          });
        }, 1000);
        return () => clearInterval(intervalId);
      };
      
      useEffect(() => {
        if (!loading && isAuthenticated && user) {
          navigate('/apostas', { replace: true });
        }
      }, [isAuthenticated, loading, user, navigate]);

      useEffect(() => {
        const handleVisibilityChange = async () => {
          if (document.visibilityState === 'visible' && !isAuthenticated && refreshAuthStatus) {
            await refreshAuthStatus(); 
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      }, [refreshAuthStatus, isAuthenticated]);


      const handleMagicLinkLogin = async (e, isResend = false) => {
        if (e) e.preventDefault();
        
        const emailToUse = isResend ? lastSentEmail : email;

        if (!emailToUse) {
          toast({ 
            variant: "destructive", 
            title: "Erro", 
            description: "Por favor, insira seu email." 
          });
          return;
        }
        
        setIsSubmitting(true);
        if (!isResend) setMagicLinkSent(false); 

        try {
          const success = await signInWithMagicLink(emailToUse);
          if (success) {
            setMagicLinkSent(true);
            setLastSentEmail(emailToUse);
            startResendCooldown();
            if (!isResend) {
               setEmail(''); 
            }
          } else {
            toast({
              variant: "destructive",
              title: "Falha no Login",
              description: "Não foi possível enviar o link mágico. Tente novamente em alguns instantes."
            });
          }
        } catch (error) {
          console.error('Erro no login com Magic Link:', error);
           toast({
            variant: "destructive",
            title: "Erro Inesperado",
            description: "Ocorreu um erro. Por favor, tente novamente."
          });
        } finally {
          setIsSubmitting(false);
        }
      };
      
      if (loading && !user && !magicLinkSent) { 
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-xl text-primary-foreground">Verificando sessão...</p>
            <p className="text-sm text-muted-foreground">Aguarde um momento.</p>
          </div>
        );
      }

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)] bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 p-4"
        >
          <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
              >
                <LogIn className="mx-auto h-16 w-16 text-slate-700 mb-4" />
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-500">
                Bem-vindo ao Pagoul
              </CardTitle>
              {!magicLinkSent ? (
                <CardDescription className="text-gray-600">
                  Insira seu email para receber um link mágico de acesso.
                </CardDescription>
              ) : (
                <CardDescription className="text-green-600 font-semibold">
                  Link mágico enviado para {lastSentEmail}! Verifique sua caixa de entrada (e spam).
                </CardDescription>
              )}
            </CardHeader>
            {!magicLinkSent && (
              <form onSubmit={handleMagicLinkLogin}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email-magic-link" className="text-gray-700 font-medium">Seu Email</Label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 h-5 w-5 text-gray-400" />
                      <Input 
                        id="email-magic-link" 
                        type="email" 
                        placeholder="seu@email.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="pl-10 w-full border-gray-300 focus:border-slate-500 focus:ring-slate-500 rounded-md shadow-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white font-semibold py-3 rounded-md shadow-lg transform transition-all hover:scale-105"
                    disabled={isSubmitting || (loading && !user)}
                  >
                    {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>) : "Enviar Link Mágico"}
                  </Button>
                </CardFooter>
              </form>
            )}
             {magicLinkSent && (
              <CardContent className="text-center space-y-4">
                <p className="text-gray-700">
                  Você pode fechar esta aba. O login será completado ao clicar no link em seu email.
                </p>
                {resendCooldown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Não recebeu o email? Reenviar em {resendCooldown}s
                  </p>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => handleMagicLinkLogin(null, true)} 
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reenviando...</>) : (<><RefreshCw className="mr-2 h-4 w-4" /> Reenviar Link</>)}
                  </Button>
                )}
              </CardContent>
            )}
          </Card>
        </motion.div>
      );
    };

    export default AuthPage;
  