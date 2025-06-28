import React, { useState } from 'react';
import { Form, Input, Button, message, Avatar, Card, Typography } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const AddUserForm = ({ onUserAdded }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    const formData = new FormData();
    if (avatar) formData.append('avatar', avatar);
    Object.keys(values).forEach(key => formData.append(key, values[key]));

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/auth/create-user', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      message.success('Utilisateur simple ajouté avec succès');
      form.resetFields();
      setAvatar(null);
      if (onUserAdded) onUserAdded();
    } catch (err) {
      message.error(err.response?.data?.error || 'Erreur serveur');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 0' }}>
      <Card style={{ borderColor: '#2e7d32', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ color: '#2e7d32' }}>Ajouter un utilisateur simple</Title>
          <Text type="secondary">Remplissez les informations ci-dessous</Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Avatar
            src={avatar ? URL.createObjectURL(avatar) : null}
            icon={!avatar && <UserOutlined />}
            size={100}
            style={{
              backgroundColor: '#f0f9eb',
              border: '2px solid #2e7d32'
            }}
          />
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item name="username" label="Nom d'utilisateur" rules={[{ required: true }, { min: 3 }]}>
            <Input prefix={<UserOutlined />} size="large" placeholder="Nom d'utilisateur" />
          </Form.Item>

          <Form.Item name="password" label="Mot de passe" rules={[{ required: true }, { min: 6 }]}>
            <Input.Password prefix={<LockOutlined />} size="large" placeholder="Mot de passe" />
          </Form.Item>

          <Form.Item name="fullName" label="Nom complet" rules={[{ required: true }]}>
            <Input size="large" placeholder="Nom complet" />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
            <Input prefix={<MailOutlined />} size="large" placeholder="Email" />
          </Form.Item>

          <Form.Item name="profession" label="Profession" rules={[{ required: true }]}>
            <Input prefix={<EnvironmentOutlined />} size="large" placeholder="Profession" />
          </Form.Item>

          <Form.Item style={{ marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                backgroundColor: '#2e7d32',
                borderColor: '#2e7d32',
                height: 48,
                fontSize: 16,
                fontWeight: 500
              }}
            >
              Créer l'utilisateur simple
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddUserForm;