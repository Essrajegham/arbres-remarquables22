import React from 'react';
import './Footer.css';
import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined
} from '@ant-design/icons';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-section">
          <h3 className="footer-title">Sousse GreenMap</h3>
          <p>Valorisation des arbres remarquables de la ville de Sousse</p>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Contact</h3>
          <p><EnvironmentOutlined /> Avenue Habib Bourguiba, Sousse</p>
          <p><MailOutlined /> contact@soussegreenmap.com</p>
          <p><PhoneOutlined /> +216 73 000 000</p>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Liens rapides</h3>
          <a href="/trees">Liste des arbres</a>
          <a href="/about">À propos</a>
          <a href="/contact">Contactez-nous</a>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Suivez-nous</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FacebookOutlined /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><TwitterOutlined /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><InstagramOutlined /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><LinkedinOutlined /></a>
          </div>
        </div>
        
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Sousse GreenMap - Tous droits réservés</p>
        <div className="footer-links">
          <a href="/privacy">Confidentialité</a>
          <a href="/terms">Conditions d'utilisation</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
