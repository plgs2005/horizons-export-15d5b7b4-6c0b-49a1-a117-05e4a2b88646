
    import React from 'react';
    import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

    const PixPaymentExpired = ({ onRetry, isLoading }) => {
      return (
        <div className="text-center py-8 min-h-[200px] flex flex-col justify-center">
          <AlertCircle size={64} className="text-destructive mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-destructive">Cobrança PIX Expirada!</h3>
          <p className="text-muted-foreground mt-2">O tempo para pagamento desta cobrança PIX terminou.</p>
          <button 
            onClick={onRetry} 
            disabled={isLoading}
            className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md text-sm font-medium inline-flex items-center self-center"
          >
            {isLoading ? <Loader2 size={16} className="mr-2 animate-spin"/> : <RefreshCw size={16} className="mr-2"/>}
            Gerar Nova Cobrança PIX
          </button>
        </div>
      );
    };

    export default PixPaymentExpired;
  