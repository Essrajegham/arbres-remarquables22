import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: values.email,
        password: values.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
      });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('username', user.name);
      localStorage.setItem('role', user.role);
      localStorage.setItem('avatar', user.avatar || '');

      message.success(`Bienvenue ${user.name} !`);
      onLogin(response.data);

      const redirectPath = ['superadmin', 'admin'].includes(user.role)
        ? '/admin/dashboard'
        : '/trees';
      navigate(redirectPath);

    } catch (error) {
      console.error('Erreur de connexion:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur de connexion';
      message.error(errorMessage);
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
          layout="vertical"
          autoComplete="off"
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Veuillez saisir votre email' },
              { type: 'email', message: 'Veuillez saisir un email valide' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="nom@exemple.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[
              { required: true, message: 'Veuillez saisir votre mot de passe' },
              { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large" disabled={loading}>
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
