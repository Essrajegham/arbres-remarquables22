import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ allowedRoles = [], children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Si pas connecté, redirige vers login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Superadmin a toujours accès
  if (role === "superadmin") {
    return children;
  }

  // Si la route nécessite des rôles et que le rôle de l'utilisateur n'en fait pas partie
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />; // tu peux créer cette page
  }

  return children;
}
