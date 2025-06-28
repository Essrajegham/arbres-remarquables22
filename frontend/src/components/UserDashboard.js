import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "antd";
import { LogoutOutlined } from '@ant-design/icons';
import "./UserDashboard.css"; // Créez ce fichier CSS

export default function UserDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="user-dashboard">
      <Card 
        title={<h2 className="dashboard-title">Dashboard Utilisateur</h2>}
        className="user-card"
      >
        <p>Bienvenue dans l'espace utilisateur de Sousse GreenMap.</p>
        
        <Button
          onClick={handleLogout}
          icon={<LogoutOutlined />}
          className="logout-btn"
        >
          Déconnexion
        </Button>
      </Card>
    </div>
  );
}