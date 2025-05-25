
    import React from 'react';
    import { Loader2 } from 'lucide-react';

    const PixPaymentGenerating = () => {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 py-8 min-h-[200px]">
          <Loader2 size={48} className="text-primary animate-spin" />
          <p className="text-muted-foreground">Gerando cobrança PIX...</p>
        </div>
      );
    };

    export default PixPaymentGenerating;
  