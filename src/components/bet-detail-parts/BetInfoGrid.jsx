
    import React from 'react';
    import { Users, CalendarDays, Clock, DollarSign, Gift, Tag, ShieldCheck, Globe } from 'lucide-react';
    
    const BetInfoGrid = ({ bet }) => {
      if (!bet) return null;
    
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg shadow">
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
            <DollarSign className="h-5 w-5 text-primary" />
            <span>Entrada: R$ {Number(bet.entry_fee || 0).toFixed(2)}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
            <Users className="h-5 w-5 text-primary" />
            <span>Participantes: {bet.participants_count || 0} / {bet.max_participants || '∞'}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span>Encerra em: {new Date(bet.close_date).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
            <Clock className="h-5 w-5 text-primary" />
            <span>Às: {new Date(bet.close_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {bet.category && (
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <Tag className="h-5 w-5 text-primary" />
              <span>Categoria: {bet.category}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
            {bet.is_public ? <Globe className="h-5 w-5 text-green-500" /> : <ShieldCheck className="h-5 w-5 text-orange-500" />}
            <span>{bet.is_public ? 'Pública' : 'Privada'}</span>
          </div>
          
          {bet.status === 'Encerrada' && bet.result_date && (
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <Gift className="h-5 w-5 text-primary" />
              <span>Resultado: {new Date(bet.result_date).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>
      );
    };
    
    export default BetInfoGrid;
  