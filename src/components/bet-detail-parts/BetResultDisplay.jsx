
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

    const BetResultDisplay = ({ status, result, options }) => {
      if (status !== 'Finalizada' || !result) return null;

      return (
        <Card className="mt-6 bg-slate-50 dark:bg-slate-700/50 border-primary/30">
          <CardHeader>
            <CardTitle className="text-xl text-primary dark:text-primary-foreground">Resultado do Bolão</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">A opção vencedora foi: <strong className="text-primary">{options.find(o => o.value === result)?.label || result}</strong></p>
            {/* Futuramente: Listar ganhadores */}
          </CardContent>
        </Card>
      );
    };
    export default BetResultDisplay;
  