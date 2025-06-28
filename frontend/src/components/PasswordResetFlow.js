import React, { useState } from "react";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

export default function PasswordResetFlow() {
  const [email, setEmail] = useState(null);
  const [resetDone, setResetDone] = useState(false);

  return (
    <div>
      {!email && !resetDone && (
        <ForgotPassword onCodeSent={(userEmail) => setEmail(userEmail)} />
      )}

      {email && !resetDone && (
        <ResetPassword
          email={email}
          onResetSuccess={() => setResetDone(true)}
        />
      )}

      {resetDone && (
        <div>
          <h2>Mot de passe réinitialisé avec succès !</h2>
          <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
        </div>
      )}
    </div>
  );
}
