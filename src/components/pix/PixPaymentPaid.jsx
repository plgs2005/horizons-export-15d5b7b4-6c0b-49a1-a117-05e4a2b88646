
    import React from 'react';
    import { Check } from 'lucide-react';

    const PixPaymentPaid = ({ betTitle }) => {
      return (
        <div className="text-center py-8 min-h-[200px] flex flex-col justify-center">
          <Check size={64} className="text-green-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-2xl font-semibold text-green-600">Pagamento Confirmado!</h3>
          <p className="text-muted-foreground mt-2">Sua participação na aposta <strong className="text-foreground">{betTitle}</strong> foi registrada com sucesso.</p>
        </div>
      );
    };

    export default PixPaymentPaid;
  