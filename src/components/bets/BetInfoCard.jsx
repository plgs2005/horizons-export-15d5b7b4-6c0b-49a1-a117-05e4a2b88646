
    import React from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Badge } from '@/components/ui/badge';
    import { Info, Clock, DollarSign, Percent, CheckCircle, XCircle, Trophy, Share2 } from 'lucide-react';

    const BetInfoCard = ({ bet, onShare }) => {
      const infoItems = [
        { label: "Esporte", value: bet.sport, icon: <Info className="h-4 w-4 text-primary" /> },
        { label: "Local", value: `${bet.location} (${bet.subLocation || 'N/A'})`, icon: <Info className="h-4 w-4 text-primary" /> },
        { label: "Data Limite", value: new Date(bet.deadline).toLocaleString('pt-BR'), icon: <Clock className="h-4 w-4 text-primary" /> },
        { label: "Valor Mínimo", value: `R$ ${bet.minBet.toFixed(2)}`, icon: <DollarSign className="h-4 w-4 text-primary" /> },
        { label: "Taxa do Gerente", value: `${bet.managerFee}%`, icon: <Percent className="h-4 w-4 text-primary" /> },
        { 
          label: "Status", 
          value: <Badge variant={bet.status === 'Aberta' ? 'default' : 'secondary'}>{bet.status}</Badge>, 
          icon: bet.status === 'Aberta' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" /> 
        },
      ];

      if (bet.winner) {
        infoItems.push({ 
          label: "Vencedor", 
          value: <Badge variant="success" className="bg-green-500/20 text-green-700 text-base px-3 py-1">{bet.winner}</Badge>, 
          icon: <Trophy className="h-4 w-4 text-yellow-500" /> 
        });
      }

      return (
        <Card className="shadow-xl overflow-hidden col-span-1 md:col-span-2">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent p-6 flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold">{bet.title}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground pt-1">{bet.description}</CardDescription>
            </div>
            <button
              onClick={onShare}
              className="p-2 rounded-full hover:bg-primary/20 transition-colors"
              aria-label="Compartilhar aposta"
            >
              <Share2 className="h-6 w-6 text-primary" />
            </button>
          </CardHeader>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-3">Informações da Aposta</h3>
            <div className="space-y-2">
              {infoItems.map(item => (
                <div key={item.label} className="flex items-center text-sm">
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  <span className="font-medium w-32">{item.label}:</span>
                  <span className="text-muted-foreground">{typeof item.value === 'string' ? item.value : item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    };

    export default BetInfoCard;
  