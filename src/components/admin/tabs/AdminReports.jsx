
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { BarChart, LineChart, PieChart, Activity } from 'lucide-react';

    const ReportPlaceholderCard = ({ title, description, icon: Icon }) => (
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-200">{title}</CardTitle>
          <Icon className="h-6 w-6 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
          <div className="mt-4 h-32 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">(Gráfico/Dados do relatório aqui)</p>
          </div>
        </CardContent>
      </Card>
    );

    const AdminReports = () => {
      return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Relatórios e Análises</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Visualize dados importantes sobre usuários, apostas e finanças. (Funcionalidade em desenvolvimento)
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ReportPlaceholderCard 
              title="Usuários Ativos" 
              description="Acompanhe o número de usuários ativos diariamente, semanalmente e mensalmente."
              icon={BarChart}
            />
            <ReportPlaceholderCard 
              title="Receita de Apostas" 
              description="Visualize a receita gerada pelas apostas ao longo do tempo."
              icon={LineChart}
            />
            <ReportPlaceholderCard 
              title="Categorias Populares" 
              description="Identifique as categorias de apostas mais populares entre os usuários."
              icon={PieChart}
            />
            <ReportPlaceholderCard 
              title="Taxa de Engajamento" 
              description="Analise o quão engajados os usuários estão com a plataforma."
              icon={Activity}
            />
             <ReportPlaceholderCard 
              title="Pagamentos Processados" 
              description="Relatório de pagamentos PIX processados e status."
              icon={BarChart}
            />
             <ReportPlaceholderCard 
              title="Apostas por Status" 
              description="Distribuição de apostas por status (ativas, finalizadas, canceladas)."
              icon={PieChart}
            />
          </div>
        </motion.div>
      );
    };

    export default AdminReports;
  