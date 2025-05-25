
    import React, { useState, useEffect } from 'react';
    import { useAuth } from '@/contexts/AuthContext.jsx';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { User, Mail, KeyRound, UploadCloud, Save, Loader2 } from 'lucide-react';
    import { supabase } from '@/lib/supabase.jsx'; // For avatar upload

    const ProfilePage = () => {
      const { user, updateProfile, loading: authLoading } = useAuth(); // Corrigido para updateProfile
      const { toast } = useToast();
      const [name, setName] = useState('');
      const [email, setEmail] = useState('');
      const [pixKey, setPixKey] = useState('');
      const [avatarFile, setAvatarFile] = useState(null);
      const [avatarPreview, setAvatarPreview] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false);

      useEffect(() => {
        if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
          setPixKey(user.pix_key || '');
          setAvatarPreview(user.avatar_url || `https://avatar.vercel.sh/${user.email || user.id}.png`);
        }
      }, [user]);

      const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setAvatarFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setAvatarPreview(reader.result);
          };
          reader.readAsDataURL(file);
        }
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        let newAvatarUrl = user.avatar_url;

        if (avatarFile) {
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;

          try {
            const { error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(filePath, avatarFile, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            newAvatarUrl = urlData.publicUrl;
          } catch (error) {
            console.error('Error uploading avatar:', error);
            toast({
              variant: "destructive",
              title: "Erro no Upload",
              description: "Não foi possível carregar o novo avatar. Tente novamente.",
            });
            setIsSubmitting(false);
            return;
          }
        }
        
        const profileUpdates = {
          name,
          pix_key: pixKey,
          avatar_url: newAvatarUrl,
        };

        try {
          // A função updateProfile do AuthContext já sabe o ID do usuário
          const success = await updateProfile(profileUpdates); 
          if (success) {
            toast({
                title: "Perfil Atualizado!",
                description: "Suas informações foram salvas com sucesso.",
            });
          } else {
            // O AuthContext já deve ter mostrado um toast de erro, mas podemos adicionar um genérico se necessário
            // toast({ variant: "destructive", title: "Falha ao Atualizar", description: "Não foi possível salvar as alterações." });
          }
        } catch (error) {
          // Este catch é mais para erros inesperados não tratados pelo updateProfile
          console.error("Error in handleSubmit ProfilePage:", error);
           toast({ variant: "destructive", title: "Erro Inesperado", description: "Ocorreu um erro ao tentar salvar." });
        } finally {
          setIsSubmitting(false);
          setAvatarFile(null); 
        }
      };

      if (authLoading && !user) {
        return (
          <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        );
      }
      
      if (!user) {
         return (
          <div className="text-center py-10">
            <p>Por favor, faça login para ver seu perfil.</p>
          </div>
        );
      }


      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">Meu Perfil</CardTitle>
              <CardDescription className="text-center">
                Atualize suas informações pessoais e configurações.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32 border-4 border-primary/50 shadow-lg">
                    <AvatarImage src={avatarPreview} alt={name || email} />
                    <AvatarFallback className="text-4xl">
                      {(name || email || 'U').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="relative">
                    <Button type="button" variant="outline" size="sm" className="relative">
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Alterar Avatar
                      <Input 
                        id="avatar" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarChange} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="font-medium flex items-center">
                    <User className="mr-2 h-4 w-4 text-gray-500" /> Nome Completo
                  </Label>
                  <Input 
                    id="name" 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Seu nome" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-gray-500" /> Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    disabled 
                    className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pixKey" className="font-medium flex items-center">
                    <KeyRound className="mr-2 h-4 w-4 text-gray-500" /> Chave PIX
                  </Label>
                  <Input 
                    id="pixKey" 
                    type="text" 
                    value={pixKey} 
                    onChange={(e) => setPixKey(e.target.value)} 
                    placeholder="Sua chave PIX (CPF, email, telefone, etc.)" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Sua chave PIX é necessária para receber prêmios. Certifique-se de que está correta.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting || authLoading}>
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      );
    };

    export default ProfilePage;
  