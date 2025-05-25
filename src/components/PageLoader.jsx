
    import React from 'react';
    import { motion } from 'framer-motion';
    import AnimatedLogo from '@/components/AnimatedLogo.jsx';

    const PageLoader = ({ message = "Carregando conteúdo..." }) => {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-background text-foreground p-4"
        >
          <div className="mb-6">
            <AnimatedLogo className="text-3xl md:text-4xl" />
          </div>
          
          <motion.p 
            className="text-lg text-slate-600 dark:text-slate-400 mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {message}
          </motion.p>

          <div className="w-full max-w-xs h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ 
                duration: 1.2, 
                ease: "easeInOut", 
                repeat: Infinity, 
                repeatType: "loop",
                repeatDelay: 0.3
              }}
              style={{ transformOrigin: "left" }}
            />
          </div>
        </motion.div>
      );
    };

    export default PageLoader;
  