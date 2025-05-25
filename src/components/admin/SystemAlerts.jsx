
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { AlertTriangle, BellRing } from 'lucide-react';

    const SystemAlerts = ({ pendingBetsCount = 0, unresolvedDisputesCount = 0 }) => {
      const hasAlerts = pendingBetsCount > 0 || unresolvedDisputesCount > 0;

      return (
        <Card className="shadow-lg border-l-4 border-yellow-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-700 flex items-center">
              <BellRing className="h-5 w-5 mr-2 text-yellow-500" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasAlerts ? (
              <p className="text-sm text-slate-500">Nenhuma notificação importante no momento.</p>
            ) : (
              <ul className="space-y-2">
                {pendingBetsCount > 0 && (
                  <li className="flex items-start text-sm text-yellow-700">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Existem <strong>{pendingBetsCount}</strong> apostas pendentes que ultrapassaram o prazo e aguardam finalização.</span>
                  </li>
                )}
                {unresolvedDisputesCount > 0 && (
                  <li className="flex items-start text-sm text-orange-700">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Existem <strong>{unresolvedDisputesCount}</strong> disputas não resolvidas que requerem atenção.</span>
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      );
    };

    export default SystemAlerts;
  