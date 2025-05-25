
    import React, { useState, useEffect, useCallback } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useAuth } from '@/contexts/AuthContext.jsx';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Mail, LogIn, Loader2, RefreshCw, KeyRound } from 'lucide-react';

    const RESEND_COOLDOWN_SECONDS = 60;

    const AuthPage = () => {
      const navigate = useNavigate();
      const { signInWithMagicLink, verifyOtpCode, isAuthenticated, loading, user, refreshAuthStatus } = useAuth();
      const { toast } = useToast();
      const [email, setEmail] = useState('');
      const [otp, setOtp] = useState('');
      const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
      const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
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
        
        setIsSubmittingEmail(true);
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
            toast({
              title: "Link Mágico Enviado!",
              description: `Um link e código de acesso foram enviados para ${emailToUse}.`,
            });
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
          setIsSubmittingEmail(false);
        }
      };

      const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
          toast({
            variant: "destructive",
            title: "Código Inválido",
            description: "Por favor, insira o código de 6 dígitos recebido por email.",
          });
          return;
        }
        setIsVerifyingOtp(true);
        try {
          const { session, error } = await verifyOtpCode(lastSentEmail, otp);
          if (error) {
            toast({
              variant: "destructive",
              title: "Falha na Verificação",
              description: error.message || "Código inválido ou expirado. Tente novamente.",
            });
          } else if (session) {
             // AuthContext's onAuthStateChange will handle navigation
             toast({
              title: "Login Bem-sucedido!",
              description: "Você foi autenticado com sucesso.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Falha na Verificação",
              description: "Não foi possível verificar o código. Tente novamente.",
            });
          }
        } catch (error) {
            toast({
              variant: "destructive",
              title: "Erro Inesperado",
              description: "Ocorreu um erro ao verificar o código.",
            });
        } finally {
          setIsVerifyingOtp(false);
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
                  Insira seu email para receber um link mágico e código de acesso.
                </CardDescription>
              ) : (
                <CardDescription className="text-green-600 font-semibold">
                  Acesso enviado para {lastSentEmail}! Verifique sua caixa de entrada (e spam).
                </CardDescription>
              )}
            </CardHeader>
            {!magicLinkSent ? (
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
                        disabled={isSubmittingEmail}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white font-semibold py-3 rounded-md shadow-lg transform transition-all hover:scale-105"
                    disabled={isSubmittingEmail || (loading && !user)}
                  >
                    {isSubmittingEmail ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>) : "Enviar Link e Código"}
                  </Button>
                </CardFooter>
              </form>
            ) : (
              <>
                <form onSubmit={handleVerifyOtp}>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="otp-code" className="text-gray-700 font-medium">Código de Acesso (OTP)</Label>
                      <div className="relative flex items-center">
                        <KeyRound className="absolute left-3 h-5 w-5 text-gray-400" />
                        <Input 
                          id="otp-code" 
                          type="text" 
                          inputMode="numeric"
                          pattern="\d{6}"
                          maxLength="6"
                          placeholder="123456" 
                          value={otp} 
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))} 
                          required 
                          className="pl-10 w-full border-gray-300 focus:border-slate-500 focus:ring-slate-500 rounded-md shadow-sm tracking-[0.3em]"
                          disabled={isVerifyingOtp}
                        />
                      </div>
                    </div>
                     <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold py-3 rounded-md shadow-lg transform transition-all hover:scale-105"
                        disabled={isVerifyingOtp || !otp || otp.length !== 6}
                      >
                        {isVerifyingOtp ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</>) : "Verificar Código"}
                      </Button>
                  </CardContent>
                </form>
                <CardFooter className="flex-col space-y-2 items-center">
                  <p className="text-sm text-gray-700">
                    Ou clique no link enviado ao seu email.
                  </p>
                  {resendCooldown > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Não recebeu? Reenviar em {resendCooldown}s
                    </p>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => handleMagicLinkLogin(null, true)} 
                      disabled={isSubmittingEmail}
                      className="w-full text-sm"
                    >
                      {isSubmittingEmail ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reenviando...</>) : (<><RefreshCw className="mr-2 h-4 w-4" /> Reenviar Link e Código</>)}
                    </Button>
                  )}
                </CardFooter>
              </>
            )}
          </Card>
        </motion.div>
      );
    };

    export default AuthPage;
  