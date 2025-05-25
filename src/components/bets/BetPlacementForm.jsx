
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
    import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
    import { CheckCircle, ShieldAlert } from 'lucide-react';
    import { useAuth } from '@/contexts/AuthContext.jsx';
    import { useToast } from '@/components/ui/use-toast';
    import { useNavigate } from 'react-router-dom';


    const BetPlacementForm = ({ bet, selectedTeam, setSelectedTeam, betAmount, setBetAmount, onPlaceBet }) => {
      const { user } = useAuth();
      const { toast } = useToast();
      const navigate = useNavigate();

      const handleConfirmBet = () => {
        if (!user?.pix_key) {
          toast({
            variant: "destructive",
            title: "Chave PIX Necessária",
            description: "Você precisa cadastrar uma chave PIX no seu perfil para poder apostar.",
            action: <Button onClick={() => navigate('/perfil')}>Ir para Perfil</Button>,
          });
          return;
        }
        onPlaceBet();
      };
      
      return (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Fazer Aposta</CardTitle>
            <CardDescription>Escolha seu time/lado e o valor da sua aposta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user?.pix_key && (
              <Alert variant="warning" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300">
                <ShieldAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <AlertTitle className="font-semibold">Chave PIX Pendente</AlertTitle>
                <AlertDescription>
                  Você precisa <Button variant="link" className="p-0 h-auto text-yellow-700 dark:text-yellow-300 underline" onClick={() => navigate('/perfil')}>cadastrar uma chave PIX</Button> no seu perfil para realizar apostas.
                </AlertDescription>
              </Alert>
            )}
            <div>
              <Label className="text-base font-semibold mb-2 block">Selecione o Time/Lado</Label>
              <RadioGroup value={selectedTeam} onValueChange={setSelectedTeam} className="flex flex-col sm:flex-row gap-4">
                {[bet.teamA, bet.teamB].map(team => (
                  <Label key={team} htmlFor={`team-${team}`} className={`flex-1 flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-accent ${selectedTeam === team ? 'bg-primary/10 border-primary ring-2 ring-primary' : ''}`}>
                    <RadioGroupItem value={team} id={`team-${team}`} />
                    <span>{team}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="betAmount" className="text-base font-semibold">Valor da Aposta (R$)</Label>
              <Input
                id="betAmount"
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min={bet.minBet}
                step="0.01"
                placeholder={`Mínimo R$ ${bet.minBet.toFixed(2)}`}
                className="text-lg h-12 mt-1"
                disabled={!user?.pix_key}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full" onClick={handleConfirmBet} disabled={!user?.pix_key || !selectedTeam || parseFloat(betAmount) < bet.minBet}>
              Confirmar Aposta de R$ {parseFloat(betAmount) || 0}
            </Button>
          </CardFooter>
        </Card>
      );
    };

    export default BetPlacementForm;
  