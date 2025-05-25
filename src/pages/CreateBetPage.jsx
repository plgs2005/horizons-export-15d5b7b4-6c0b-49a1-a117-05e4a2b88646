
    import React, { useState, useEffect, useCallback } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useForm, Controller } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import * as z from 'zod';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/AuthContext.jsx';
    import { useBets } from '@/contexts/BetContext.jsx';
    import { PlusCircle, Trash2, Image as ImageIcon, Loader2, Save, Eye, EyeOff } from 'lucide-react';
    import { Switch } from '@/components/ui/switch';
    import { motion } from 'framer-motion'; 

    const betSchema = z.object({
      title: z.string().min(5, "Título deve ter pelo menos 5 caracteres").max(100, "Título muito longo"),
      description: z.string().min(10, "Descrição muito curta").max(500, "Descrição muito longa"),
      category: z.string().min(3, "Categoria é obrigatória"),
      options: z.array(z.object({ value: z.string().min(1, "Opção não pode ser vazia") })).min(2, "Mínimo de 2 opções de aposta"),
      entry_fee: z.coerce.number().min(0, "Valor da entrada não pode ser negativo"),
      close_date: z.string().refine(val => !isNaN(Date.parse(val)) && new Date(val) > new Date(), "Data de encerramento deve ser no futuro."),
      max_participants: z.coerce.number().min(2, "Mínimo de 2 participantes").optional().nullable(),
      image_url: z.string().url("URL da imagem inválida").optional().nullable().or(z.literal('')),
      is_public: z.boolean().default(false),
      private_access_code: z.string().optional().nullable(),
    }).refine(data => {
      if (!data.is_public && (!data.private_access_code || data.private_access_code.length < 6)) {
        return false;
      }
      return true;
    }, {
      message: "Código de acesso deve ter pelo menos 6 caracteres para apostas privadas.",
      path: ["private_access_code"],
    });

    const FormSection = ({ title, children }) => (
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {title && <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 border-b pb-2 mb-4">{title}</h3>}
        {children}
      </motion.div>
    );

    const CreateBetPage = () => {
      const navigate = useNavigate();
      const { toast } = useToast();
      const { user, isAdmin, isAuthenticated } = useAuth();
      const { addBet, loadingBets } = useBets();
      
      const initialDefaultIsPublic = isAdmin;
      const initialDefaultAccessCode = initialDefaultIsPublic ? '' : Math.random().toString(36).substring(2, 8).toUpperCase();

      const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, trigger, reset, control } = useForm({
        resolver: zodResolver(betSchema),
        defaultValues: {
          title: '',
          description: '',
          category: 'Esportes',
          options: [{ value: '' }, { value: '' }],
          entry_fee: 10,
          close_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
          is_public: initialDefaultIsPublic, 
          private_access_code: initialDefaultAccessCode,
          image_url: '',
          max_participants: null,
        }
      });

      const [options, setOptions] = useState(watch('options'));
      const [isPublicFormState, setIsPublicFormState] = useState(watch('is_public'));
      const [privateAccessCode, setPrivateAccessCode] = useState(watch('private_access_code'));
      const [showAccessCode, setShowAccessCode] = useState(false);
      
      const generateAccessCode = useCallback((manualTrigger = true) => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setPrivateAccessCode(code);
        setValue('private_access_code', code, { shouldValidate: manualTrigger });
      }, [setValue]);

      useEffect(() => {
        if (!isAuthenticated) {
          toast({ variant: 'destructive', title: 'Acesso Negado', description: 'Você precisa estar logado para criar apostas.' });
          navigate('/auth', { state: { from: '/criar-aposta' }});
        }
      }, [isAuthenticated, navigate, toast]);

      useEffect(() => {
        const subscription = watch((value, { name, type }) => {
          if (name === 'is_public') {
            setIsPublicFormState(value.is_public);
            if (!value.is_public && !value.private_access_code) {
              generateAccessCode(false);
            }
          }
          if (name === 'private_access_code') {
            setPrivateAccessCode(value.private_access_code);
          }
          if (name === 'options') {
            setOptions(value.options);
          }
        });
        return () => subscription.unsubscribe();
      }, [watch, generateAccessCode]);
      
      useEffect(() => {
        if (!isAdmin) {
          setValue('is_public', false);
          setIsPublicFormState(false);
          if (!privateAccessCode) {
            generateAccessCode(false);
          }
        }
      }, [isAdmin, setValue, generateAccessCode, privateAccessCode]);


      const handleAddOption = () => {
        const currentOptions = watch('options');
        setValue('options', [...currentOptions, { value: '' }]);
      };

      const handleRemoveOption = (index) => {
        const currentOptions = watch('options');
        if (currentOptions.length <= 2) {
          toast({ variant: 'warning', title: 'Mínimo de opções', description: 'São necessárias pelo menos 2 opções de aposta.' });
          return;
        }
        setValue('options', currentOptions.filter((_, i) => i !== index));
      };
      
      const onSubmit = async (formData) => {
        if (!user) {
          toast({ variant: "destructive", title: "Erro", description: "Usuário não autenticado." });
          return;
        }

        const finalIsPublic = isAdmin ? formData.is_public : false; 
        const finalAccessCode = finalIsPublic ? null : formData.private_access_code;
        
        if (!finalIsPublic && (!finalAccessCode || finalAccessCode.length < 6)) {
            toast({ variant: "destructive", title: "Código de Acesso Inválido", description: "Apostas privadas requerem um código de acesso de pelo menos 6 caracteres." });
            trigger("private_access_code");
            return;
        }

        const submissionData = {
          ...formData,
          options: formData.options.map(opt => ({ name: opt.value, value: opt.value })),
          created_by: user.id, 
          is_public: finalIsPublic,
          private_access_code: finalAccessCode,
          image_url: formData.image_url === '' ? null : formData.image_url,
          max_participants: formData.max_participants ? Number(formData.max_participants) : null,
        };
        
        const createdBet = await addBet(submissionData);
        if (createdBet && createdBet.id) {
          toast({ title: 'Aposta Criada!', description: `Sua nova aposta ${finalIsPublic ? 'pública' : 'privada'} está no ar.` });
          reset(); 
          navigate(`/aposta/${createdBet.id}`);
        } else {
          toast({ variant: "destructive", title: "Falha ao Criar Aposta", description: "Não foi possível criar a aposta. Tente novamente." });
        }
      };

      if (!isAuthenticated) return null; 

      return (
        <div className="container mx-auto py-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-3xl mx-auto shadow-2xl bg-card">
              <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-t-lg p-6">
                <CardTitle className="text-3xl font-bold">Criar Nova Aposta</CardTitle>
                <CardDescription className="text-purple-200">Defina os detalhes do seu novo bolão.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                  <FormSection title="Informações Básicas">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-lg font-semibold">Título da Aposta</Label>
                      <Input id="title" {...register('title')} placeholder="Ex: Final da Copa do Mundo" className="py-3 px-4 text-base"/>
                      {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-lg font-semibold">Descrição Detalhada</Label>
                      <Textarea id="description" {...register('description')} placeholder="Detalhes sobre o evento, regras, etc." rows={4} className="py-3 px-4 text-base"/>
                      {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                    </div>
                  </FormSection>

                  <FormSection title="Configurações da Aposta">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-lg font-semibold">Categoria</Label>
                        <Input id="category" {...register('category')} placeholder="Ex: Futebol, E-sports, Política" className="py-3 px-4 text-base"/>
                        {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="entry_fee" className="text-lg font-semibold">Valor da Entrada (R$)</Label>
                        <Input id="entry_fee" type="number" step="0.01" {...register('entry_fee')} placeholder="0.00" className="py-3 px-4 text-base"/>
                        {errors.entry_fee && <p className="text-sm text-red-500">{errors.entry_fee.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-lg font-semibold">Opções de Aposta</Label>
                      {options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Input
                            {...register(`options.${index}.value`)}
                            placeholder={`Opção ${index + 1}`}
                            className="py-3 px-4 text-base"
                          />
                          {options.length > 2 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(index)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {errors.options && <p className="text-sm text-red-500">{typeof errors.options.message === 'string' ? errors.options.message : (errors.options.root && errors.options.root.message) || (errors.options[0]?.value?.message)}</p>}
                      <Button type="button" variant="outline" onClick={handleAddOption} className="mt-2 text-primary border-primary hover:bg-primary/10">
                        <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Opção
                      </Button>
                    </div>
                  </FormSection>

                  <FormSection title="Detalhes Adicionais">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="close_date" className="text-lg font-semibold">Data de Encerramento</Label>
                        <Input id="close_date" type="datetime-local" {...register('close_date')} className="py-3 px-4 text-base"/>
                        {errors.close_date && <p className="text-sm text-red-500">{errors.close_date.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_participants" className="text-lg font-semibold">Máx. Participantes (Opcional)</Label>
                        <Input id="max_participants" type="number" {...register('max_participants')} placeholder="Sem limite" className="py-3 px-4 text-base"/>
                        {errors.max_participants && <p className="text-sm text-red-500">{errors.max_participants.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image_url" className="text-lg font-semibold">URL da Imagem (Opcional)</Label>
                      <div className="flex items-center space-x-3">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                        <Input id="image_url" {...register('image_url')} placeholder="https://exemplo.com/imagem.jpg" className="py-3 px-4 text-base"/>
                      </div>
                      {errors.image_url && <p className="text-sm text-red-500">{errors.image_url.message}</p>}
                    </div>
                  </FormSection>
                  
                  <FormSection title="Visibilidade">
                    <div className="flex items-center space-x-3">
                       <Controller
                          name="is_public"
                          control={control}
                          render={({ field }) => (
                            <Switch 
                              id="is_public" 
                              checked={field.value} 
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (!isAdmin) {
                                  setIsPublicFormState(false);
                                  if (!privateAccessCode) generateAccessCode(false);
                                } else {
                                  setIsPublicFormState(checked);
                                  if (!checked && !privateAccessCode) generateAccessCode(false);
                                }
                              }}
                              disabled={!isAdmin}
                            />
                          )}
                        />
                       <Label htmlFor="is_public" className={`text-base font-medium ${!isAdmin ? 'text-slate-400 cursor-not-allowed' : 'cursor-pointer'}`}>
                         Aposta Pública (visível para todos) {!isAdmin && "(Forçada para Privada)"}
                       </Label>
                    </div>
                    {(!isPublicFormState) && ( 
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2 p-4 border border-dashed border-primary rounded-lg bg-primary/5"
                      >
                        <Label htmlFor="private_access_code" className="text-base font-semibold text-primary">Código de Acesso (para aposta privada)</Label>
                        <div className="flex items-center space-x-2">
                          <Input 
                            id="private_access_code" 
                            type={showAccessCode ? "text" : "password"}
                            {...register('private_access_code')}
                            placeholder="Mínimo 6 caracteres"
                            className="py-3 px-4 text-base"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => setShowAccessCode(!showAccessCode)}>
                            {showAccessCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </Button>
                        </div>
                        {errors.private_access_code && <p className="text-sm text-red-500">{errors.private_access_code.message}</p>}
                        <Button type="button" variant="link" onClick={() => generateAccessCode(true)} className="text-sm text-primary p-0 h-auto">Gerar Código Aleatório</Button>
                      </motion.div>
                    )}
                  </FormSection>

                  <Button type="submit" className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white transition-all duration-300 ease-in-out transform hover:scale-105" disabled={isSubmitting || loadingBets}>
                    {(isSubmitting || loadingBets) ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Criar Aposta
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    };

    export default CreateBetPage;
  