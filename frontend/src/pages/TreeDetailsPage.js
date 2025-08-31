//n'est pas utilsé
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

  if (loading) return <Spin style={{ display: 'block', margin: '3rem auto' }} size="large" />;

  if (error) return <Alert type="error" message={error} showIcon style={{ margin: 20 }} />;

  if (!tree) return <Alert type="warning" message="Aucune donnée à afficher." showIcon style={{ margin: 20 }} />;

  // Fonction pour afficher une donnée ou '-' si vide
  const showValue = (val) => (val !== undefined && val !== null && val !== '' ? val : '-');

  return (
    <Card
      title={<Title level={3}>{showValue(tree.name)}</Title>}
      style={{ maxWidth: 700, margin: '20px auto', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
    >
      <Paragraph><Text strong>Code :</Text> {showValue(tree.code)}</Paragraph>
      <Paragraph><Text strong>Espèce :</Text> {showValue(tree.species)}</Paragraph>
      <Paragraph><Text strong>Genre :</Text> {showValue(tree.genus)}</Paragraph>
      <Paragraph><Text strong>Famille :</Text> {showValue(tree.family)}</Paragraph>
      <Paragraph><Text strong>Ordre :</Text> {showValue(tree.order)}</Paragraph>
      <Paragraph><Text strong>Type :</Text> {showValue(tree.type)}</Paragraph>
      <Paragraph><Text strong>Espace vert :</Text> {showValue(tree.greenSpace)}</Paragraph>
      <Paragraph><Text strong>Délégation :</Text> {showValue(tree.district)}</Paragraph>
      <Paragraph><Text strong>Quartier :</Text> {showValue(tree.neighborhood)}</Paragraph>
      <Paragraph>
        <Text strong>Date de plantation :</Text>{' '}
        {tree.plantingDate ? new Date(tree.plantingDate).toLocaleDateString('fr-FR') : '-'}
      </Paragraph>
      <Paragraph><Text strong>Âge :</Text> {tree.age != null ? `${tree.age} ans` : '-'}</Paragraph>
      <Paragraph><Text strong>Hauteur :</Text> {tree.height != null ? `${tree.height} m` : '-'}</Paragraph>
      <Paragraph><Text strong>Circonférence :</Text> {tree.circumference != null ? `${tree.circumference} cm` : '-'}</Paragraph>
      <Paragraph><Text strong>Coordonnées GPS :</Text>{' '}
        {tree.location && tree.location.coordinates
          ? `${tree.location.coordinates[1].toFixed(6)}, ${tree.location.coordinates[0].toFixed(6)}`
          : '-'}
      </Paragraph>

      {tree.description && (
        <Paragraph><Text strong>Description :</Text> {tree.description}</Paragraph>
      )}

      {/* Images */}
      {tree.images && tree.images.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20, justifyContent: 'center' }}>
          {tree.images.map((img, idx) => (
            <Image
              key={idx}
              src={`http://localhost:5000/${img}`}
              alt={`Image ${idx + 1} de l'arbre ${tree.name}`}
              style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, objectFit: 'cover' }}
              preview={{ mask: <div>Voir l'image</div> }}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default TreeDetails;
