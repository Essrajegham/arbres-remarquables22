import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  message,
  Card,
  Collapse,
  Rate,
  Descriptions,
  Form,
  Button,
  Spin,
  Alert,
  Layout,
  Row,
  Col,
  Typography,
  Space,
  List,
  Avatar,
  Divider,
  Input,
  Tabs
} from 'antd';
import {
  EnvironmentOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined,
  ClusterOutlined,
  MessageOutlined,
  StarOutlined,
  UserOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './TreeMapPage.css';

// Configuration des constantes
const API_CONFIG = {
  baseURL: 'http://localhost:5000/api',
  endpoints: {
    trees: '/trees',
    comments: '/avis'
  }
};

const RATING_QUESTIONS = [
  { 
    key: 'question1', 
    label: "1. Qualité de l'air autour de cet arbre",
    apiKey: 'airQuality'
  },
  { 
    key: 'question2', 
    label: "2. Propreté des environs immédiats",
    apiKey: 'cleanliness'
  },
  { 
    key: 'question3', 
    label: "3. Niveau de bruit ambiant",
    apiKey: 'noiseLevel'
  },
  { 
    key: 'question4', 
    label: "4. Facilité d'accès à cet arbre",
    apiKey: 'accessibility'
  },
  { 
    key: 'question5', 
    label: "5. État général de l'arbre",
    apiKey: 'treeCondition'
  },
  {
  key: 'question6',
  label: "6. Santé de l'arbre",
  apiKey: 'treeHealth'
}

];

// Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// Couleurs thématiques vertes
const COLORS = {
  primary: '#2E7D32',         // Vert foncé
  primaryLight: '#4CAF50',     // Vert moyen
  primaryLighter: '#81C784',   // Vert clair
  secondary: '#8BC34A',        // Vert secondaire
  accent: '#CDDC39',           // Vert-jaune accent
  textDark: '#263238',         // Texte foncé
  textMedium: '#455A64',       // Texte moyen
  textLight: '#ECEFF1',        // Texte clair
  background: '#F5F5F5',       // Arrière-plan
  cardBackground: '#FFFFFF',   // Fond des cartes
  divider: '#BDBDBD',          // Couleur des séparateurs
  rating: '#FFA000',           // Couleur des évaluations
  comment: '#5E35B1',          // Couleur des commentaires
  mapIcon: '#1B5E20'          // Couleur des icônes de carte
};

const { Text, Title } = Typography;
const { Content, Footer } = Layout;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const treeGreenIcon = new L.Icon({
  iconUrl: '/tree-icon.png',
  iconSize: [25, 25],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  className: 'tree-marker-icon'
});

const FlyToLocation = React.memo(({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position && map.getCenter().distanceTo(position) > 100) {
      map.flyTo(position, map.getZoom(), {
        duration: 1
      });
    }
  }, [position, map]);

  return null;
});

const MapTypeSelector = ({ mapType, onChange }) => {
  return (
    <div className="map-type-selector">
      <Button 
        type={mapType === 'street' ? 'primary' : 'default'} 
        onClick={() => onChange('street')}
        className="map-type-btn"
        style={{ 
          marginRight: 8,
          backgroundColor: mapType === 'street' ? COLORS.primary : '#fff',
          borderColor: mapType === 'street' ? COLORS.primary : COLORS.divider
        }}
      >
        OpenStreetMap
      </Button>
      <Button 
        type={mapType === 'satellite' ? 'primary' : 'default'} 
        onClick={() => onChange('satellite')}
        className="map-type-btn"
        style={{ 
          backgroundColor: mapType === 'satellite' ? COLORS.primary : '#fff',
          borderColor: mapType === 'satellite' ? COLORS.primary : COLORS.divider
        }}
      >
        Satellite
      </Button>
    </div>
  );
};

