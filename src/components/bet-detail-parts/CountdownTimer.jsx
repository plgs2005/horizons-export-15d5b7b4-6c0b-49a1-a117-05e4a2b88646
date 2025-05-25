
    import React, { useState, useEffect } from 'react';

    const CountdownTimer = ({ deadline }) => {
      const calculateTimeLeft = () => {
        const difference = +new Date(deadline) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
          timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          };
        }
        return timeLeft;
      };

      const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
      const [isClient, setIsClient] = useState(false);

      useEffect(() => {
        setIsClient(true);
        if (!deadline) return;

        const timer = setInterval(() => { // Changed to setInterval
          setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer); // Changed to clearInterval
      }, [deadline]);
      
      if (!isClient || !deadline) {
        return <div className="text-sm text-slate-500 dark:text-slate-400">Carregando tempo restante...</div>;
      }

      const timerComponents = [];
      Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval] && timeLeft[interval] !== 0) {
          return;
        }
        timerComponents.push(
          <div key={interval} className="flex flex-col items-center p-2 bg-red-500/10 dark:bg-red-400/20 rounded-lg shadow-inner">
            <span className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">{timeLeft[interval]}</span>
            <span className="text-xs text-red-500 dark:text-red-300 uppercase">{interval}</span>
          </div>
        );
      });
      
      const timeIsUp = !timerComponents.length && new Date(deadline) < new Date();

      return (
        <div className="my-6 p-4 bg-gradient-to-r from-red-500/5 via-red-600/5 to-red-700/5 dark:from-red-500/10 dark:via-red-600/10 dark:to-red-700/10 rounded-xl shadow-lg border border-red-500/20">
          <h3 className="text-center text-lg font-semibold mb-3 text-red-700 dark:text-red-300">
            {timeIsUp ? "Tempo Esgotado!" : "Tempo Restante para Apostar!"}
          </h3>
          {timeIsUp ? (
            <p className="text-center text-red-600 dark:text-red-400">As apostas para este bolão estão encerradas.</p>
          ) : (
            <div className="flex justify-center space-x-2 md:space-x-4">
              {timerComponents.length ? timerComponents : <p className="text-center text-slate-500 dark:text-slate-400">Calculando...</p>}
            </div>
          )}
        </div>
      );
    };
    export default CountdownTimer;
  