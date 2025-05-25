
    import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useForm } from 'react-hook-form';
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
    import { motion } from 'framer-motion'; // Adicionada a importação que faltava

    const betSchema = z.object({
      title: z.string().min(5, "Título deve ter pelo menos 5 caracteres").max(100, "Título muito longo"),
      description: z.string().min(10, "Descrição muito curta").max(500, "Descrição muito longa"),
      category: z.string().min(3, "Categoria é obrigatória"),
      options: z.array(z.object({ value: z.string().min(1, "Opção não pode ser vazia") })).min(2, "Mínimo de 2 opções de aposta"),
      entry_fee: z.coerce.number().min(0, "Valor da entrada não pode ser negativo"),
      close_date: z.string().refine(val => !isNaN(Date.parse(val)), "Data de encerramento inválida"),
      max_participants: z.coerce.number().min(2, "Mínimo de 2 participantes").optional().nullable(),
      image_url: z.string().url("URL da imagem inválida").optional().nullable(),
      is_public: z.boolean().default(true),
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


    const CreateBetPage = () => {
      const navigate = useNavigate();
      const { toast } = useToast();
      const { user, isAdmin } = useAuth();
      const { addBet, loadingBets } = useBets();
      const [options, setOptions] = useState([{ value: '' }, { value: '' }]);
      const [isPublic, setIsPublic] = useState(true);
      const [privateAccessCode, setPrivateAccessCode] = useState('');
      const [showAccessCode, setShowAccessCode] = useState(false);

      const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm({
        resolver: zodResolver(betSchema),
        defaultValues: {
          title: '',
          description: '',
          category: 'Esportes',
          options: [{ value: '' }, { value: '' }],
          entry_fee: 10,
          close_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
          is_public: true,
        }
      });
      
      useEffect(() => {
        if (!isAdmin) {
          toast({ variant: 'destructive', title: 'Acesso Negado', description: 'Apenas administradores podem criar apostas.' });
          navigate('/apostas');
        }
      }, [isAdmin, navigate, toast]);

      useEffect(() => {
        setValue('options', options);
        if (isPublic) {
          setValue('private_access_code', null);
          setPrivateAccessCode('');
        } else {
           setValue('private_access_code', privateAccessCode);
        }
        setValue('is_public', isPublic);
      }, [options, setValue, isPublic, privateAccessCode]);


      const handleAddOption = () => {
        setOptions([...options, { value: '' }]);
      };

      const handleRemoveOption = (index) => {
        if (options.length <= 2) {
          toast({ variant: 'warning', title: 'Mínimo de opções', description: 'São necessárias pelo menos 2 opções de aposta.' });
          return;
        }
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
      };

      const handleOptionChange = (index, event) => {
        const newOptions = options.map((option, i) => 
          i === index ? { ...option, value: event.target.value } : option
        );
        setOptions(newOptions);
        setValue(`options.${index}.value`, event.target.value);
        trigger(`options.${index}.value`);
      };
      
      const generateAccessCode = () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setPrivateAccessCode(code);
        setValue('private_access_code', code);
      };

      const onSubmit = async (formData) => {
        if (!user) {
          toast({ variant: "destructive", title: "Erro", description: "Usuário não autenticado." });
          return;
        }

        const submissionData = {
          ...formData,
          options: formData.options.map(opt => opt.value), 
          created_by: user.id, 
          is_public: isPublic,
          private_access_code: isPublic ? null : privateAccessCode,
        };
        
        const createdBet = await addBet(submissionData);
        if (createdBet && createdBet.id) {
          toast({ title: 'Aposta Criada!', description: 'Sua nova aposta está no ar.' });
          navigate(`/aposta/${createdBet.id}`);
        } else {
          // Error toast is handled within addBet
        }
      };

      if (!isAdmin) return null; 

      return (
        <div className="container mx-auto py-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-3xl mx-auto shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white rounded-t-lg p-6">
                <CardTitle className="text-3xl font-bold">Criar Nova Aposta</CardTitle>
                <CardDescription className="text-purple-100">Defina os detalhes do seu novo bolão.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-lg font-semibold text-slate-700">Título da Aposta</Label>
                    <Input id="title" {...register('title')} placeholder="Ex: Final da Copa do Mundo" className="py-3 px-4 text-base"/>
                    {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-lg font-semibold text-slate-700">Descrição Detalhada</Label>
                    <Textarea id="description" {...register('description')} placeholder="Detalhes sobre o evento, regras, etc." rows={4} className="py-3 px-4 text-base"/>
                    {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-lg font-semibold text-slate-700">Categoria</Label>
                      <Input id="category" {...register('category')} placeholder="Ex: Futebol, E-sports, Política" className="py-3 px-4 text-base"/>
                      {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entry_fee" className="text-lg font-semibold text-slate-700">Valor da Entrada (R$)</Label>
                      <Input id="entry_fee" type="number" step="0.01" {...register('entry_fee')} placeholder="0.00" className="py-3 px-4 text-base"/>
                      {errors.entry_fee && <p className="text-sm text-red-500">{errors.entry_fee.message}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold text-slate-700">Opções de Aposta</Label>
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Input
                          type="text"
                          value={option.value}
                          onChange={(e) => handleOptionChange(index, e)}
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
                     {errors.options && <p className="text-sm text-red-500">{errors.options.message || (errors.options.root && errors.options.root.message)}</p>}
                    <Button type="button" variant="outline" onClick={handleAddOption} className="mt-2 text-primary border-primary hover:bg-primary/10">
                      <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Opção
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="close_date" className="text-lg font-semibold text-slate-700">Data de Encerramento</Label>
                      <Input id="close_date" type="datetime-local" {...register('close_date')} className="py-3 px-4 text-base"/>
                      {errors.close_date && <p className="text-sm text-red-500">{errors.close_date.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_participants" className="text-lg font-semibold text-slate-700">Máx. Participantes (Opcional)</Label>
                      <Input id="max_participants" type="number" {...register('max_participants')} placeholder="Sem limite" className="py-3 px-4 text-base"/>
                      {errors.max_participants && <p className="text-sm text-red-500">{errors.max_participants.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url" className="text-lg font-semibold text-slate-700">URL da Imagem (Opcional)</Label>
                    <div className="flex items-center space-x-3">
                      <ImageIcon className="h-6 w-6 text-slate-400" />
                      <Input id="image_url" {...register('image_url')} placeholder="https://exemplo.com/imagem.jpg" className="py-3 px-4 text-base"/>
                    </div>
                    {errors.image_url && <p className="text-sm text-red-500">{errors.image_url.message}</p>}
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center space-x-3">
                       <Switch id="is_public" checked={isPublic} onCheckedChange={setIsPublic} />
                       <Label htmlFor="is_public" className="text-base font-medium text-slate-700">
                         Aposta Pública (visível para todos)
                       </Label>
                    </div>
                    {!isPublic && (
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
                            value={privateAccessCode}
                            onChange={(e) => {
                              setPrivateAccessCode(e.target.value);
                              setValue('private_access_code', e.target.value);
                              trigger('private_access_code');
                            }}
                            placeholder="Mínimo 6 caracteres"
                            className="py-3 px-4 text-base"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => setShowAccessCode(!showAccessCode)}>
                            {showAccessCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </Button>
                        </div>
                        {errors.private_access_code && <p className="text-sm text-red-500">{errors.private_access_code.message}</p>}
                        <Button type="button" variant="link" onClick={generateAccessCode} className="text-sm text-primary p-0 h-auto">Gerar Código Aleatório</Button>
                      </motion.div>
                    )}
                  </div>


                  <Button type="submit" className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white transition-all duration-300 ease-in-out transform hover:scale-105" disabled={loadingBets}>
                    {loadingBets ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
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
  