import React from 'react';
import AddAdminForm from '../components/AddAdminForm';
import { Card } from 'antd';

const AddAdminPage = () => {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Card title="Ajouter un nouvel administrateur">
        <AddAdminForm onAdminAdded={() => window.location.href = '/admin'} />
      </Card>
    </div>
  );
};

export default AddAdminPage;