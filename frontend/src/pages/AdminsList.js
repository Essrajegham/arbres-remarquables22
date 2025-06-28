import React, { useEffect, useState } from 'react';
import { Table, Typography, Spin, message } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const AdminsList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/admins', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdmins(res.data);
      } catch (err) {
        message.error("Erreur lors du chargement des admins");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: '_id', key: '_id', width: 80 },
    { title: 'Nom d\'admin', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Rôle', dataIndex: 'role', key: 'role', render: role => role.charAt(0).toUpperCase() + role.slice(1) },
  ];

  if (loading) return <Spin size="large" />;

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>Liste des Admins</Title>
      <Table dataSource={admins} columns={columns} rowKey="_id" pagination={{ pageSize: 5 }} />
    </div>
  );
};

export default AdminsList;
