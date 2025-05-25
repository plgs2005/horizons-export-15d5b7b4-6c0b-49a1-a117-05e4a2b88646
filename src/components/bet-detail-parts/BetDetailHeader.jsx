
    import React from 'react';
    import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { Globe, LockKeyhole } from 'lucide-react';

    const BetDetailHeader = ({ title, imageUrl, creatorName, isPublic }) => {
      if (imageUrl) {
        return (
          <div className="relative h-64 md:h-80 w-full overflow-hidden">
            <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            <div className="absolute top-4 right-4 p-2 rounded-full text-white bg-black/50 backdrop-blur-sm">
                {isPublic ? <Globe size={20} /> : <LockKeyhole size={20} />}
            </div>
            <div className="absolute bottom-0 left-0 p-6">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-white shadow-text"
              >
                {title}
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-slate-200 mt-1 text-sm"
              >
                Criado por: {creatorName || 'Desconhecido'}
              </motion.p>
            </div>
          </div>
        );
      }

      return (
        <CardHeader className="p-6 border-b dark:border-slate-700 relative">
            <div className="absolute top-4 right-4 p-1.5 rounded-full text-white bg-slate-400 dark:bg-slate-600">
                {isPublic ? <Globe size={16} /> : <LockKeyhole size={16} />}
            </div>
            <CardTitle className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Criado por: {creatorName || 'Desconhecido'}</CardDescription>
        </CardHeader>
      );
    };

    export default BetDetailHeader;
  