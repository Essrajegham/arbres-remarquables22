import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

// Configuration Axios globale
axios.defaults.withCredentials = true;

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", values, {

        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const { token, user } = response.data;
      
      // Stockage des informations utilisateur
      localStorage.setItem('token', token);
      localStorage.setItem('username', user.username);
      localStorage.setItem('role', user.role);
      localStorage.setItem('avatar', user.avatar || '');
      
      // Notification et redirection
      onLogin(response.data);
      message.success(`Bienvenue ${user.username} !`);

      // Redirection en fonction du rôle
      const redirectPath = ['superadmin', 'admin'].includes(user.role)
        ? '/admin/dashboard'
        : '/trees';
      navigate(redirectPath);

    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message 
        || 'Une erreur est survenue lors de la connexion';
      
      message.error(errorMessage);

      // Redirection pour réinitialisation du mot de passe si email non vérifié
      if (errorMessage.toLowerCase().includes('email') || error.response?.status === 403) {
        navigate('/forgot-password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Connexion</h1>
        
        <Form 
          name="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item 
            name="username" 
            label="Nom d'utilisateur ou Email"
            rules={[
              { 
                required: true, 
                message: "Veuillez saisir votre nom d'utilisateur ou email" 
              }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="site-form-item-icon" />} 
              placeholder="nom@exemple.com ou nom d'utilisateur" 
              size="large" 
            />
          </Form.Item>

          <Form.Item 
            name="password" 
            label="Mot de passe"
            rules={[
              { 
                required: true, 
                message: "Veuillez saisir votre mot de passe" 
              },
              {
                min: 6,
                message: "Le mot de passe doit contenir au moins 6 caractères"
              }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="site-form-item-icon" />} 
              placeholder="••••••" 
              size="large" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              size="large"
              disabled={loading}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </Form.Item>

          <div className="login-links">
            <Link to="/forgot-password">Mot de passe oublié ?</Link>
            <span className="link-separator">|</span>
            <Link to="/register">Créer un compte</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;