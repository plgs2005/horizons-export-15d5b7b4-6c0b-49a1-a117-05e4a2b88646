
    import React from 'react';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Button } from '@/components/ui/button';
    import { CheckCircle, Loader2 } from 'lucide-react';
    import { motion } from 'framer-motion';

    const ParticipantsList = ({ participants, betOptions, isBetOwner, onConfirmPayment, loadingConfirmation }) => {
      return (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Participantes ({participants.length})</h3>
          {participants.length > 0 ? (
            <div className="space-y-3">
              {participants.map((p, index) => (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-lg shadow-sm transition-colors
                              ${p.status === 'pago' ? 'bg-green-50 dark:bg-green-800/30 border-l-4 border-green-500' 
                              : p.status === 'pendente' ? 'bg-yellow-50 dark:bg-yellow-800/30 border-l-4 border-yellow-500' 
                              : 'bg-slate-100 dark:bg-slate-700'}`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={p.profiles?.avatar_url || `https://avatar.vercel.sh/${p.profiles?.email || p.usuario_id}.png`} />
                      <AvatarFallback>{p.profiles?.name ? p.profiles.name.substring(0,1).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{p.profiles?.name || 'Usuário Anônimo'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Apostou em: {betOptions.find(o => o.value === p.selected_option)?.label || p.selected_option}</p>
                    </div>
                  </div>
                  <div className="text-right">
                      <p className={`text-sm font-semibold ${p.status === 'pago' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                          R$ {Number(p.valor_apostado).toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                          p.status === 'pago' ? 'bg-green-200 text-green-800 dark:bg-green-600/50 dark:text-green-200' :
                          p.status === 'pendente' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-600/50 dark:text-yellow-200' : ''
                      }`}>
                          {p.status === 'pago' ? 'Confirmado' : 'Pendente'} ({p.metodo_pagamento})
                      </span>
                      {isBetOwner && p.status === 'pendente' && p.metodo_pagamento === 'dinheiro' && (
                          <Button 
                            size="xs" 
                            variant="outline" 
                            className="mt-1 text-xs border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-500/10" 
                            onClick={() => onConfirmPayment(p.id)}
                            disabled={loadingConfirmation}
                          >
                              {loadingConfirmation ? <Loader2 className="h-3 w-3 mr-1 animate-spin"/> : <CheckCircle className="h-3 w-3 mr-1"/>} 
                              Confirmar
                          </Button>
                      )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-center py-4">Ninguém apostou neste bolão ainda. Seja o primeiro!</p>
          )}
        </div>
      );
    };

    export default ParticipantsList;
  