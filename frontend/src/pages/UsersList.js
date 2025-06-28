import React, { useEffect, useState } from 'react';
import { Table, Typography, Spin, message } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');  // Récupérer token
        const res = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        message.error("Erreur lors du chargement des utilisateurs");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: '_id', key: '_id', width: 80 },
    { title: 'Nom d\'utilisateur', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Rôle', dataIndex: 'role', key: 'role', render: role => role.charAt(0).toUpperCase() + role.slice(1) },
  ];

  if (loading) return <Spin size="large" />;

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>Liste des Utilisateurs</Title>
      <Table dataSource={users} columns={columns} rowKey="_id" pagination={{ pageSize: 5 }} />
    </div>
  );
};

export default UsersList;
