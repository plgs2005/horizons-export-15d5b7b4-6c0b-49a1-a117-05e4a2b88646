
    import React, { useState, useEffect } from 'react';
    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import * as z from 'zod';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Switch } from '@/components/ui/switch';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { useToast } from '@/components/ui/use-toast';
    import { useBets } from '@/contexts/BetContext.jsx';
    import { PlusCircle, Trash2, Loader2, Save, Eye, EyeOff } from 'lucide-react';
    import { motion } from 'framer-motion';

    const betSchemaModal = z.object({
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
      status: z.string().optional(), // Status can be changed by admin
      correct_option: z.string().optional().nullable(),
      result: z.string().optional().nullable(),
    }).refine(data => {
      if (!data.is_public && (!data.private_access_code || data.private_access_code.length < 6)) {
        return false;
      }
      return true;
    }, {
      message: "Código de acesso deve ter pelo menos 6 caracteres para apostas privadas.",
      path: ["private_access_code"],
    });


    const BetFormModal = ({ isOpen, onClose, bet }) => {
      const { toast } = useToast();
      const { addBet, updateBet, loadingBets } = useBets();
      const [options, setOptions] = useState([{ value: '' }, { value: '' }]);
      const [isPublic, setIsPublic] = useState(true);
      const [privateAccessCode, setPrivateAccessCode] = useState('');
      const [showAccessCode, setShowAccessCode] = useState(false);
      
      const isEditing = Boolean(bet);

      const { register, handleSubmit, formState: { errors }, setValue, reset, watch, trigger } = useForm({
        resolver: zodResolver(betSchemaModal),
        defaultValues: {
          title: '',
          description: '',
          category: 'Esportes',
          options: [{ value: '' }, { value: '' }],
          entry_fee: 10,
          close_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
          is_public: true,
          status: 'Aberta',
        }
      });

      useEffect(() => {
        if (isEditing && bet) {
          const betOptions = Array.isArray(bet.options) 
            ? (typeof bet.options[0] === 'string' ? bet.options.map(opt => ({value: opt})) : bet.options)
            : [{value:''}, {value:''}];

          reset({
            ...bet,
            options: betOptions,
            close_date: bet.close_date ? new Date(bet.close_date).toISOString().substring(0, 16) : '',
            entry_fee: bet.entry_fee || 0,
            max_participants: bet.max_participants || null,
          });
          setOptions(betOptions);
          setIsPublic(bet.is_public);
          setPrivateAccessCode(bet.private_access_code || '');
        } else {
          reset({ // Reset to default for new bet
            title: '',
            description: '',
            category: 'Esportes',
            options: [{ value: '' }, { value: '' }],
            entry_fee: 10,
            close_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
            is_public: true,
            private_access_code: '',
            status: 'Aberta',
            image_url: '',
            max_participants: null,
            correct_option: null,
            result: null,
          });
          setOptions([{ value: '' }, { value: '' }]);
          setIsPublic(true);
          setPrivateAccessCode('');
        }
      }, [bet, isEditing, reset]);

      useEffect(() => {
        setValue('options', options);
         if (isPublic) {
          setValue('private_access_code', null);
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
          toast({ variant: 'warning', title: 'Mínimo de opções', description: 'São necessárias pelo menos 2 opções.' });
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

      const onSubmitHandler = async (formData) => {
        const submissionData = {
          ...formData,
          options: formData.options.map(opt => opt.value), // Ensure options are array of strings
          is_public: isPublic,
          private_access_code: isPublic ? null : privateAccessCode,
        };
        
        // Remove fields not directly updatable or for creation only
        if (isEditing) {
            delete submissionData.created_by; // Cannot change creator
        }


        let success = false;
        if (isEditing) {
          const result = await updateBet(bet.id, submissionData);
          if (result) success = true;
        } else {
          // For new bets, addBet in context handles created_by
          const result = await addBet(submissionData);
          if (result) success = true;
        }

        if (success) {
          toast({ title: `Aposta ${isEditing ? 'Atualizada' : 'Criada'}!`, description: `Aposta ${isEditing ? 'atualizada' : 'criada'} com sucesso.` });
          onClose();
        }
      };

      const availableStatuses = ['Aberta', 'Encerrada', 'Cancelada', 'Pendente', 'Em Análise'];

      return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{isEditing ? 'Editar Aposta' : 'Criar Nova Aposta'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Modifique os detalhes da aposta.' : 'Preencha os detalhes para criar um novo bolão.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6 p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" {...register('title')} />
                        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="category">Categoria</Label>
                        <Input id="category" {...register('category')} />
                        {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}
                    </div>
                </div>

                <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea id="description" {...register('description')} rows={3}/>
                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
                </div>
                
                <div>
                    <Label>Opções de Aposta</Label>
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 mt-1">
                        <Input
                          type="text"
                          value={option.value}
                          onChange={(e) => handleOptionChange(index, e)}
                          placeholder={`Opção ${index + 1}`}
                        />
                        {options.length > 2 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(index)} className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {errors.options && <p className="text-sm text-red-500 mt-1">{errors.options.message || (errors.options.root && errors.options.root.message)}</p>}
                    <Button type="button" variant="outline" onClick={handleAddOption} className="mt-2 text-sm">
                      <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Opção
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="entry_fee">Valor da Entrada (R$)</Label>
                        <Input id="entry_fee" type="number" step="0.01" {...register('entry_fee')} />
                        {errors.entry_fee && <p className="text-sm text-red-500 mt-1">{errors.entry_fee.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="close_date">Data de Encerramento</Label>
                        <Input id="close_date" type="datetime-local" {...register('close_date')} />
                        {errors.close_date && <p className="text-sm text-red-500 mt-1">{errors.close_date.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="max_participants">Máx. Participantes (Opcional)</Label>
                        <Input id="max_participants" type="number" {...register('max_participants')} />
                        {errors.max_participants && <p className="text-sm text-red-500 mt-1">{errors.max_participants.message}</p>}
                    </div>
                     {isEditing && (
                        <div>
                            <Label htmlFor="status">Status da Aposta</Label>
                            <select 
                                id="status" 
                                {...register('status')} 
                                className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                                defaultValue={bet?.status || 'Aberta'}
                            >
                                {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>}
                        </div>
                    )}
                </div>

                <div>
                    <Label htmlFor="image_url">URL da Imagem (Opcional)</Label>
                    <Input id="image_url" {...register('image_url')} />
                    {errors.image_url && <p className="text-sm text-red-500 mt-1">{errors.image_url.message}</p>}
                </div>
                
                {isEditing && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <Label htmlFor="correct_option">Opção Correta (após encerramento)</Label>
                            <Input id="correct_option" {...register('correct_option')} placeholder="Ex: Time A"/>
                            {errors.correct_option && <p className="text-sm text-red-500 mt-1">{errors.correct_option.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="result">Resultado Descritivo (após encerramento)</Label>
                            <Input id="result" {...register('result')} placeholder="Ex: Time A venceu por 2x1"/>
                            {errors.result && <p className="text-sm text-red-500 mt-1">{errors.result.message}</p>}
                        </div>
                    </div>
                )}


                <div className="space-y-2 pt-2">
                    <div className="flex items-center space-x-2">
                       <Switch id="modal_is_public" checked={isPublic} onCheckedChange={setIsPublic} />
                       <Label htmlFor="modal_is_public">Aposta Pública</Label>
                    </div>
                    {!isPublic && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-1 p-3 border rounded-md bg-slate-50 dark:bg-slate-800/50"
                      >
                        <Label htmlFor="modal_private_access_code">Código de Acesso</Label>
                         <div className="flex items-center space-x-2">
                            <Input 
                                id="modal_private_access_code" 
                                type={showAccessCode ? "text" : "password"}
                                value={privateAccessCode}
                                onChange={(e) => {
                                setPrivateAccessCode(e.target.value);
                                setValue('private_access_code', e.target.value);
                                trigger('private_access_code');
                                }}
                                placeholder="Mínimo 6 caracteres"
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => setShowAccessCode(!showAccessCode)}>
                                {showAccessCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        {errors.private_access_code && <p className="text-sm text-red-500 mt-1">{errors.private_access_code.message}</p>}
                        <Button type="button" variant="link" onClick={generateAccessCode} className="text-xs p-0 h-auto">Gerar Código</Button>
                      </motion.div>
                    )}
                  </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loadingBets}>
                    {loadingBets ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isEditing ? 'Salvar Alterações' : 'Criar Aposta'}
                  </Button>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };

    export default BetFormModal;
  