import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Spin, Alert, Card, Typography, Image } from 'antd';

const { Title, Paragraph, Text } = Typography;

const TreeDetails = () => {
  const { id } = useParams();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || id.length !== 24) {
      setError('ID invalide');
      setLoading(false);
      return;
    }

    const fetchTree = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/trees/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data.success) {
          setTree(response.data.data);
        } else {
          setError(response.data.error || 'Erreur inconnue');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [id]);

  if (loading) return <Spin style={{ display: 'block', margin: '4rem auto' }} size="large" />;

  if (error) return <Alert type="error" message={error} showIcon style={{ margin: 24 }} />;

  if (!tree) return <Alert type="warning" message="Aucune donnée à afficher." showIcon style={{ margin: 24 }} />;

  const showValue = (val) => (val !== undefined && val !== null && val !== '' ? val : '-');

  return (
    <Card
      bordered={false}
      style={{
        maxWidth: 720,
        margin: '2rem auto',
        borderRadius: 14,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        backgroundColor: '#f9f9f9',
        padding: '2rem 2.5rem',
      }}
    >
      <Title level={2} style={{ color: '#2e7d32', marginBottom: '0.4rem', borderBottom: '3px solid #2e7d32', paddingBottom: 8 }}>
        {showValue(tree.name)}
      </Title>

      {/* Images en haut, centrées */}
      {tree.images && tree.images.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 20,
            flexWrap: 'wrap',
            marginTop: 16,
            marginBottom: 32,
            justifyContent: 'center',
          }}
        >
          {tree.images.map((img, idx) => (
            <Image
              key={idx}
              src={`http://localhost:5000/${img}`}
              alt={`Image ${idx + 1} de l'arbre ${tree.name}`}
              style={{
                width: 250,
                height: 250,
                borderRadius: 14,
                objectFit: 'cover',
                boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
                transition: 'transform 0.3s ease',
                cursor: 'pointer',
              }}
              preview={{ mask: <div style={{ color: '#fff' }}>Voir l'image</div> }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ))}
        </div>
      )}

      <div style={{ maxWidth: 600 }}>
       
        <Paragraph style={{ fontSize: 16 }}>
  <Text strong>Espèce :</Text> <Text style={{ fontStyle: 'italic' }}>{showValue(tree.species)}</Text>
</Paragraph>
         <Paragraph style={{ fontSize: 16 }}>
          <Text strong>Genre :</Text> {showValue(tree.genus)}
        </Paragraph>
        <Paragraph style={{ fontSize: 16 }}>
          <Text strong>Famille :</Text> {showValue(tree.family)}
        </Paragraph>
        <Paragraph style={{ fontSize: 16 }}>
          <Text strong>Ordre :</Text> {showValue(tree.order)}
        </Paragraph>
        <Paragraph style={{ fontSize: 16 }}>
          <Text strong>Type :</Text> {showValue(tree.type)}
        </Paragraph>
        <Paragraph style={{ fontSize: 16 }}>
          <Text strong>Espace vert :</Text> {showValue(tree.greenSpace)}
        </Paragraph>
        <Paragraph style={{ fontSize: 16 }}>
          <Text strong>Délégation :</Text> {showValue(tree.district)}
        </Paragraph>
        <Paragraph style={{ fontSize: 16 }}>
          <Text strong>Quartier :</Text> {showValue(tree.neighborhood)}
        </Paragraph>
        <Paragraph style={{ fontSize: 16 }}>
          <Text strong>Date de plantation :</Text>{' '}
          {tree.plantingDate ? new Date(tree.plantingDate).toLocaleDateString('fr-FR') : '-'}
        </Paragraph>
        <Paragraph style={{ fontSize: 16 }}>
          <Text strong>Âge :</Text> {tree.age != null ? `${tree.age} ans` : '-'}
        </Paragraph>
        <Paragraph style={{ fontSize: 16 }}>
          <Text strong>Hauteur :</Text> {tree.height != null ? `${tree.height} m` : '-'}
        </Paragraph>
        <Paragraph style={{ fontSize: 16 }}>
          <Text strong>Circonférence :</Text> {tree.circumference != null ? `${tree.circumference} cm` : '-'}
        </Paragraph>
        <Paragraph style={{ fontSize: 16 }}>
          <Text strong>Coordonnées GPS :</Text>{' '}
          {tree.location && tree.location.coordinates
            ? `${tree.location.coordinates[1].toFixed(6)}, ${tree.location.coordinates[0].toFixed(6)}`
            : '-'}
        </Paragraph>

        {tree.description && (
          <Paragraph style={{ fontSize: 16 }}>
            <Text strong>Description :</Text> {tree.description}
          </Paragraph>
        )}
      </div>
    </Card>
  );
};

export default TreeDetails;
