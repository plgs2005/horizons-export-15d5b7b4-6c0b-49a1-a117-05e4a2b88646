
    import React from 'react';

    const PixPaymentModalFooter = ({ onClose }) => {
      return (
        <div className="p-6 border-t border-border text-right">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors"
          >
            Fechar
          </button>
        </div>
      );
    };

    export default PixPaymentModalFooter;
  