
    import React from 'react';
    import GeneralSettingsCard from '@/components/admin/settings/GeneralSettingsCard.jsx';
    import BetSettingsCard from '@/components/admin/settings/BetSettingsCard.jsx';
    import PaymentIntegrationSettingsCard from '@/components/admin/settings/PaymentIntegrationSettingsCard.jsx';

    const SystemSettingsForm = () => {
      return (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
          <GeneralSettingsCard />
          <BetSettingsCard />
          <PaymentIntegrationSettingsCard />
        </div>
      );
    };

    export default SystemSettingsForm;
  