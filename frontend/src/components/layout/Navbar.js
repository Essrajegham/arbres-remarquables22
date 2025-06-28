import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  BranchesOutlined,
  EnvironmentOutlined,
  LoginOutlined,
  UserAddOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserSwitchOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Dropdown, Menu, Avatar } from 'antd';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setMobileMenuVisible(!mobileMenuVisible);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
    setMobileMenuVisible(false);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Mon Profil</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Déconnexion',
      onClick: handleLogout,
    },
  ];

  const ajouterMenuItems = [
    {
      key: 'add-user',
      label: <Link to="/ajouter-utilisateur">Ajouter Utilisateur</Link>,
    },
    ...(user?.role === 'superadmin'
      ? [{
          key: 'add-admin',
          label: <Link to="/add-admin">Ajouter Admin</Link>,
        }]
      : []),
    {
      key: 'add-tree',
      label: <Link to="/add-tree">Ajouter Arbre</Link>,
    },
  ];

  const consulterMenuItems = [
    {
      key: 'list-users',
      label: <Link to="/users-list">Liste des Utilisateurs</Link>,
    },
    ...(user?.role === 'superadmin'
      ? [{
          key: 'list-admins',
          label: <Link to="/admins-list">Liste des Admins</Link>,
        }]
      : []),
  ];

  return (
    <div className={`navbar-container ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-logo-container">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-text">Sousse GreenMap</span>
        </Link>
      </div>

      <div className="navbar-links desktop-menu">
        <Link to="/" className="navbar-link">
          <HomeOutlined />
          <span>Accueil</span>
        </Link>

        {user && (
          <>
            <Link to="/trees" className="navbar-link">
              <BranchesOutlined />
              <span>Arbres</span>
            </Link>

            <Link to="/map" className="navbar-link">
              <EnvironmentOutlined />
              <span>Carte</span>
            </Link>

            {(user.role === 'admin' || user.role === 'superadmin') && (
              <>
                <Dropdown menu={{ items: ajouterMenuItems }} placement="bottom">
                  <div className="navbar-link">
                    <PlusOutlined />
                    <span>Ajouter</span>
                  </div>
                </Dropdown>

                <Dropdown menu={{ items: consulterMenuItems }} placement="bottom">
                  <div className="navbar-link">
                    <UnorderedListOutlined />
                    <span>Consulter</span>
                  </div>
                </Dropdown>
              </>
            )}
          </>
        )}
      </div>

      <div className="navbar-auth desktop-menu">
        {user ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <div className="navbar-user">
              <Avatar
                src={user.avatar}
                icon={!user.avatar && <UserOutlined />}
                style={{ backgroundColor: '#2e7d32' }}
              />
              <span className="navbar-username">{user.username}</span>
            </div>
          </Dropdown>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              <LoginOutlined />
              <span>Connexion</span>
            </Link>
            <Link to="/register" className="navbar-link">
              <UserAddOutlined />
              <span>Inscription</span>
            </Link>
          </>
        )}
      </div>

      <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
        <MenuOutlined />
      </div>

      {mobileMenuVisible && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-menu-item" onClick={toggleMobileMenu}>
            <HomeOutlined /> Accueil
          </Link>

          {user && (
            <>
              <Link to="/trees" className="mobile-menu-item" onClick={toggleMobileMenu}>
                <BranchesOutlined /> Arbres
              </Link>
              <Link to="/map" className="mobile-menu-item" onClick={toggleMobileMenu}>
                <EnvironmentOutlined /> Carte
              </Link>

              {(user.role === 'admin' || user.role === 'superadmin') && (
                <>
                  <div className="mobile-submenu-group">
                    <div className="mobile-submenu-title">
                      <PlusOutlined /> Ajouter
                    </div>
                    {ajouterMenuItems.map(item => (
                      <div key={item.key} className="mobile-menu-item" onClick={toggleMobileMenu}>
                        {item.label}
                      </div>
                    ))}
                  </div>

                  <div className="mobile-submenu-group">
                    <div className="mobile-submenu-title">
                      <UnorderedListOutlined /> Consulter
                    </div>
                    {consulterMenuItems.map(item => (
                      <div key={item.key} className="mobile-menu-item" onClick={toggleMobileMenu}>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {user ? (
            <>
              <Link to="/profile" className="mobile-menu-item" onClick={toggleMobileMenu}>
                <UserOutlined /> Profil
              </Link>
              <div className="mobile-menu-item logout" onClick={handleLogout}>
                <LogoutOutlined /> Déconnexion
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-menu-item" onClick={toggleMobileMenu}>
                <LoginOutlined /> Connexion
              </Link>
              <Link to="/register" className="mobile-menu-item" onClick={toggleMobileMenu}>
                <UserAddOutlined /> Inscription
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
