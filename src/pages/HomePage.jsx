
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Users, BarChart2, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <Card className="h-full transform transition-all hover:scale-105 hover:shadow-xl bg-gradient-to-br from-card to-slate-50 dark:to-slate-800/30">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="p-3 rounded-full bg-primary/10 text-primary">{icon}</div>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/apostas');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="space-y-16">
      <section className="py-16 md:py-24 text-center bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Apostas entre amigos <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              de forma simples e segura
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Organize suas apostas informais, gerencie pagamentos e acompanhe resultados de forma fácil e divertida.
          </p>
          <div className="space-x-4">
            <Button size="lg" onClick={() => navigate(isAuthenticated ? '/apostas' : '/auth')}>
              Ver Apostas
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate(isAuthenticated ? '/criar-aposta' : '/auth')}>
              Criar Aposta
            </Button>
          </div>
        </motion.div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-2">
          Tudo que você precisa para suas apostas
        </h2>
        <p className="text-muted-foreground text-center mb-10">Recursos pensados para facilitar suas disputas amigáveis.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<CreditCard className="w-6 h-6" />}
            title="Pagamentos via PIX"
            description="Receba e envie pagamentos instantaneamente usando PIX. (Simulado)"
          />
          <FeatureCard
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Segurança"
            description="Suas apostas e pagamentos são protegidos com as melhores práticas de segurança. (Simulado)"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Gestão de Participantes"
            description="Gerencie facilmente quem está participando e quem já pagou."
          />
          <FeatureCard
            icon={<BarChart2 className="w-6 h-6" />}
            title="Estatísticas"
            description="Acompanhe suas apostas e resultados com gráficos e estatísticas."
          />
        </div>
      </section>
      
      <section className="py-16 text-center bg-primary/5 rounded-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Crie sua primeira aposta hoje mesmo e convide seus amigos para a diversão.
          </p>
          <Button size="lg" onClick={handleGetStarted}>
            Criar Aposta Agora
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
