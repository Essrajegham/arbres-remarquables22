import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Avatar, Button, Divider, Typography, Space } from 'antd';
import { UserOutlined, EditOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ProfilePage = ({ user }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérification des données utilisateur
    const checkUserData = () => {
      if (user) {
        setProfileData(user);
      } else {
        const storedUser = {
          id: localStorage.getItem('userId'),
          username: localStorage.getItem('username'),
          email: localStorage.getItem('email'),
          role: localStorage.getItem('role'),
          avatar: localStorage.getItem('avatar')
        };

        if (storedUser.id && storedUser.username) {
          setProfileData(storedUser);
        } else {
          navigate('/login');
        }
      }
      setLoading(false);
    };

    checkUserData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="profile-loading">
        <p>Chargement de votre profil...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-error">
        <p>Impossible de charger les données du profil</p>
        <Button type="primary" onClick={() => navigate('/login')}>
          Se connecter
        </Button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Card
        title={
          <Space>
            <Avatar 
              size={64} 
              src={profileData.avatar} 
              icon={<UserOutlined />}
            />
            <Title level={3}>{profileData.username}</Title>
          </Space>
        }
      >
        <Divider orientation="left">Informations personnelles</Divider>
        
        <div className="profile-info">
          <Space direction="vertical">
            <Text strong>
              <MailOutlined /> Email: {profileData.email || 'Non renseigné'}
            </Text>
            <Text strong>
              Rôle: {profileData.role}
            </Text>
          </Space>
        </div>

        <Divider />

        <Button 
          type="primary" 
          icon={<EditOutlined />}
          onClick={() => navigate('/profile/edit')}
        >
          Modifier le profil
        </Button>
      </Card>
    </div>
  );
};

export default ProfilePage;