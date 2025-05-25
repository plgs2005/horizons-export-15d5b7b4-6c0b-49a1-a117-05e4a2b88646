
    import React from 'react';
    import { QRCodeSVG } from 'qrcode.react';
    import { Copy, Check, Clock, Loader2 } from 'lucide-react';

    const PixPaymentPending = ({ chargeData, betTitle, copied, onCopy, countdown, formatTime }) => {
      if (!chargeData) return null;

      return (
        <>
          <p className="text-center text-muted-foreground">
            Aponte a câmera do seu celular para o QR Code ou copie o código abaixo para pagar a aposta: <strong className="text-foreground">{betTitle}</strong>.
          </p>
          <div className="flex flex-col items-center justify-center bg-muted p-4 rounded-lg">
            <QRCodeSVG value={chargeData.pixCopiaECola} size={180} includeMargin={true} level="H" />
          </div>
          <div className="space-y-1">
            <label htmlFor="pixCode" className="text-sm font-medium text-muted-foreground">PIX Copia e Cola:</label>
            <div className="flex items-center space-x-2">
              <input 
                id="pixCode" 
                type="text" 
                readOnly 
                value={chargeData.pixCopiaECola} 
                className="w-full p-2 border border-border rounded-md bg-input text-sm truncate"
              />
              <button 
                onClick={onCopy} 
                className="p-2 border border-border rounded-md hover:bg-accent transition-colors"
                title="Copiar Código PIX"
              >
                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
              </button>
            </div>
          </div>
          <div className="text-center text-primary font-semibold text-lg flex items-center justify-center">
            <Clock size={20} className="mr-2"/> 
            Expira em: {formatTime(countdown)}
          </div>
          <div className="flex flex-col items-center justify-center pt-2">
            <Loader2 size={24} className="text-primary animate-spin" />
            <p className="text-sm text-muted-foreground mt-1">Aguardando confirmação do pagamento...</p>
          </div>
        </>
      );
    };

    export default PixPaymentPending;
  