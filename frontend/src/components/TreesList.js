import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Tag,
  Button,
  Typography,
  Input,
  Spin,
  Alert,
  Space,
  Empty,
  Popconfirm,
  message,
} from 'antd';
import {
  EnvironmentOutlined,
  SearchOutlined,
  StarOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import './TreesList.css';

const { Text, Title } = Typography;
const { Meta } = Card;

function TreesList() {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser({
            id: payload.userId,
            role: payload.role
          });
        } catch (err) {
          console.error('Error parsing token:', err);
        }
      }
    };

    fetchUserData();
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/trees', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data?.success) {
        throw new Error('Format de réponse invalide');
      }

      setTrees(Array.isArray(res.data.trees) ? res.data.trees : []);
    } catch (err) {
      setError('Erreur lors du chargement des arbres: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (tree) => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || 
           currentUser.role === 'superadmin' || 
           tree.addedBy === currentUser.id;
  };

  const handleDelete = async (treeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/trees/${treeId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      message.success('Arbre supprimé avec succès');
      fetchTrees();
    } catch (err) {
      if (err.response?.status === 403) {
        message.error("Vous n'avez pas les permissions nécessaires");
      } else {
        message.error('Erreur lors de la suppression');
      }
      console.error(err);
    }
  };

  const handleEdit = (treeId) => {
    navigate(`/trees/edit/${treeId}`);
  };

  const filteredTrees = trees.filter(tree => {
    return (
      tree.name?.toLowerCase().includes(search.toLowerCase()) ||
      tree.species?.toLowerCase().includes(search.toLowerCase()) ||
      tree.address?.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert message="Erreur de chargement" description={error} type="error" showIcon closable />
      </div>
    );
  }

  return (
    <div className="trees-list-container">
      <div className="header-section">
        <Title level={2} className="main-title">
          <ApartmentOutlined /> Catalogue des Arbres Remarquables
        </Title>
        <Text type="secondary" className="subtitle">
          Découvrez notre collection d'arbres exceptionnels
        </Text>

        <div className="search-container">
          <Input
            placeholder="Rechercher par nom, espèce ou adresse..."
            allowClear
            size="large"
            prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredTrees.length === 0 ? (
        <Empty
          className="empty-state"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              {trees.length === 0
                ? 'Aucun arbre disponible dans la base de données'
                : 'Aucun arbre ne correspond à votre recherche'}
            </span>
          }
        >
          {trees.length === 0 && (
            <Button type="primary">Ajouter un arbre</Button>
          )}
        </Empty>
      ) : (
        <List
          className="trees-grid"
          grid={{
            gutter: 24,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 3,
            xxl: 4
          }}
          dataSource={filteredTrees}
          renderItem={tree => (
            <List.Item key={tree._id || tree.id} className="tree-list-item">
              <Card
                className="tree-card"
                hoverable
                cover={
                  <div className="card-image-container">
                    {tree.images?.length > 0 ? (
                      <img
                        src={`http://localhost:5000/${tree.images[0]}`}
                        alt={tree.name}
                        className="tree-card-image"
                      />
                    ) : (
                      <div className="tree-image-placeholder">
                        <ApartmentOutlined />
                      </div>
                    )}
                  </div>
                }
                actions={[
                  <Link to={`/trees/${tree._id || tree.id}`}>
                    <Button type="primary" icon={<SearchOutlined />} className="detail-btn">
                      Détails
                    </Button>
                  </Link>,
                  hasPermission(tree) && (
                    <Button 
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(tree._id || tree.id)}
                      className="edit-btn"
                    >
                      Modifier
                    </Button>
                  ),
                  hasPermission(tree) && (
                    <Popconfirm
                      title="Êtes-vous sûr de vouloir supprimer cet arbre?"
                      onConfirm={() => handleDelete(tree._id || tree.id)}
                    >
                      <Button danger icon={<DeleteOutlined />} className="delete-btn">
                        Supprimer
                      </Button>
                    </Popconfirm>
                  )
                ].filter(Boolean)}
              >
                <div className="tree-card-content">
                  <Meta
                    title={
                      <div className="tree-title">
                        <Text strong ellipsis={{ tooltip: tree.name }}>
                          {tree.name || 'Arbre sans nom'}
                        </Text>
                        {moment(tree.createdAt).isAfter(moment().subtract(7, 'days')) && (
                          <Tag color="red" className="new-tag">Nouveau</Tag>
                        )}
                      </div>
                    }
                    description={
                      <Space direction="vertical" size="small" className="meta-content">
                        <div className="tree-tags">
                          <Tag icon={<ApartmentOutlined />} color="green">
                            {tree.species || 'Espèce inconnue'}
                          </Tag>
                          {tree.isRemarkable && (
                            <Tag icon={<StarOutlined />} color="gold">
                              Remarquable
                            </Tag>
                          )}
                        </div>
                        <div className="tree-info">
                          <div className="code">
                             {tree.code || 'Localisation inconnue'}
                          </div>
                          <div className="location">
                            <EnvironmentOutlined /> {tree.greenSpace || 'Localisation inconnue'}
                          </div>
                          {tree.age && (
                            <div className="age">
                              <CalendarOutlined /> Âge: {tree.age} ans
                            </div>
                          )}
                        </div>
                      </Space>
                    }
                  />
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}

export default TreesList;