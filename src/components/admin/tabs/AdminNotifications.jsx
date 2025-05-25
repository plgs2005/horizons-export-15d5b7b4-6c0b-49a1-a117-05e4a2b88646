
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { BellRing, Send, Settings2 } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';


    const AdminNotifications = () => {
      return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Gerenciamento de Notificações</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Envie notificações para usuários e configure alertas do sistema. (Funcionalidade em desenvolvimento)
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-700 dark:text-slate-200">
                  <Send className="mr-2 h-5 w-5 text-primary" /> Enviar Notificação em Massa
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Envie uma mensagem para todos os usuários ou um grupo específico.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notificationTitle" className="text-slate-600 dark:text-slate-300">Título</Label>
                  <Input id="notificationTitle" placeholder="Título da notificação" className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
                </div>
                <div>
                  <Label htmlFor="notificationMessage" className="text-slate-600 dark:text-slate-300">Mensagem</Label>
                  <Textarea id="notificationMessage" placeholder="Digite sua mensagem aqui..." className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
                </div>
                <div>
                  <Label htmlFor="notificationTarget" className="text-slate-600 dark:text-slate-300">Segmento (Opcional)</Label>
                  <Input id="notificationTarget" placeholder="Ex: 'todos', 'apostadores_ativos'" className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  <Send className="mr-2 h-4 w-4" /> Enviar Notificação
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-700 dark:text-slate-200">
                  <Settings2 className="mr-2 h-5 w-5 text-primary" /> Configurações de Alerta
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Defina gatilhos para alertas automáticos do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                  <Label htmlFor="alertNewUser" className="text-sm text-slate-600 dark:text-slate-300">Alerta de Novo Usuário Registrado</Label>
                  <Input type="checkbox" id="alertNewUser" className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary-dark dark:bg-slate-600 dark:border-slate-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                  <Label htmlFor="alertPaymentFailure" className="text-sm text-slate-600 dark:text-slate-300">Alerta de Falha em Pagamento</Label>
                  <Input type="checkbox" id="alertPaymentFailure" className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary-dark dark:bg-slate-600 dark:border-slate-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                  <Label htmlFor="alertLowBalance" className="text-sm text-slate-600 dark:text-slate-300">Alerta de Saldo Baixo do Sistema (Efí)</Label>
                  <Input type="checkbox" id="alertLowBalance" className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary-dark dark:bg-slate-600 dark:border-slate-500" />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white mt-2">
                  <Settings2 className="mr-2 h-4 w-4" /> Salvar Configurações de Alerta
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-700 dark:text-slate-200">
                <BellRing className="mr-2 h-5 w-5 text-primary" /> Histórico de Notificações
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Visualize as últimas notificações enviadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-slate-100 dark:bg-slate-700/50 rounded-md flex items-center justify-center p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">(Lista de notificações enviadas aparecerá aqui)</p>
              </div>
            </CardContent>
          </Card>

        </motion.div>
      );
    };

    export default AdminNotifications;
  