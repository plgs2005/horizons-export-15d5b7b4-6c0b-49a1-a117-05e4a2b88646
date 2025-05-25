
    import React, { useState, useEffect } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Label } from '@/components/ui/label';
    import { Button } from '@/components/ui/button';
    import { Switch } from '@/components/ui/switch';
    import { Separator } from '@/components/ui/separator';
    import { Checkbox } from '@/components/ui/checkbox';
    import { useToast } from '@/components/ui/use-toast';
    import { Save, Loader2 } from 'lucide-react';

    const SETTINGS_KEY_GENERAL = 'pagoul_system_settings_general';

    const GeneralSettingsCard = () => {
      const { toast } = useToast();
      const [maintenanceMode, setMaintenanceMode] = useState(false);
      const [notifications, setNotifications] = useState({
        emails: true,
        sms: false,
        push: true,
      });
      const [isSavingGeneral, setIsSavingGeneral] = useState(false);

      useEffect(() => {
        const saved = localStorage.getItem(SETTINGS_KEY_GENERAL);
        if (saved) {
          const s = JSON.parse(saved);
          setMaintenanceMode(s.maintenanceMode || false);
          setNotifications(s.notifications || { emails: true, sms: false, push: true });
        }
      }, []);

      const handleNotificationChange = (id) => {
        setNotifications(prev => ({ ...prev, [id]: !prev[id] }));
      };

      const handleSaveGeneralSettings = async (e) => {
        e.preventDefault();
        setIsSavingGeneral(true);
        const settingsToSave = { maintenanceMode, notifications };
        localStorage.setItem(SETTINGS_KEY_GENERAL, JSON.stringify(settingsToSave));
        await new Promise(resolve => setTimeout(resolve, 700));
        setIsSavingGeneral(false);
        toast({ title: "Configurações Gerais Salvas", description: "As configurações gerais foram atualizadas." });
      };

      return (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-slate-700">Configurações Gerais</CardTitle>
            <CardDescription className="text-slate-500">Ajustes globais da plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border">
                  <div>
                    <Label htmlFor="maintenanceModeSwitch" className="font-medium text-slate-600">Modo de Manutenção</Label>
                    <p className="text-xs text-slate-500">
                      Ative para realizar manutenções no sistema.
                    </p>
                  </div>
                  <Switch 
                    id="maintenanceModeSwitch"
                    checked={maintenanceMode} 
                    onCheckedChange={setMaintenanceMode} 
                  />
                </div>
                <Separator />
                <div className="space-y-2 p-3 bg-slate-50 rounded-md border">
                  <Label className="font-medium text-slate-600">Notificações do Sistema</Label>
                  <div className="space-y-1">
                    {[
                      { id: 'emails', label: 'Emails de Sistema' },
                      { id: 'sms', label: 'Notificações SMS (se configurado)' },
                      { id: 'push', label: 'Notificações Push (web/app)' }
                    ].map(item => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={item.id} 
                          checked={notifications[item.id]} 
                          onCheckedChange={() => handleNotificationChange(item.id)}
                        />
                        <Label htmlFor={item.id} className="text-sm font-normal text-slate-600">{item.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isSavingGeneral}>
                {isSavingGeneral ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Configurações Gerais
              </Button>
            </form>
          </CardContent>
        </Card>
      );
    };

    export default GeneralSettingsCard;
  