import React, { useState } from "react";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function PasswordResetFlow() {
  const [email, setEmail] = useState("");
  const [resetDone, setResetDone] = useState(false);
  const navigate = useNavigate();

  const handleResetSuccess = () => {
    setResetDone(true);
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      {!email && !resetDone && (
        <ForgotPassword onCodeSent={(email) => setEmail(email)} />
      )}

      {email && !resetDone && (
        <ResetPassword 
          email={email} 
          onResetSuccess={handleResetSuccess} 
        />
      )}

      {resetDone && (
        <Result
          status="success"
          title="Mot de passe réinitialisé avec succès !"
          subTitle="Vous pouvez maintenant vous connecter avec votre nouveau mot de passe."
          extra={[
            <Button 
              type="primary" 
              key="login"
              onClick={() => navigate("/login")}
            >
              Se connecter
            </Button>,
          ]}
        />
      )}
    </div>
  );
}