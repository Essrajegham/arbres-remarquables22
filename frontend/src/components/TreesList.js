import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Typography, Input, Spin, Alert } from 'antd';
import { EnvironmentOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './TreesList.css';

const { Text } = Typography;

function TreesList() {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTrees = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/trees', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.data?.success) {
          throw new Error('Format de réponse invalide');
        }

        setTrees(Array.isArray(res.data.trees) ? res.data.trees : []);
      } catch (err) {
        setError('Erreur lors du chargement des arbres');
      } finally {
        setLoading(false);
      }
    };
    fetchTrees();
  }, []);

  const filteredTrees = trees.filter(tree =>
    (tree.name?.toLowerCase().includes(search.toLowerCase()) ||
    tree.species?.toLowerCase().includes(search.toLowerCase()) ||
    tree.address?.toLowerCase().includes(search.toLowerCase())) &&
    tree.location?.coordinates?.length === 2
  );

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '20px auto' }} />;
  }

  if (error) {
    return <Alert message={error} type="error" showIcon style={{ margin: 20 }} />;
  }

  return (
    <div className="trees-list-container">
      <div className="filters-container" style={{ marginBottom: 16 }}>
        <Input
          placeholder="Rechercher un arbre..."
          allowClear
          prefix={<SearchOutlined style={{ color: '#aaa' }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            maxWidth: 300,
            backgroundColor: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: 8,
            padding: '6px 12px',
            boxShadow: 'none',
            outline: 'none',
          }}
        />
      </div>

      {filteredTrees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <InfoCircleOutlined style={{ fontSize: 48, color: '#ccc' }} />
          <p style={{ marginTop: 16, fontSize: 16 }}>
            {trees.length === 0 ? 'Aucun arbre disponible' : 'Aucun arbre ne correspond à votre recherche'}
          </p>
        </div>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }}
          dataSource={filteredTrees}
          renderItem={tree => {
            const treeId = tree._id || tree.id;
            return (
              <List.Item key={treeId}>
                <Card
                  className="trees-card"
                  hoverable
                  title={
                    <Text strong style={{ fontSize: 16, color: '#1b5e20' }}>
                      {tree.name || 'Arbre sans nom'}
                    </Text>
                  }
                  style={{
                    borderRadius: 12,
                    border: '1px solid #e0e0e0',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <Tag color="#c8e6c9" style={{ color: '#1b5e20', fontWeight: 500 }}>
                      🌿 {tree.species || 'Espèce non spécifiée'}
                    </Tag>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Tag
                      icon={<EnvironmentOutlined />}
                      color="#e8f5e9"
                      style={{ color: '#1b5e20', fontWeight: 500 }}
                    >
                      {tree.address || 'Adresse inconnue'}
                    </Tag>
                  </div>
                  {tree.location?.coordinates && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      GPS : {tree.location.coordinates[1].toFixed(4)}, {tree.location.coordinates[0].toFixed(4)}
                    </Text>
                  )}

                  <Link to={`/trees/${treeId}`}>
                    <Button block className="details-button" style={{ marginTop: 12 }}>
                      Voir détails
                    </Button>
                  </Link>
                </Card>
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
}

export default TreesList;
