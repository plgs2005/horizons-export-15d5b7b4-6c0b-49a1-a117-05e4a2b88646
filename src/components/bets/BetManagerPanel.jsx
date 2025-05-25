
    import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Label } from '@/components/ui/label';
    import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
    import { Edit2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    const BetManagerPanel = ({ bet, onEndBet }) => {
      const [showEndBetDialog, setShowEndBetDialog] = useState(false);
      const [winningTeam, setWinningTeam] = useState('');
      const { toast } = useToast();

      const handleConfirmEndBet = () => {
        if (!winningTeam) {
          toast({ variant: "destructive", title: "Seleção Necessária", description: "Por favor, selecione o time/lado vencedor." });
          return;
        }
        onEndBet(winningTeam);
        setShowEndBetDialog(false);
      };

      return (
        <Card className="shadow-xl border-amber-500/50">
          <CardHeader className="bg-amber-500/10">
            <CardTitle className="text-2xl flex items-center text-amber-700"><Edit2 className="mr-2 h-6 w-6" /> Painel do Gerente</CardTitle>
            <CardDescription className="text-amber-600">Você é o gerente desta aposta.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">Como gerente, você pode encerrar a aposta e definir o vencedor.</p>
            <AlertDialog open={showEndBetDialog} onOpenChange={setShowEndBetDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="lg" className="w-full">Encerrar Aposta e Definir Vencedor</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Definir Vencedor</AlertDialogTitle>
                  <AlertDialogDescription>
                    Selecione o time/lado vencedor para encerrar a aposta. Esta ação é irreversível.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Label className="text-base font-semibold mb-2 block">Selecione o Vencedor</Label>
                  <RadioGroup value={winningTeam} onValueChange={setWinningTeam} className="space-y-2">
                    {[bet.teamA, bet.teamB].map(team => (
                      <Label key={`winner-${team}`} htmlFor={`winner-${team}`} className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent ${winningTeam === team ? 'bg-primary/10 border-primary ring-2 ring-primary' : ''}`}>
                        <RadioGroupItem value={team} id={`winner-${team}`} />
                        <span>{team}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmEndBet} disabled={!winningTeam}>Confirmar Vencedor</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      );
    };

    export default BetManagerPanel;
  