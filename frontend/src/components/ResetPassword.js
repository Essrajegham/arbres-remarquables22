import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { LockOutlined, SafetyOutlined } from '@ant-design/icons';
import "./ResetPassword.css"; // Créez ce fichier CSS

export default function ResetPassword({ email, onResetSuccess }) {
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ code, newPassword }) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        message.success("Mot de passe réinitialisé avec succès !");
        onResetSuccess();
      } else {
        message.error(data.error || "Erreur lors de la réinitialisation.");
      }
    } catch (err) {
      message.error("Erreur réseau : " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2 className="reset-title">Réinitialisation du mot de passe</h2>
        
        <Form
          name="reset-password"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="code"
            rules={[{ required: true, message: 'Veuillez saisir le code' }]}
          >
            <Input 
              prefix={<SafetyOutlined />} 
              placeholder="Code reçu par email" 
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            rules={[{ required: true, message: 'Veuillez saisir le nouveau mot de passe' }]}
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
              className="reset-button"
            >
              Réinitialiser
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}