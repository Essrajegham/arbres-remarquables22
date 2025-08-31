import React, { useState, useEffect } from 'react';
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
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const validateFile = (file) => {
    const isImage = file.type.startsWith('image/');
    const isLt5M = file.size / 1024 / 1024 < 5;
    return { isImage, isLt5M };
  };

  const beforeUpload = (file) => {
    const { isImage, isLt5M } = validateFile(file);
    if (!isImage) {
      message.error('Vous ne pouvez uploader que des fichiers image!');
      return false;
    }
    if (!isLt5M) {
      message.error('La taille de l\'image ne doit pas dépasser 5MB!');
      return false;
    }
    return false; // Empêche l'upload automatique
  };

  const handleUpload = ({ file }) => {
    const { isImage, isLt5M } = validateFile(file);
    if (!isImage || !isLt5M) return false;

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    if (file instanceof Blob || file instanceof File) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      message.error('Erreur lors du traitement de l\'image');
    }
  };

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Utiliser les bons noms de champs côté backend :
      formData.append('username', values.username);
      formData.append('email', values.email);
      formData.append('password', values.password);
      formData.append('fullName', values.fullName);
      formData.append('profession', values.profession);

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await axios.post("http://localhost:5000/api/auth/register", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      message.success('Inscription réussie !');
      form.resetFields();
      setAvatarFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
      navigate('/login');
    } catch (error) {
      console.error('Erreur inscription:', error.response?.data || error);
      const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           "Erreur lors de l'inscription";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
            customRequest={({ onSuccess }) => onSuccess("ok")} // Empêche l'upload automatique
          >
            {avatarPreview ? (
              <div className="avatar-preview-container">
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="avatar-image"
                  onError={() => {
                    URL.revokeObjectURL(avatarPreview);
                    setAvatarPreview(null);
                  }}
                />
                <div className="avatar-edit-overlay">
                  <UploadOutlined />
                </div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <UploadOutlined style={{ fontSize: 28, color: 'var(--primary-color)' }} />
                <div style={{ marginTop: 8 }}>Ajouter une photo</div>
              </div>
            )}
          </Upload>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            label="Nom d'utilisateur"
            rules={[
              { required: true, message: "Ce champ est obligatoire" },
              { min: 3, message: "Minimum 3 caractères" },
              { max: 20, message: "Maximum 20 caractères" }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Votre nom d'utilisateur" 
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Adresse email"
            rules={[
              { required: true, message: "Ce champ est obligatoire" },
              { type: 'email', message: "Email non valide" }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Votre email" 
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[
              { required: true, message: "Ce champ est obligatoire" },
              { min: 6, message: "Minimum 6 caractères" }
            ]}
            hasFeedback
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Votre mot de passe" 
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirmer le mot de passe"
            dependencies={['password']}
            rules={[
              { required: true, message: "Ce champ est obligatoire" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Confirmez votre mot de passe" 
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Nom complet"
            rules={[
              { required: true, message: "Ce champ est obligatoire" },
              { min: 2, message: "Minimum 2 caractères" }
            ]}
          >
            <Input 
              placeholder="Votre nom complet" 
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="profession"
            label="Profession"
            rules={[
              { required: true, message: "Ce champ est obligatoire" }
            ]}
          >
            <Input 
              prefix={<EnvironmentOutlined />} 
              placeholder="Votre profession" 
              disabled={loading}
            />
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
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </Button>
          </Form.Item>

          <div className="register-footer">
            <span>Déjà un compte ? </span>
            <Link to="/login" className="login-link">
              Se connecter
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;
