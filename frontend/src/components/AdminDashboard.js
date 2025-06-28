import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Modal, message, Avatar } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  PlusOutlined,
  UserAddOutlined,
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    if (userRole === 'superadmin' || userRole === 'admin') {
      fetchUsers();
    }
    fetchTrees();
  }, [userRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      message.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/trees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrees(res.data);
    } catch (err) {
      message.error('Erreur lors du chargement des arbres');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleDeleteUser = async (userId) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/auth/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success('Utilisateur supprimé avec succès');
          fetchUsers();
        } catch (err) {
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const handleDeleteTree = async (treeId) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cet arbre ?',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/trees/${treeId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success('Arbre supprimé avec succès');
          fetchTrees();
        } catch (err) {
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const userColumns = [
    {
      title: 'Nom',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {record.avatar ? (
            <img
              src={`http://localhost:5000/${record.avatar}`}
              alt={record.fullName}
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            />
          ) : (
            <Avatar icon={<UserOutlined />} />
          )}
          <span>{text}</span>
        </div>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <span
          style={{
            color:
              role === 'superadmin'
                ? '#f5222d'
                : role === 'admin'
                ? '#1890ff'
                : '#52c41a',
            fontWeight: 500
          }}
        >
          {role}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/edit-user/${record._id}`)}
            disabled={record.role === 'superadmin'}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteUser(record._id)}
            disabled={record.role === 'superadmin'}
          />
        </div>
      )
    }
  ];

  const treeColumns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {record.images?.[0] && (
            <img
              src={`http://localhost:5000/${record.images[0]}`}
              alt={text}
              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
            />
          )}
          <span>{text}</span>
        </div>
      )
    },
    {
      title: 'Espèce',
      dataIndex: 'species',
      key: 'species'
    },
    {
      title: 'Localisation',
      dataIndex: 'address',
      key: 'address'
    },
    {
      title: 'Statut',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (verified) => (
        <span
          style={{
            color: verified ? '#52c41a' : '#faad14',
            fontWeight: 500
          }}
        >
          {verified ? 'Vérifié' : 'En attente'}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/edit-tree/${record._id}`)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteTree(record._id)}
          />
        </div>
      )
    }
  ];

  return (
    <div className="admin-dashboard">
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>
              {userRole === 'superadmin' ? 'Tableau de bord Super Admin' : 'Tableau de bord Admin'}
            </h2>
            <Button icon={<LogoutOutlined />} onClick={handleLogout} className="logout-btn">
              Déconnexion
            </Button>
          </div>
        }
        className="dashboard-card"
        tabList={[
          { key: 'users', tab: 'Utilisateurs' },
          { key: 'trees', tab: 'Arbres' }
        ]}
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
        extra={[
          // Bouton Ajouter Admin pour superadmin
          userRole === 'superadmin' && activeTab === 'users' && (
            <Button
              key="add-admin"
              icon={<UserAddOutlined />}
              onClick={() => navigate('/add-admin')}
              className="add-btn"
            >
              Ajouter Admin
            </Button>
          ),
          // Bouton Ajouter Utilisateur simple pour superadmin et admin
          (['superadmin', 'admin'].includes(userRole) && activeTab === 'users') && (
            <Button
              key="add-user"
              icon={<UserAddOutlined />}
              onClick={() => navigate('/ajouter-utilisateur')}
              className="add-btn"
            >
              Ajouter Utilisateur
            </Button>
          ),
          // Bouton Ajouter Arbre
          (['superadmin', 'admin'].includes(userRole) && activeTab === 'trees') && (
            <Button
              key="add-tree"
              icon={<PlusOutlined />}
              onClick={() => navigate('/add-tree')}
              className="add-btn"
            >
              Ajouter Arbre
            </Button>
          )
        ]}
      >
        {activeTab === 'users' ? (
          <Table
            columns={userColumns}
            dataSource={users}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'Aucun utilisateur trouvé' }}
          />
        ) : (
          <Table
            columns={treeColumns}
            dataSource={trees}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'Aucun arbre trouvé' }}
          />
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
