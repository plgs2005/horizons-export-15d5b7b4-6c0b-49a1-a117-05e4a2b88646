
    import React from 'react';
    import { X } from 'lucide-react';

    const PixPaymentModalHeader = ({ onClose }) => {
      return (
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-primary">Pagamento PIX</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>
      );
    };

    export default PixPaymentModalHeader;
  