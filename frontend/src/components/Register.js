import React, { useState } from 'react';
import { Form, Input, Button, message, Upload } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  EnvironmentOutlined,
  UploadOutlined 
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) message.error('Vous ne pouvez uploader que des fichiers image!');
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) message.error('La taille de l\'image ne doit pas dépasser 5MB!');
    return isImage && isLt5M;
  };

  const handleUpload = ({ file }) => {
    if (beforeUpload(file)) {
      setAvatar(file);
    }
    return false;
  };

  const onFinish = async (values) => {
    setLoading(true);
    const formData = new FormData();
    if (avatar) formData.append('avatar', avatar);
    Object.entries(values).forEach(([key, val]) => formData.append(key, val));

    try {
      await axios.post("http://localhost:5000/api/auth/register", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Inscription réussie !');
      form.resetFields();
      setAvatar(null);
      navigate('/login');
    } catch (err) {
      message.error(err.response?.data?.error || "Erreur lors de l'inscription");
    }
    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-card fade-in">
        <h1 className="register-title">Inscription</h1>
        <div className="avatar-upload-wrapper">
          <Upload
            name="avatar"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={handleUpload}
            accept="image/*"
          >
            {avatar ? (
              <img
                src={URL.createObjectURL(avatar)}
                alt="avatar"
                className="avatar-image"
              />
            ) : (
              <div className="upload-placeholder">
                <UploadOutlined style={{ fontSize: 28, color: 'var(--primary-color)' }} />
                <div style={{ marginTop: 8 }}>Uploader une photo</div>
              </div>
            )}
          </Upload>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            label="Nom d'utilisateur"
            rules={[
              { required: true, message: "Nom d'utilisateur requis" },
              { min: 3, message: "Minimum 3 caractères" }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nom d'utilisateur" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[{ required: true, message: "Mot de passe requis" }, { min: 6 }]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mot de passe" />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirmer le mot de passe"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: "Confirmation requise" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirmer" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Nom complet"
            rules={[{ required: true, message: "Nom complet requis" }]}
          >
            <Input placeholder="Nom complet" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email requis" },
              { type: 'email', message: "Email non valide" }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="profession"
            label="Profession"
            rules={[{ required: true, message: "Profession requise" }]}
          >
            <Input prefix={<EnvironmentOutlined />} placeholder="Profession" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="register-button"
              block
              size="large"
            >
              S'inscrire
            </Button>
          </Form.Item>

          <div className="register-login-link" style={{ textAlign: 'center' }}>
            Déjà un compte ? <Link to="/login">Connectez-vous</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;
