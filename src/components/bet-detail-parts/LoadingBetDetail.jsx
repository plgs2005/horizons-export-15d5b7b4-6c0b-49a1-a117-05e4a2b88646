
    import React from 'react';
    import { motion } from 'framer-motion';
    import { DollarSign } from 'lucide-react';

    const LoadingBetDetail = () => {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 text-primary"
          >
            <DollarSign className="h-full w-full" />
          </motion.div>
          <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">Carregando detalhes do bolão...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">A emoção está a caminho!</p>
        </div>
      );
    };

    export default LoadingBetDetail;
  