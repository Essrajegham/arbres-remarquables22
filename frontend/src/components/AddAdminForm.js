import React, { useState } from 'react';
import { Form, Input, Button, Upload, message, Avatar, Card, Typography } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EnvironmentOutlined,
  UploadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const AddAdminForm = ({ onAdminAdded }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) message.error('Vous ne pouvez uploader que des fichiers image!');
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) message.error('La taille de l\'image ne doit pas dépasser 5MB!');
    return isImage && isLt5M;
  };

  const handleUpload = ({ file }) => {
    const realFile = file.originFileObj || file;
    if (beforeUpload(realFile)) {
      setAvatar(realFile);
    }
    return false;
  };

  const onFinish = async (values) => {
    setLoading(true);
    const formData = new FormData();

    if (avatar) formData.append('avatar', avatar);
    Object.keys(values).forEach(key => formData.append(key, values[key]));

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/auth/create-admin', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      message.success('Administrateur créé avec succès');
      form.resetFields();
      setAvatar(null);
      if (onAdminAdded) onAdminAdded();
    } catch (err) {
      message.error(err.response?.data?.error || 'Erreur lors de la création de l\'admin');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 0' }}>
      <Card
        style={{ borderColor: '#2e7d32', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ color: '#2e7d32' }}>Ajouter un administrateur</Title>
          <Text type="secondary">Remplissez les informations pour créer un compte admin</Text>
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
          <Form.Item label="Photo de profil">
            <Upload
              name="avatar"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleUpload}
              accept="image/*"
            >
              <Button
                icon={<UploadOutlined />}
                type="dashed"
                block
                style={{
                  borderColor: '#2e7d32',
                  color: '#2e7d32'
                }}
              >
                {avatar ? 'Changer l’image' : 'Ajouter une image'}
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="username"
            label="Nom d'utilisateur"
            rules={[
              { required: true, message: 'Veuillez saisir un nom d\'utilisateur' },
              { min: 3, message: 'Minimum 3 caractères' }
            ]}
          >
            <Input prefix={<UserOutlined />} size="large" placeholder="Nom d'utilisateur" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[
              { required: true, message: 'Veuillez saisir un mot de passe' },
              { min: 6, message: 'Minimum 6 caractères' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} size="large" placeholder="Mot de passe" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Nom complet"
            rules={[{ required: true, message: 'Veuillez saisir le nom complet' }]}
          >
            <Input size="large" placeholder="Nom complet" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Veuillez saisir l\'email' },
              { type: 'email', message: 'Email non valide' }
            ]}
          >
            <Input prefix={<MailOutlined />} size="large" placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="profession"
            label="Profession"
            rules={[{ required: true, message: 'Veuillez saisir la profession' }]}
          >
            <Input prefix={<EnvironmentOutlined />} size="large" placeholder="Profession" />
          </Form.Item>

          <Form.Item style={{ marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{
                backgroundColor: '#2e7d32',
                borderColor: '#2e7d32',
                height: 48,
                fontSize: 16,
                fontWeight: 500
              }}
            >
              Créer l’administrateur
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddAdminForm;
