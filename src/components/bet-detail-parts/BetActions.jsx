
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
    import { DollarSign, ShieldAlert } from 'lucide-react';
    import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

    const BetActions = ({ 
      options, 
      selectedOption, 
      onOptionChange, 
      betAmount, 
      onAmountChange, 
      minAmount, 
      onPlaceBet, 
      isPlacingBet, 
      canStillBet,
      userPixKey,
      onNavigateToProfile
    }) => {
      if (!canStillBet) return null;

      const handlePixBet = () => {
        if (!userPixKey) {
            onNavigateToProfile(); 
            return;
        }
        onPlaceBet('PIX');
      }

      return (
        <Card className="bg-slate-50 dark:bg-slate-800/50 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary dark:text-primary-foreground">Sua Vez de Jogar!</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Escolha sua opção e defina o valor da fezinha.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!userPixKey && (
                 <Alert variant="warning" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300">
                    <ShieldAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <AlertTitle className="font-semibold">Chave PIX Pendente</AlertTitle>
                    <AlertDescription>
                    Você precisa <Button variant="link" className="p-0 h-auto text-yellow-700 dark:text-yellow-300 underline" onClick={onNavigateToProfile}>cadastrar uma chave PIX</Button> no seu perfil para apostar com PIX.
                    </AlertDescription>
                </Alert>
            )}
            <div>
              <Label className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Selecione uma Opção:</Label>
              <RadioGroup value={selectedOption} onValueChange={onOptionChange} className="space-y-2">
                {options && options.length > 0 ? options.map((opt, index) => (
                  <Label 
                      key={opt.value || index} 
                      htmlFor={`option-${opt.value || index}`} 
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02]
                                  ${selectedOption === opt.value ? 'bg-primary/20 border-primary ring-2 ring-primary dark:bg-primary/40 shadow-md' : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600/70 border-slate-300 dark:border-slate-600'}`}
                  >
                      <RadioGroupItem value={opt.value} id={`option-${opt.value || index}`} className="border-primary text-primary focus:ring-primary"/>
                      <span className={`font-medium text-sm md:text-base ${selectedOption === opt.value ? 'text-primary dark:text-primary-foreground' : 'text-slate-800 dark:text-slate-200'}`}>{opt.label}</span>
                  </Label>
                )) : <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma opção de aposta disponível.</p>}
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="betAmount" className="text-base font-semibold text-slate-700 dark:text-slate-300">Valor da Aposta (R$)</Label>
              <Input 
                type="number" 
                id="betAmount" 
                value={betAmount} 
                onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)} 
                min={minAmount || 0}
                placeholder={`Mín. R$ ${Number(minAmount || 0).toFixed(2)}`}
                className="mt-1 h-12 text-lg bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
                onClick={handlePixBet} 
                disabled={isPlacingBet || !selectedOption || !userPixKey || betAmount < (minAmount || 0)}
                className="w-full sm:w-auto flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg transform transition-all duration-150 ease-in-out hover:scale-105 focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
            >
              {isPlacingBet ? <DollarSign className="mr-2 h-5 w-5 animate-spin" /> : <DollarSign className="mr-2 h-5 w-5" />}
              Apostar com PIX
            </Button>
            <Button 
                onClick={() => onPlaceBet('Dinheiro')} 
                disabled={isPlacingBet || !selectedOption || betAmount < (minAmount || 0)}
                variant="outline"
                className="w-full sm:w-auto flex-1 border-amber-500 text-amber-600 hover:bg-amber-500/10 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-400/10 shadow-md transform transition-all duration-150 ease-in-out hover:scale-105 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
            >
              {isPlacingBet ? <DollarSign className="mr-2 h-5 w-5 animate-spin" /> : <DollarSign className="mr-2 h-5 w-5" />}
              Apostar com Dinheiro
            </Button>
          </CardFooter>
        </Card>
      );
    };

    export default BetActions;
  