
    import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';

    const CountdownUnit = ({ value, label, isEndingSoon }) => (
      <div className="flex flex-col items-center text-center">
        <motion.span 
          key={value}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`text-3xl sm:text-4xl md:text-5xl font-extrabold ${isEndingSoon ? 'text-red-400' : 'text-white'}`}
        >
          {String(value).padStart(2, '0')}
        </motion.span>
        <span className={`text-xs sm:text-sm uppercase font-medium ${isEndingSoon ? 'text-red-200' : 'text-slate-200'}`}>
          {label}
        </span>
      </div>
    );

    const BetCardCountdown = ({ closeDate }) => {
      const calculateTimeLeft = () => {
        const difference = +new Date(closeDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
          timeLeft = {
            d: Math.floor(difference / (1000 * 60 * 60 * 24)),
            h: Math.floor((difference / (1000 * 60 * 60)) % 24),
            m: Math.floor((difference / 1000 / 60) % 60),
            s: Math.floor((difference / 1000) % 60),
          };
        }
        return timeLeft;
      };

      const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
      const [isClient, setIsClient] = useState(false);

      useEffect(() => {
        setIsClient(true);
        if (!closeDate) return;

        const timer = setInterval(() => {
          setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
      }, [closeDate]);

      if (!isClient || !closeDate) {
        return (
          <div className="h-48 w-full flex items-center justify-center bg-slate-700 text-slate-400">
            Carregando...
          </div>
        );
      }

      const hasTimeLeft = Object.values(timeLeft).some(val => val > 0) || (timeLeft.d === 0 && timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0 && +new Date(closeDate) - +new Date() > 0);
      const isEndingSoon = timeLeft.d === 0 && timeLeft.h < 6; // Exemplo: menos de 6 horas

      if (!hasTimeLeft && +new Date(closeDate) < +new Date()) {
        return (
          <div className="h-48 w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 text-white p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-bold">Tempo Esgotado!</h3>
              <p className="text-sm text-slate-300">Este bolão foi encerrado.</p>
            </motion.div>
          </div>
        );
      }
      
      const units = [
        { value: timeLeft.d, label: "Dias" },
        { value: timeLeft.h, label: "Horas" },
        { value: timeLeft.m, label: "Min" },
        { value: timeLeft.s, label: "Seg" },
      ].filter(unit => unit.value >= 0);


      return (
        <motion.div 
          className={`h-48 w-full flex flex-col items-center justify-center p-4 
                      bg-gradient-to-br ${isEndingSoon ? 'from-red-600 via-red-700 to-red-800' : 'from-primary via-blue-600 to-indigo-700'} 
                      relative overflow-hidden shadow-inner`}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
        >
           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>
          
          <div className="z-10 flex space-x-2 sm:space-x-3 md:space-x-4">
            {units.map(unit => (
              <CountdownUnit key={unit.label} value={unit.value} label={unit.label} isEndingSoon={isEndingSoon} />
            ))}
          </div>
          <p className={`z-10 mt-3 text-center text-xs ${isEndingSoon ? 'text-red-100' : 'text-slate-100'} font-medium`}>
            {isEndingSoon ? "Corra, está acabando!" : "Aposte antes que o tempo acabe!"}
          </p>
        </motion.div>
      );
    };

    export default BetCardCountdown;
  