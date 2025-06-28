import React, { useState, useEffect, useRef } from 'react';
import {
  message,
  Input,
  Button,
  Form,
  Row,
  Col,
  Spin,
  Alert,
  Descriptions,
  Card,
  Collapse,
  Rate,
} from 'antd';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './TreeMapPage.css';

const treeGreenIcon = new L.Icon({
  iconUrl: '/tree-icon.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const FlyToLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
};

const TreeMapPage = () => {
  const [trees, setTrees] = useState([]);
  const [selectedTree, setSelectedTree] = useState(null);
  const [searchedTree, setSearchedTree] = useState(null);
  const [mapCenter, setMapCenter] = useState([35.8254, 10.6369]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    species: '',
    district: '',
    minAge: '',
  });
  const [ratings, setRatings] = useState({
    question1: 0,
    question2: 0,
    question3: 0,
    question4: 0,
    question5: 0,
  });
  const mapRef = useRef();

  useEffect(() => {
    const fetchTrees = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/trees', {
          headers: { Authorization: `Bearer ${token}` },
        });

        let treesData = Array.isArray(res.data)
          ? res.data
          : res.data?.trees && Array.isArray(res.data.trees)
          ? res.data.trees
          : [];

        const validTrees = treesData
          .filter(tree => tree?.location?.coordinates?.length === 2)
          .map((tree, index) => ({
            ...tree,
            id: tree._id || `tree-${index}-${Date.now()}`,
            latLng: [tree.location.coordinates[1], tree.location.coordinates[0]],
          }));

        setTrees(validTrees);
      } catch (err) {
        console.error('Erreur fetchTrees:', err);
        setError('Erreur lors du chargement des arbres');
        message.error('Impossible de charger les données des arbres');
      } finally {
        setLoading(false);
      }
    };

    fetchTrees();
  }, []);

  const getFilteredTrees = () => {
    return trees.filter(tree => {
      const matchSpecies =
        !filters.species ||
        (tree.species &&
          tree.species.toLowerCase().includes(filters.species.toLowerCase()));
      const matchDistrict =
        !filters.district ||
        (tree.district &&
          tree.district.toLowerCase().includes(filters.district.toLowerCase()));
      const matchMinAge =
        !filters.minAge || (tree.age && tree.age >= parseInt(filters.minAge));
      return matchSpecies && matchDistrict && matchMinAge;
    });
  };

  const handleSearch = values => {
    const lat = parseFloat(values.latitude);
    const lng = parseFloat(values.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      message.error('Coordonnées invalides');
      return;
    }

    const foundTree = trees.find(tree => {
      const [treeLat, treeLng] = tree.latLng;
      return Math.abs(treeLat - lat) < 0.001 && Math.abs(treeLng - lng) < 0.001;
    });

    setSelectedTree(foundTree || null); // sélectionne l'arbre trouvé ou null
    setSearchedTree({ latLng: [lat, lng] }); // stocke toujours la coordonnée saisie
    setMapCenter([lat, lng]);
  };

  const handleRatingChange = (questionKey, value) => {
    setRatings(prev => ({ ...prev, [questionKey]: value }));
  };

  const handleSubmitRatings = async () => {
    try {
      if (Object.values(ratings).some(v => v === 0)) {
        message.error('Merci de répondre à toutes les questions');
        return;
      }

      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/avis',
        {
          treeId: selectedTree._id,

          ratings,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success('Merci pour votre avis !');

      setRatings({
        question1: 0,
        question2: 0,
        question3: 0,
        question4: 0,
        question5: 0,
      });
    } catch (error) {
      console.error(error);
      message.error("Erreur lors de l'envoi de l'avis");
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
          onClick={() => window.location.reload()}
          style={{ marginTop: '20px' }}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  const filteredTrees = getFilteredTrees();

  // Items pour Collapse de la liste des arbres
  const collapseItems = filteredTrees.map(tree => ({
    key: tree._id || tree.id,
    label: tree.name || 'Arbre sans nom',
    children: (
      <>
        <p>
          <strong>Espèce :</strong> {tree.species || 'Non spécifiée'}
        </p>
        <p>
          <strong>Adresse :</strong> {tree.address || 'Non spécifiée'}
        </p>
        <p>
          <strong>Coordonnées :</strong> {tree.latLng[0].toFixed(6)},{' '}
          {tree.latLng[1].toFixed(6)}
        </p>
      </>
    ),
  }));

  return (
    <div className="tree-map-page">
      <div className="search-header">
        <Form form={form} onFinish={handleSearch} layout="inline">
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item name="latitude" label="Latitude" rules={[{ required: true }]}>
                <Input placeholder="35.8254" type="number" step="0.000001" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="longitude" label="Longitude" rules={[{ required: true }]}>
                <Input placeholder="10.6369" type="number" step="0.000001" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Button type="primary" htmlType="submit" block>
                Aller à ces coordonnées
              </Button>
            </Col>
            <Col span={6}>
              <Button
                type="default"
                block
                onClick={() => {
                  form.resetFields();
                  setSearchedTree(null);
                  setSelectedTree(null);
                  setMapCenter([35.8254, 10.6369]);
                  message.info('Recherche réinitialisée');
                }}
              >
                Réinitialiser la recherche
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      <div className="map-details-wrapper">
        <div className="filters-panel">
          <Card title="Filtres avancés" variant="outlined">
            <Form layout="vertical">
              <Form.Item label="Espèce">
                <Input
                  placeholder="ex: palmier"
                  value={filters.species}
                  onChange={e => setFilters(prev => ({ ...prev, species: e.target.value }))}
                  allowClear
                />
              </Form.Item>
              <Form.Item label="Quartier / Délégation">
                <Input
                  placeholder="ex: Sahloul"
                  value={filters.district}
                  onChange={e => setFilters(prev => ({ ...prev, district: e.target.value }))}
                  allowClear
                />
              </Form.Item>
              <Form.Item label="Âge minimum (ans)">
                <Input
                  type="number"
                  min={0}
                  value={filters.minAge}
                  onChange={e => setFilters(prev => ({ ...prev, minAge: e.target.value }))}
                />
              </Form.Item>
              <Button onClick={() => setFilters({ species: '', district: '', minAge: '' })}>
                Réinitialiser les filtres
              </Button>
            </Form>
          </Card>
        </div>

        <div className="map-section" style={{ height: '600px' }}>
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
            minZoom={12}
            maxBounds={[
              [35.5, 10.3],
              [36.0, 11.0],
            ]}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <FlyToLocation position={mapCenter} />

            {/* Markers des arbres filtrés */}
            {filteredTrees.map(tree => (
              <Marker
                key={tree._id || tree.id}
                position={tree.latLng}
                icon={treeGreenIcon}
                eventHandlers={{
                  click: () => setSelectedTree(tree),
                }}
              >
                <Popup>
                  <strong>{tree.name || 'Arbre sans nom'}</strong>
                  <br />
                  Espèce: {tree.species || 'Non spécifiée'}
                </Popup>
              </Marker>
            ))}

            {/* Marker sur coordonnées saisies si aucun arbre sélectionné */}
            {searchedTree && searchedTree.latLng && !selectedTree && (
              <Marker position={searchedTree.latLng} icon={treeGreenIcon}>
                <Popup>Coordonnées sélectionnées</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <div className="details-panel" style={{ marginTop: '20px' }}>
          {selectedTree ? (
            <>
              <Card title="Détails de l’arbre sélectionné" variant="outlined">
                <Descriptions column={1}>
                  <Descriptions.Item label="Nom">
                    {selectedTree.name || 'Non spécifié'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Espèce">
                    {selectedTree.species || 'Non spécifiée'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Adresse">
                    {selectedTree.address || 'Non spécifiée'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Coordonnées">
                    {selectedTree.latLng[0].toFixed(6)}, {selectedTree.latLng[1].toFixed(6)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card
                title={`Questionnaire sur l'environnement de "${
                  selectedTree.name || 'cet arbre'
                }"`}
                style={{ marginTop: 20 }}
                variant="outlined"
              >
                <Form layout="vertical">
                  <Form.Item label="Qualité de l'air">
                    <Rate
                      value={ratings.question1}
                      onChange={value => handleRatingChange('question1', value)}
                    />
                  </Form.Item>
                  <Form.Item label="Propreté des environs">
                    <Rate
                      value={ratings.question2}
                      onChange={value => handleRatingChange('question2', value)}
                    />
                  </Form.Item>
                  <Form.Item label="Niveau de bruit">
                    <Rate
                      value={ratings.question3}
                      onChange={value => handleRatingChange('question3', value)}
                    />
                  </Form.Item>
                  <Form.Item label="Accessibilité de l'arbre">
                    <Rate
                      value={ratings.question4}
                      onChange={value => handleRatingChange('question4', value)}
                    />
                  </Form.Item>
                  <Form.Item label="État général de l'arbre">
                    <Rate
                      value={ratings.question5}
                      onChange={value => handleRatingChange('question5', value)}
                    />
                  </Form.Item>
                  <Button type="primary" onClick={handleSubmitRatings}>
                    Envoyer l'avis
                  </Button>
                </Form>
              </Card>
            </>
          ) : (
            <div className="empty-selection" style={{ marginTop: 20 }}>
              {searchedTree
                ? "Aucun arbre trouvé à ces coordonnées."
                : "Sélectionnez un arbre sur la carte ou recherchez par coordonnées."}
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <Card title="Liste complète des arbres" variant="outlined">
              {filteredTrees.length > 0 ? (
                <Collapse accordion items={collapseItems} />
              ) : (
                <p>Aucun arbre ne correspond aux filtres.</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeMapPage;


