import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { MailOutlined } from '@ant-design/icons';

export default function ForgotPassword({ onCodeSent }) {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/request-password-reset", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email: values.email }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi du code");
      }

      message.success("Un code de réinitialisation a été envoyé à votre email");
      onCodeSent(values.email);
    } catch (error) {
      message.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="forgot_password"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      autoComplete="off"
      layout="vertical"
    >
      <Form.Item
        name="email"
        rules={[
          { 
            required: true, 
            message: 'Veuillez entrer votre email' 
          },
          { 
            type: 'email',
            message: 'Email non valide'
          }
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
          block
        >
          Envoyer le code de réinitialisation
        </Button>
      </Form.Item>
    </Form>
  );
}