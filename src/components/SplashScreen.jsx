
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Zap, ShieldCheck, Users, BarChart2 } from 'lucide-react';
    import AnimatedLogo from '@/components/AnimatedLogo.jsx'; // Importar o novo logo animado

    const iconVariants = {
      hidden: { opacity: 0, scale: 0.5, rotate: -180 },
      visible: (i) => ({
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
          delay: i * 0.2 + 0.5, // Atrasar um pouco para o logo animar primeiro
          type: 'spring',
          stiffness: 260,
          damping: 20,
        },
      }),
    };

    const SplashScreenComponent = () => {
      const icons = [
        <Zap key="zap" className="h-7 w-7 text-yellow-400" />,
        <ShieldCheck key="shield" className="h-7 w-7 text-green-400" />,
        <Users key="users" className="h-7 w-7 text-blue-400" />,
        <BarChart2 key="chart" className="h-7 w-7 text-purple-400" />,
      ];

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-white overflow-hidden p-4"
        >
          <motion.div 
            className="mb-8" // Aumentar margem inferior se necessário
            initial={{ y: -50, opacity: 0}}
            animate={{ y: 0, opacity: 1}}
            transition={{type: "spring", stiffness: 100, damping:15, delay: 0.1}}
          >
            {/* Substituindo img e h1 pelo AnimatedLogo */}
            <AnimatedLogo className="text-4xl md:text-5xl" />
          </motion.div>

          <motion.p 
            className="text-lg text-slate-300 mb-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }} // Atraso para aparecer após o logo
          >
            A emoção das apostas entre amigos!
          </motion.p>

          <div className="flex space-x-5 mb-10">
            {icons.map((icon, i) => (
              <motion.div key={i} custom={i} variants={iconVariants} initial="hidden" animate="visible">
                {icon}
              </motion.div>
            ))}
          </div>
          
          <div className="w-3/4 max-w-sm h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.4 }}
            />
          </div>
          <motion.p 
            className="text-sm text-slate-400 mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            Carregando...
          </motion.p>
        </motion.div>
      );
    };

    export default SplashScreenComponent;
  