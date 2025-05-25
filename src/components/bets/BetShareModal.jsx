
    import React from 'react';
    import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { QRCodeSVG } from 'qrcode.react';
    import { Copy, Check, Share2, X } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    const BetShareModal = ({ isOpen, onClose, betUrl, betTitle, isPrivate, accessCode }) => {
      const { toast } = useToast();
      const [copiedLink, setCopiedLink] = React.useState(false);
      const [copiedCode, setCopiedCode] = React.useState(false);

      const handleCopy = (textToCopy, type) => {
        if (!navigator.clipboard) {
          toast({ variant: "destructive", title: "Erro", description: "Seu navegador não suporta a cópia para a área de transferência." });
          return;
        }
        navigator.clipboard.writeText(textToCopy).then(() => {
          if (type === 'link') {
            setCopiedLink(true);
            toast({ title: "Link Copiado!", description: "O link da aposta foi copiado." });
            setTimeout(() => setCopiedLink(false), 2000);
          } else if (type === 'code') {
            setCopiedCode(true);
            toast({ title: "Código Copiado!", description: "O código de acesso foi copiado." });
            setTimeout(() => setCopiedCode(false), 2000);
          }
        }).catch(err => {
          console.error('Failed to copy: ', err);
          toast({ variant: "destructive", title: "Erro ao Copiar", description: "Não foi possível copiar o texto." });
        });
      };

      const handleNativeShare = async () => {
        let shareData = {
          title: `Pagoul Aposta: ${betTitle}`,
          text: `Participe da aposta "${betTitle}"!`,
          url: betUrl,
        };
        if (isPrivate && accessCode) {
            shareData.text += `\nCódigo de Acesso: ${accessCode}`;
        }

        if (navigator.share) {
          try {
            await navigator.share(shareData);
            toast({ title: "Compartilhado!", description: "Aposta compartilhada com sucesso." });
          } catch (error) {
            if (error.name !== 'AbortError') {
              console.error('Error sharing natively:', error);
              toast({ variant: "destructive", title: "Erro ao Compartilhar", description: "Não foi possível usar o compartilhamento nativo." });
            }
          }
        } else {
           toast({ variant: "default", title: "Compartilhamento Nativo Indisponível", description: "Use o link ou QR code para compartilhar." });
        }
      };

      const handleClose = () => {
        if (typeof onClose === 'function') {
          onClose();
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md bg-card text-card-foreground rounded-lg shadow-xl">
            <DialogHeader className="p-6 pr-12 relative">
              <DialogTitle className="text-2xl font-semibold flex items-center">
                <Share2 className="mr-2 h-6 w-6 text-primary" />
                Compartilhar Aposta
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {betTitle}
              </DialogDescription>
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full" onClick={handleClose}>
                <X className="h-5 w-5" />
                <span className="sr-only">Fechar</span>
              </Button>
            </DialogHeader>
            <div className="p-6 grid gap-6">
              <div className="flex flex-col items-center justify-center bg-muted p-4 rounded-lg">
                <QRCodeSVG value={betUrl} size={160} includeMargin={true} level="H" imageSettings={{
                    src: "/icon-512x512.png",
                    height: 30,
                    width: 30,
                    excavate: true,
                }}/>
                <p className="text-sm text-muted-foreground mt-3">Escaneie para abrir a aposta</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bet-link" className="font-medium">Link da Aposta</Label>
                <div className="flex items-center space-x-2">
                  <Input id="bet-link" value={betUrl} readOnly className="bg-input border-border focus:ring-primary"/>
                  <Button type="button" size="icon" variant="outline" onClick={() => handleCopy(betUrl, 'link')}>
                    {copiedLink ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    <span className="sr-only">Copiar link</span>
                  </Button>
                </div>
              </div>

              {isPrivate && accessCode && (
                <div className="space-y-2">
                  <Label htmlFor="access-code" className="font-medium">Código de Acesso (Privado)</Label>
                  <div className="flex items-center space-x-2">
                    <Input id="access-code" value={accessCode} readOnly className="bg-input border-border font-mono tracking-wider"/>
                    <Button type="button" size="icon" variant="outline" onClick={() => handleCopy(accessCode, 'code')}>
                      {copiedCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                       <span className="sr-only">Copiar código</span>
                    </Button>
                  </div>
                </div>
              )}
               {navigator.share && (
                <Button onClick={handleNativeShare} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Share2 className="mr-2 h-4 w-4" /> Compartilhar via...
                </Button>
               )}

            </div>
            <DialogFooter className="p-6 pt-0">
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default BetShareModal;
  