
    import React, { useState, useEffect } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { Save, Loader2 } from 'lucide-react';

    const SETTINGS_KEY_BETS = 'pagoul_system_settings_bets';

    const BetSettingsCard = () => {
      const { toast } = useToast();
      const [isSavingBets, setIsSavingBets] = useState(false);
      const [minBetAmount, setMinBetAmount] = useState(10);
      const [maxBetAmount, setMaxBetAmount] = useState(1000);
      const [platformFee, setPlatformFee] = useState(5);
      const [managerMaxFee, setManagerMaxFee] = useState(10);

      useEffect(() => {
        const saved = localStorage.getItem(SETTINGS_KEY_BETS);
        if (saved) {
          const s = JSON.parse(saved);
          setMinBetAmount(s.minBetAmount || 10);
          setMaxBetAmount(s.maxBetAmount || 1000);
          setPlatformFee(s.platformFee || 5);
          setManagerMaxFee(s.managerMaxFee || 10);
        }
      }, []);

      const handleSaveBetSettings = async (e) => {
        e.preventDefault();
        setIsSavingBets(true);
        const settingsToSave = { minBetAmount, maxBetAmount, platformFee, managerMaxFee };
        localStorage.setItem(SETTINGS_KEY_BETS, JSON.stringify(settingsToSave));
        await new Promise(resolve => setTimeout(resolve, 700));
        setIsSavingBets(false);
        toast({ title: "Configurações de Apostas Salvas", description: "Os parâmetros de apostas foram atualizados." });
      };

      return (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-slate-700">Configurações de Apostas</CardTitle>
            <CardDescription className="text-slate-500">Parâmetros para as apostas na plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
             <form onSubmit={handleSaveBetSettings} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="minBetAmount" className="font-medium text-slate-600">Valor Mínimo da Aposta (R$)</Label>
                  <Input id="minBetAmount" type="number" value={minBetAmount} onChange={(e) => setMinBetAmount(parseFloat(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="maxBetAmount" className="font-medium text-slate-600">Valor Máximo da Aposta (R$)</Label>
                  <Input id="maxBetAmount" type="number" value={maxBetAmount} onChange={(e) => setMaxBetAmount(parseFloat(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="platformFee" className="font-medium text-slate-600">Taxa da Plataforma (%)</Label>
                  <Input id="platformFee" type="number" value={platformFee} onChange={(e) => setPlatformFee(parseFloat(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="managerMaxFee" className="font-medium text-slate-600">Taxa Máxima do Gerente (%)</Label>
                  <Input id="managerMaxFee" type="number" value={managerMaxFee} onChange={(e) => setManagerMaxFee(parseFloat(e.target.value))} />
                </div>
              </div>
               <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isSavingBets}>
                {isSavingBets ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Configurações de Apostas
              </Button>
            </form>
          </CardContent>
        </Card>
      );
    };
    export default BetSettingsCard;
  