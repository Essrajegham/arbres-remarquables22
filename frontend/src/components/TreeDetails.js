import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Spin, Descriptions, message, Badge, Carousel, Typography } from 'antd';
import { LeftOutlined, EditOutlined, EnvironmentOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getAuthHeader, handleApiError } from '../utils/auth';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const { Title, Paragraph } = Typography;

const healthStatusColors = {
  excellent: 'green',
  good: 'lime',
  fair: 'gold',
  poor: 'volcano',
  dead: 'red',
};

const TreeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

        const response = await axios.get(
          `${apiUrl}/trees/${id}`,
          { headers: getAuthHeader() }
        );

        if (!response.data.success) {
          throw new Error(response.data.error || 'Données invalides');
        }

        setTree(response.data.data);
      } catch (error) {
        const errorMessage = handleApiError(error, navigate);
        message.error(errorMessage);
        navigate('/trees');
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!tree) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <InfoCircleOutlined style={{ fontSize: 48, color: '#ccc' }} />
        <Paragraph style={{ marginTop: 16, fontSize: 16 }}>
          Aucune donnée disponible pour cet arbre
        </Paragraph>
        <Button type="primary" onClick={() => navigate('/trees')}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  const coords = tree.location?.coordinates || [0, 0];
  const [lng, lat] = coords;

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 24 }}>
      <Button 
        type="default" 
        icon={<LeftOutlined />} 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: 20 }}
      >
        Retour à la liste
      </Button>

      <Card
        title={<Title level={3} style={{ marginBottom: 0 }}>{tree.name}</Title>}
        extra={tree.canEdit && (
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => navigate(`/trees/${id}/edit`)}
          >
            Modifier
          </Button>
        )}
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
      >
        {/* Carousel images */}
        {tree.images?.length > 0 ? (
          <Carousel autoplay dotPosition="bottom" style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden' }}>
            {tree.images.map((imgUrl, index) => (
              <div key={index}>
                <img
                  src={`http://localhost:5000/${imgUrl}`} 
                  alt={`Arbre ${tree.name} - image ${index + 1}`}
                  style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 12 }}
                />
              </div>
            ))}
          </Carousel>
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
            <InfoCircleOutlined style={{ fontSize: 64 }} />
            <Paragraph style={{ marginTop: 12 }}>Pas d'images disponibles</Paragraph>
          </div>
        )}

        <Descriptions
          bordered
          column={1}
          labelStyle={{ fontWeight: 'bold', width: 180 }}
          contentStyle={{ fontSize: 16 }}
          size="middle"
        >
          <Descriptions.Item label="Espèce">{tree.species || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Âge">{tree.age} ans</Descriptions.Item>
          <Descriptions.Item label="Hauteur">{tree.height} m</Descriptions.Item>
          <Descriptions.Item label="Circonférence">{tree.circumference} m</Descriptions.Item>
          <Descriptions.Item label="Adresse">{tree.address || 'Non renseignée'}</Descriptions.Item>
          <Descriptions.Item label="Quartier">{tree.district || 'Non renseigné'}</Descriptions.Item>
          <Descriptions.Item label="Statut de santé">
            <Badge 
              color={healthStatusColors[tree.healthStatus] || 'gray'} 
              text={tree.healthStatus ? tree.healthStatus.charAt(0).toUpperCase() + tree.healthStatus.slice(1) : 'Inconnu'} 
            />
          </Descriptions.Item>
          {tree.description && (
            <Descriptions.Item label="Description">
              <Paragraph ellipsis={{ rows: 4, expandable: true, symbol: 'plus' }}>
                {tree.description}
              </Paragraph>
            </Descriptions.Item>
          )}
        </Descriptions>

        <div style={{ marginTop: 32 }}>
          <Title level={5}><EnvironmentOutlined /> Localisation GPS</Title>
          <div style={{ height: 320, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
            <MapContainer 
              center={[lat, lng]} 
              zoom={15} 
              scrollWheelZoom={false} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[lat, lng]}>
                <Popup>{tree.name}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TreeDetails;

