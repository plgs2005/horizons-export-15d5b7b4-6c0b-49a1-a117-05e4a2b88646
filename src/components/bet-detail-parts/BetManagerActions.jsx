
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
    import { Label } from "@/components/ui/label";
    import { ShieldCheck } from 'lucide-react';

    const BetManagerActions = ({ options, selectedOption, onOptionChange, onEndBet, isLoading }) => {
      return (
        <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-500/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-700 dark:text-blue-300 flex items-center">
              <ShieldCheck className="mr-2 h-6 w-6" />
              Gerenciar Aposta
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Como criador, você pode encerrar esta aposta definindo a opção vencedora.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                Selecione a Opção Vencedora:
              </Label>
              <RadioGroup value={selectedOption} onValueChange={onOptionChange} className="space-y-2">
                {options && options.length > 0 ? options.map((opt, index) => (
                  <Label 
                    key={opt.value || index} 
                    htmlFor={`win-option-${opt.value || index}`} 
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out 
                                ${selectedOption === opt.value ? 'bg-blue-500/20 border-blue-500 ring-2 ring-blue-500 dark:bg-blue-500/40 shadow-md' : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600/70 border-slate-300 dark:border-slate-600'}`}
                  >
                    <RadioGroupItem value={opt.value} id={`win-option-${opt.value || index}`} className="border-blue-500 text-blue-500 focus:ring-blue-500"/>
                    <span className={`font-medium text-sm ${selectedOption === opt.value ? 'text-blue-700 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'}`}>{opt.label}</span>
                  </Label>
                )) : <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma opção disponível para definir como vencedora.</p>}
              </RadioGroup>
            </div>
            <Button 
              onClick={() => onEndBet(selectedOption)} 
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 rounded-md shadow-lg"
              disabled={!selectedOption || isLoading}
            >
              {isLoading ? 'Encerrando...' : 'Encerrar Aposta e Definir Vencedor'}
            </Button>
          </CardContent>
        </Card>
      );
    };

    export default BetManagerActions;
  