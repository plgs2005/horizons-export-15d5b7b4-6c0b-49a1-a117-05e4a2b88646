
    import React from 'react';
    import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

    const PixPaymentError = ({ error, onRetry, isLoading }) => {
      return (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-md text-center min-h-[200px] flex flex-col justify-center">
          <AlertCircle size={32} className="mx-auto mb-2" />
          <p className="font-semibold">Erro ao Gerar Cobrança</p>
          <p className="text-sm mb-3">{error || 'Não foi possível gerar a cobrança PIX.'}</p>
          <button 
            onClick={onRetry} 
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md text-sm font-medium inline-flex items-center self-center"
          >
            {isLoading ? <Loader2 size={16} className="mr-2 animate-spin"/> : <RefreshCw size={16} className="mr-2"/>}
            Tentar Novamente
          </button>
        </div>
      );
    };

    export default PixPaymentError;
  