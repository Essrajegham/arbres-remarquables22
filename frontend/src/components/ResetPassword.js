import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { LockOutlined, SafetyOutlined } from '@ant-design/icons';
import "./ResetPassword.css";

export default function ResetPassword({ email, onResetSuccess }) {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          token: values.code, 
          newPassword: values.newPassword,
          email: email 
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la réinitialisation");
      }

      message.success("Mot de passe réinitialisé avec succès !");
      onResetSuccess();
    } catch (error) {
      message.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Réinitialisation du mot de passe</h2>
        <p>Un code a été envoyé à {email}</p>
        
        <Form
          name="reset_password"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="code"
            rules={[{ required: true, message: 'Veuillez entrer le code de vérification' }]}
          >
            <Input 
              prefix={<SafetyOutlined />} 
              placeholder="Code de vérification" 
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            rules={[{ 
              required: true, 
              message: 'Veuillez entrer votre nouveau mot de passe',
              min: 8,
              message: 'Le mot de passe doit contenir au moins 8 caractères'
            }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nouveau mot de passe"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              Réinitialiser le mot de passe
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}