import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Avatar,
  Button,
  Divider,
  Typography,
  Space,
  Row,
  Col,
  Spin,
  Tag,
  Badge
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  CrownOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const ProfilePage = ({ user }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserData = () => {
      // Priorité à la prop user si elle existe et est valide
      if (user?.id) {
        setProfileData(user);
        setLoading(false);
        return;
      }

      // Sinon, vérifier le localStorage
      const storedUser = {
        id: localStorage.getItem('userId'),
        username: localStorage.getItem('username'),
        email: localStorage.getItem('userEmail'),
        role: localStorage.getItem('userRole'),
        avatar: localStorage.getItem('avatarUrl'),
      };

      console.log('Données du localStorage:', storedUser);

      if (storedUser.id && storedUser.username) {
        setProfileData({
          ...storedUser,
          email: storedUser.email || 'Non disponible',
          role: storedUser.role || 'Utilisateur',
        });
      } else {
        console.error('Données utilisateur insuffisantes');
        navigate('/login');
      }
      
      setLoading(false);
    };

    checkUserData();
  }, [user, navigate]);

  const renderRoleBadge = () => {
    if (!profileData?.role) return null;

    const role = profileData.role.toLowerCase();
    let icon, color, text;

    switch(role) {
      case 'superadmin':
        icon = <CrownOutlined />;
        color = 'gold';
        text = 'Super Admin';
        break;
      case 'admin':
        icon = <TeamOutlined />;
        color = 'volcano';
        text = 'Admin';
        break;
      default:
        return null;
    }

    return (
      <Badge.Ribbon 
        text={text} 
        color={color}
        placement="start"
        style={{ top: -16 }}
      >
        <div style={{ width: 0, height: 0 }} /> {/* Espaceur invisible */}
      </Badge.Ribbon>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20vh' }}>
        <Spin size="large" tip="Chargement du profil..." />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20vh' }}>
        <Text type="danger">Impossible de charger les données du profil</Text>
        <br />
        <Button type="primary" onClick={() => navigate('/login')} style={{ marginTop: 16 }}>
          Se connecter
        </Button>
      </div>
    );
  }

  return (
    <Row justify="center" style={{ marginTop: 40 }}>
      <Col xs={22} sm={18} md={12} lg={10}>
        <Card
          hoverable
          bordered={false}
          style={{
            borderRadius: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: 24,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24, position: 'relative' }}>
            {renderRoleBadge()}
            <Avatar
              size={96}
              src={profileData.avatar || null}
              icon={!profileData.avatar ? <UserOutlined /> : null}
              style={{ marginBottom: 12 }}
            />
            <Title level={3}>{profileData.username || 'Utilisateur'}</Title>
            {profileData.role && ['admin', 'superadmin'].includes(profileData.role.toLowerCase()) && (
              <Tag 
                icon={profileData.role.toLowerCase() === 'superadmin' ? <CrownOutlined /> : <TeamOutlined />}
                color={profileData.role.toLowerCase() === 'superadmin' ? 'gold' : 'volcano'}
                style={{ marginTop: 8 }}
              >
                {profileData.role}
              </Tag>
            )}
          </div>

          <Divider orientation="left">Informations personnelles</Divider>

          <Space direction="vertical" size="middle">
            <Text>
              <MailOutlined style={{ marginRight: 8 }} />
              <strong>Email :</strong> {profileData.email || 'Non renseigné'}
            </Text>
            <Text>
              <IdcardOutlined style={{ marginRight: 8 }} />
              <strong>Rôle :</strong> {profileData.role || 'Utilisateur'}
            </Text>
          </Space>

          <Divider />
        </Card>
      </Col>
    </Row>
  );
};

export default ProfilePage;