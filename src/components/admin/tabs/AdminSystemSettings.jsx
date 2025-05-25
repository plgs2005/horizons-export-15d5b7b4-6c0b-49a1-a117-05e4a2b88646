
    import React from 'react';
    import SystemSettingsForm from '@/components/admin/SystemSettingsForm.jsx';
    import { motion } from 'framer-motion';

    const AdminSystemSettings = () => {
      return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
          <SystemSettingsForm />
        </motion.div>
      );
    };

    export default AdminSystemSettings;
  