const RatingSummary = ({ comments = [] }) => {
  const calculateAverageRatings = (comments) => {
    const initialAverages = {
      airQuality: 0,
      cleanliness: 0,
      noiseLevel: 0,
      accessibility: 0,
      treeCondition: 0,
      treeHealth: 0,
      count: 0
    };

    if (!Array.isArray(comments)) return initialAverages;

    const sums = comments.reduce((acc, comment) => {
      if (comment?.ratings) {
        acc.airQuality += comment.ratings.airQuality || 0;
        acc.cleanliness += comment.ratings.cleanliness || 0;
        acc.noiseLevel += comment.ratings.noiseLevel || 0;
        acc.accessibility += comment.ratings.accessibility || 0;
        acc.treeCondition += comment.ratings.treeCondition || 0;
        acc.treeHealth += comment.ratings.treeHealth || 0;
        acc.count += 1;
      }
      return acc;
    }, {...initialAverages});

    return {
      airQuality: sums.count > 0 ? sums.airQuality / sums.count : 0,
      cleanliness: sums.count > 0 ? sums.cleanliness / sums.count : 0,
      noiseLevel: sums.count > 0 ? sums.noiseLevel / sums.count : 0,
      accessibility: sums.count > 0 ? sums.accessibility / sums.count : 0,
      treeCondition: sums.count > 0 ? sums.treeCondition / sums.count : 0,
      treeHealth: sums.count > 0 ? sums.treeHealth / sums.count : 0,
      count: sums.count
    };
  };

  const averages = calculateAverageRatings(comments);
  
  const ratingItems = [
    { label: "Qualité de l'air", value: averages.airQuality, key: 'airQuality' },
    { label: "Propreté des environs", value: averages.cleanliness, key: 'cleanliness' },
    { label: "Niveau de bruit", value: averages.noiseLevel, key: 'noiseLevel' },
    { label: "Accessibilité", value: averages.accessibility, key: 'accessibility' },
    { label: "État de l'arbre", value: averages.treeCondition, key: 'treeCondition' },
    { label: "Santé de l'arbre", value: averages.treeHealth, key: 'treeHealth' },

  ];

  return (
    <div className="ratings-summary">
      <Divider orientation="left" style={{ color: COLORS.textMedium }}>Avis des utilisateurs ({averages.count})</Divider>
      
      {ratingItems.map(item => (
        <div key={item.key} className="rating-item">
          <div className="rating-label">{item.label}</div>
          <div className="rating-bar-container">
            <div 
              className="rating-bar" 
              style={{ width: `${(item.value / 5) * 100}%` }}
            />
          </div>
          <div className="rating-value">
            {item.value.toFixed(1)}
          </div>
        </div>
      ))}
    </div>
  );
};

