
    import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';

    const BetSettingsForm = () => {
      const { toast } = useToast();
      const [settings, setSettings] = useState({
        minBet: '10',
        maxBet: '1000',
        platformFee: '5',
        maxManagerFee: '10',
      });

      const handleChange = (e) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Bet settings saved:", settings);
        toast({
          title: "Configurações de Apostas Salvas",
          description: "Os parâmetros globais para apostas foram atualizados.",
        });
      };

      return (
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Apostas</CardTitle>
            <CardDescription>Defina os parâmetros globais para apostas</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minBet">Valor Mínimo de Aposta (R$)</Label>
                  <Input id="minBet" type="number" value={settings.minBet} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBet">Valor Máximo de Aposta (R$)</Label>
                  <Input id="maxBet" type="number" value={settings.maxBet} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platformFee">Taxa da Plataforma (%)</Label>
                  <Input id="platformFee" type="number" value={settings.platformFee} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxManagerFee">Taxa Máxima do Gerente (%)</Label>
                  <Input id="maxManagerFee" type="number" value={settings.maxManagerFee} onChange={handleChange} />
                </div>
              </div>
              <Button type="submit" className="w-full">Salvar Configurações</Button>
            </form>
          </CardContent>
        </Card>
      );
    };

    export default BetSettingsForm;
  