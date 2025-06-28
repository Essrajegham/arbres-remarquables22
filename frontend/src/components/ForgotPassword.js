import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { MailOutlined } from '@ant-design/icons';
import "./ForgotPassword.css"; // Créez ce fichier CSS

export default function ForgotPassword({ onCodeSent }) {
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ email }) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        message.success("Code envoyé par email");
        onCodeSent(email);
      } else {
        message.error(data.error || "Erreur lors de l'envoi du code");
      }
    } catch (err) {
      message.error("Erreur réseau : " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2 className="forgot-title">Mot de passe oublié</h2>
        
        <Form
          name="forgot-password"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Veuillez saisir votre email' },
              { type: 'email', message: 'Email non valide' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Votre email" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="forgot-button"
            >
              Envoyer le code
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}