const TreeMapPage = () => {
  const [trees, setTrees] = useState([]);
  const [selectedTree, setSelectedTree] = useState(null);
  const [mapCenter, setMapCenter] = useState([35.8254, 10.6369]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState({
    question1: 1,
    question2: 1,
    question3: 1,
    question4: 1,
    question5: 1,
    question6: 1,
  });
  const [comments, setComments] = useState([]);
  const [form] = Form.useForm();
  const [commentForm] = Form.useForm();
  const mapRef = useRef();
  const [activeTab, setActiveTab] = useState('comments');
  const [submitting, setSubmitting] = useState(false);
  const [mapType, setMapType] = useState('street');
  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  });

  const getAuthHeader = useCallback(() => ({
    headers: { 
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  }), []);

  const fetchTrees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.trees}`,
        getAuthHeader()
      );

      const processTreeData = (data) => {
        if (!data) return [];
        
        let treesData = [];
        if (Array.isArray(data)) {
          treesData = data;
        } else if (data?.trees && Array.isArray(data.trees)) {
          treesData = data.trees;
        } else if (data?.data && Array.isArray(data.data)) {
          treesData = data.data;
        }

        return treesData
          .filter(tree => tree?.location?.coordinates?.length === 2)
          .map((tree, index) => ({
            ...tree,
            id: tree.id || `tree-${index}-${Date.now()}`,
            latLng: [tree.location.coordinates[1], tree.location.coordinates[0]]
          }));
      };

      const processedTrees = processTreeData(res.data);
      setTrees(processedTrees);
    } catch (err) {
      console.error('Erreur fetchTrees:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des arbres');
      message.error('Impossible de charger les données des arbres');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  const fetchComments = useCallback(async (treeId) => {
    if (!treeId) return;
    
    try {
      setCommentsLoading(true);
      const res = await axios.get(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.comments}/${treeId}`,
        getAuthHeader()
      );
      
      const commentsData = res.data?.data || [];
      const validComments = Array.isArray(commentsData) ? commentsData : [];
      setComments(validComments);
    } catch (err) {
      console.error('Erreur lors du chargement des commentaires:', err);
      message.error(err.response?.data?.error || 'Impossible de charger les commentaires');
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchTrees();
  }, [fetchTrees]);

  useEffect(() => {
    if (selectedTree?.id) {
      fetchComments(selectedTree.id);
    }
  }, [selectedTree, fetchComments]);

  const handleRatingChange = (questionKey, value) => {
    setRatings(prev => ({ ...prev, [questionKey]: value }));
  };

  const handleSubmitRating = async () => {
    if (!selectedTree?.id) {
      message.error("Aucun arbre sélectionné");
      return;
    }

    try {
      setSubmitting(true);

      const ratingsPayload = RATING_QUESTIONS.reduce((acc, question) => {
        acc[question.apiKey] = Math.max(1, ratings[question.key]);
        return acc;
      }, {});

      const response = await axios.post(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.comments}`,
        {
          tree: selectedTree.id,
          ratings: ratingsPayload
        },
        getAuthHeader()
      );

      if (response.data?.success) {
        message.success('Évaluation enregistrée avec succès !');
        fetchComments(selectedTree.id);
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error(
        error.response?.data?.error || 
        error.message || 
        "Erreur lors de l'envoi de l'évaluation"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitComment = async (values) => {
    if (!values.comment?.trim()) {
      message.error('Le commentaire ne peut pas être vide');
      return;
    }

    if (!selectedTree?.id) {
      message.error("Aucun arbre sélectionné");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        tree: selectedTree.id,
        comment: values.comment.trim(),
      };

      const response = await axios.post(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.comments}`,
        payload,
        getAuthHeader()
      );

      if (response.data?.success) {
        message.success('Commentaire publié avec succès !');
        commentForm.resetFields();
        fetchComments(selectedTree.id);
      }
    } catch (error) {
      console.error('Erreur:', error.response?.data || error.message);
      if (error.response?.data?.error?.includes('ratings')) {
        try {
          const retryPayload = {
            tree: selectedTree.id,
            comment: values.comment.trim(),
            ratings: {
              airQuality: 1,
              cleanliness: 1,
              noiseLevel: 1,
              accessibility: 1,
              treeCondition: 1
            }
          };
          
          const retryResponse = await axios.post(
            `${API_CONFIG.baseURL}${API_CONFIG.endpoints.comments}`,
            retryPayload,
            getAuthHeader()
          );
          
          if (retryResponse.data?.success) {
            message.success('Commentaire publié avec succès !');
            commentForm.resetFields();
            fetchComments(selectedTree.id);
          }
        } catch (retryError) {
          message.error(retryError.response?.data?.error || "Erreur lors de la publication");
        }
      } else {
        message.error(error.response?.data?.error || "Erreur lors de la publication du commentaire");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Chargement des arbres..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert message="Erreur" description={error} type="error" showIcon />
        <Button
          type="primary"
          onClick={fetchTrees}
          style={{ marginTop: '20px', backgroundColor: COLORS.primary }}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <Layout className="tree-map-layout" style={{ background: COLORS.background }}>
      <Content style={{ padding: '24px' }}>
        <Row gutter={[24, 24]} style={{ minHeight: 'calc(100vh - 274px)' }}>
          <Col xs={24} md={16}>
            <Card
              title={
                <Space>
                  <EnvironmentOutlined style={{ color: COLORS.primary }} />
                  <Title level={4} style={{ margin: 0, color: COLORS.primary }}>Carte des arbres</Title>
                </Space>
              }
              bordered={false}
              className="map-card"
              headStyle={{ 
                borderBottom: `2px solid ${COLORS.primaryLight}`,
                background: COLORS.cardBackground
              }}
              bodyStyle={{ padding: 0, position: 'relative' }}
            >
              <div className="map-container">
                <MapTypeSelector mapType={mapType} onChange={setMapType} />
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  className="leaflet-container"
                  ref={mapRef}
                  minZoom={12}
                  maxBounds={[
                    [35.5, 10.3],
                    [36.0, 11.0],
                  ]}
                  whenCreated={(map) => {
                    mapRef.current = map;
                  }}
                >
                  {mapType === 'street' ? (
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                  ) : (
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    />
                  )}
                  <FlyToLocation position={mapCenter} />
                  {Array.isArray(trees) && trees.map(tree => (
                    <Marker
                      key={tree.id}
                      position={tree.latLng}
                      icon={treeGreenIcon}
                      eventHandlers={{
                        click: () => {
                          setSelectedTree(tree);
                          setMapCenter(tree.latLng);
                        },
                      }}
                    >
                      <Popup className="tree-popup">
                        <Space direction="vertical">
                          <Text strong style={{ fontSize: '16px', color: COLORS.textDark }}>
                            {tree.name || 'Arbre sans nom'}
                          </Text>
                          <Text type="secondary" style={{ color: COLORS.textMedium }}>
                            {tree.species || 'Non spécifiée'}
                          </Text>
                          <Button 
                            type="link" 
                            size="small" 
                            icon={<InfoCircleOutlined />}
                            onClick={() => {
                              setSelectedTree(tree);
                              setMapCenter(tree.latLng);
                            }}
                            style={{ color: COLORS.primary }}
                          >
                            Plus de détails
                          </Button>
                        </Space>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Space direction="vertical" size="middle" className="right-column" style={{ width: '100%' }}>
              <Card
                title={
                  <Space>
                    <InfoCircleOutlined style={{ color: COLORS.primary }} />
                    <Title level={4} style={{ margin: 0, color: COLORS.primary }}>Détails de l'arbre</Title>
                  </Space>
                }
                bordered={false}
                className="details-card"
                headStyle={{ 
                  borderBottom: `2px solid ${COLORS.primaryLight}`,
                  background: COLORS.cardBackground
                }}
              >
                {selectedTree ? (
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Code" labelStyle={{ fontWeight: 'bold', color: COLORS.textDark }}>
                      <Text style={{ color: COLORS.textMedium }}>{selectedTree.code || 'Non spécifié'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Nom" labelStyle={{ fontWeight: 'bold', color: COLORS.textDark }}>
                      <Text style={{ color: COLORS.textMedium }}>{selectedTree.name || 'Non spécifié'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Espèce" labelStyle={{ fontWeight: 'bold', color: COLORS.textDark }}>
                      <Text style={{ color: COLORS.textMedium }}>{selectedTree.species || 'Non spécifiée'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Genre" labelStyle={{ fontWeight: 'bold', color: COLORS.textDark }}>
                      <Text style={{ color: COLORS.textMedium }}>{selectedTree.genus || 'Non spécifiée'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Espace vert" labelStyle={{ fontWeight: 'bold', color: COLORS.textDark }}>
                      <Text style={{ color: COLORS.textMedium }}>{selectedTree.greenSpace || 'Non spécifiée'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Age" labelStyle={{ fontWeight: 'bold', color: COLORS.textDark }}>
                      <Text style={{ color: COLORS.textMedium }}>{selectedTree.age || 'Non spécifiée'}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <EnvironmentOutlined style={{ fontSize: '32px', color: COLORS.divider }} />
                    <Text type="secondary" style={{ display: 'block', marginTop: '8px', color: COLORS.textMedium }}>
                      Sélectionnez un arbre sur la carte pour voir ses détails
                    </Text>
                  </div>
                )}
              </Card>

              <Card
                title={
                  <Space>
                    <ClusterOutlined style={{ color: COLORS.primary }} />
                    <Title level={4} style={{ margin: 0, color: COLORS.primary }}>Donner votre avis</Title>
                  </Space>
                }
                bordered={false}
                className="questionnaire-card"
                headStyle={{ 
                  borderBottom: `2px solid ${COLORS.primaryLight}`,
                  background: COLORS.cardBackground
                }}
              >
                {selectedTree ? (
                  <div className="questionnaire-content">
                    <Tabs 
                      activeKey={activeTab}
                      onChange={setActiveTab}
                      centered
                      animated
                      tabBarStyle={{ marginBottom: '16px' }}
                    >
                      <TabPane 
                        tab={
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <StarOutlined style={{ marginRight: '8px', color: COLORS.rating }} />
                            <span style={{ color: COLORS.textDark }}>Évaluation</span>
                          </span>
                        } 
                        key="ratings"
                      >
                        <Form layout="vertical" size="small">
                          {RATING_QUESTIONS.map(question => (
                            <Form.Item 
                              key={question.key} 
                              label={<Text strong style={{ color: COLORS.textDark }}>{question.label}</Text>}
                              style={{ marginBottom: '16px' }}
                            >
                              <Rate 
                                value={ratings[question.key]} 
                                onChange={v => handleRatingChange(question.key, v)} 
                                style={{ color: COLORS.rating }}
                              />
                            </Form.Item>
                          ))}
                          <Form.Item>
                            <Button
                              type="primary"
                              onClick={handleSubmitRating}
                              loading={submitting}
                              block
                              size="large"
                              style={{ 
                                backgroundColor: COLORS.primary,
                                borderColor: COLORS.primary
                              }}
                            >
                              Envoyer l'évaluation
                            </Button>
                          </Form.Item>
                        </Form>
                      </TabPane>
                      <TabPane 
                        tab={
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <MessageOutlined style={{ marginRight: '8px', color: COLORS.comment }} />
                            <span style={{ color: COLORS.textDark }}>Commentaire</span>
                          </span>
                        } 
                        key="comments"
                      >
                        <Form layout="vertical" form={commentForm} onFinish={handleSubmitComment}>
                          <Form.Item
                            name="comment"
                            rules={[
                              { required: true, message: 'Veuillez saisir un commentaire' },
                              { max: 500, message: 'Le commentaire ne doit pas dépasser 500 caractères' }
                            ]}
                          >
                            <Input.TextArea 
                              rows={4} 
                              placeholder="Partagez votre expérience avec cet arbre..." 
                              showCount 
                              maxLength={500}
                              style={{ borderRadius: '8px' }}
                            />
                          </Form.Item>
                          <Form.Item>
                            <Button 
                              type="primary" 
                              htmlType="submit"
                              loading={submitting}
                              block
                              size="large"
                              style={{ 
                                backgroundColor: COLORS.primary,
                                borderColor: COLORS.primary
                              }}
                            >
                              Publier le commentaire
                            </Button>
                          </Form.Item>
                        </Form>
                      </TabPane>
                    </Tabs>
                    
                    <RatingSummary comments={comments} />
                  </div>
                ) : (
                  <div className="no-tree-selected" style={{ textAlign: 'center', padding: '20px' }}>
                    <ClusterOutlined style={{ fontSize: '32px', color: COLORS.divider }} />
                    <Text type="secondary" style={{ display: 'block', marginTop: '8px', color: COLORS.textMedium }}>
                      Sélectionnez un arbre pour donner votre avis
                    </Text>
                  </div>
                )}
              </Card>
            </Space>
          </Col>
        </Row>
      </Content>

      <Footer className="tree-list-footer" style={{ background: COLORS.cardBackground, padding: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card
              title={
                <Space>
                  <UnorderedListOutlined style={{ color: COLORS.primary }} />
                  <Title level={4} style={{ margin: 0, color: COLORS.primary }}>Liste complète des arbres</Title>
                </Space>
              }
              bordered={false}
              className="tree-list-card"
              headStyle={{ 
                borderBottom: `2px solid ${COLORS.primaryLight}`,
                background: COLORS.cardBackground
              }}
              bodyStyle={{ padding: '0' }}
            >
              <Collapse accordion ghost expandIconPosition="right">
                {Array.isArray(trees) && trees.map(tree => (
                  <Panel
                    key={tree.id}
                    header={
                      <Space>
                        <Text strong style={{ fontSize: '16px', color: COLORS.textDark }}>
                          {tree.name || 'Arbre sans nom'}
                        </Text>
                        <Text type="secondary" style={{ color: COLORS.textMedium }}>
                          {tree.species || 'Non spécifiée'}
                        </Text>
                      </Space>
                    }
                    extra={
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<EnvironmentOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTree(tree);
                          setMapCenter(tree.latLng);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        style={{ color: COLORS.primary }}
                      >
                        Voir sur la carte
                      </Button>
                    }
                    style={{ 
                      borderBottom: `1px solid ${COLORS.divider}`,
                      padding: '12px 16px',
                      background: COLORS.cardBackground
                    }}
                  >
                    <Space direction="vertical" size="small" style={{ padding: '8px 0' }}>
                      <Text style={{ color: COLORS.textDark }}>
                        <Text strong>Adresse: </Text>
                        {tree.address || 'Non spécifiée'}
                      </Text>
                      <Text style={{ color: COLORS.textDark }}>
                        <Text strong>Coordonnées: </Text>
                        <Text code style={{ color: COLORS.primary }}>
                          {tree.latLng[0].toFixed(6)}, {tree.latLng[1].toFixed(6)}
                        </Text>
                      </Text>
                    </Space>
                  </Panel>
                ))}
              </Collapse>
            </Card>
          </Col>
          
          {selectedTree && (
            <Col span={24}>
              <Card
                title={
                  <Space>
                    <MessageOutlined style={{ color: COLORS.primary }} />
                    <Title level={4} style={{ margin: 0, color: COLORS.primary }}>Commentaires</Title>
                  </Space>
                }
                bordered={false}
                className="comments-card"
                headStyle={{ 
                  borderBottom: `2px solid ${COLORS.primaryLight}`,
                  background: COLORS.cardBackground
                }}
              >
                <div className="comments-section">
                  {commentsLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Spin tip="Chargement des commentaires..." />
                    </div>
                  ) : (
                    <>
                      {Array.isArray(comments) && comments.length > 0 ? (
                        <List
                          itemLayout="horizontal"
                          dataSource={comments}
                          renderItem={comment => (
                            <List.Item
                              style={{ 
                                padding: '16px',
                                borderBottom: `1px solid ${COLORS.divider}`,
                                transition: 'background-color 0.3s',
                                ':hover': {
                                  backgroundColor: '#fafafa'
                                }
                              }}
                            >
                              <List.Item.Meta
                                avatar={
                                  <Avatar 
                                    src={comment.user?.avatar} 
                                    icon={<UserOutlined />}
                                    style={{ backgroundColor: COLORS.primaryLight }}
                                  />
                                }
                                title={<Text strong style={{ color: COLORS.textDark }}>{comment.user?.username || 'Anonyme'}</Text>}
                                description={
                                  <>
                                    {comment.comment && (
                                      <Text style={{ 
                                        margin: '8px 0', 
                                        fontSize: '15px',
                                        lineHeight: '1.6',
                                        color: COLORS.textMedium
                                      }}>
                                        {comment.comment}
                                      </Text>
                                    )}
                                    {comment.ratings && (
                                      <div style={{ margin: '8px 0' }}>
                                        <Rate 
                                          disabled 
                                          value={Object.values(comment.ratings).reduce((a, b) => a + b, 0) / 5} 
                                          style={{ fontSize: '14px', color: COLORS.rating }}
                                        />
                                      </div>
                                    )}
                                    <Text type="secondary" style={{ fontSize: '12px', color: COLORS.textMedium }}>
                                      {new Date(comment.date).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </Text>
                                  </>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                          <MessageOutlined style={{ fontSize: '32px', color: COLORS.divider }} />
                          <Text type="secondary" style={{ display: 'block', marginTop: '8px', color: COLORS.textMedium }}>
                            Aucun commentaire pour cet arbre
                          </Text>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </Col>
          )}
        </Row>
      </Footer>
    </Layout>
  );
};

export default TreeMapPage;