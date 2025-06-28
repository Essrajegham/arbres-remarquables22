import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Spin, Alert, Card, Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

const TreeDetails = () => {
  const { id } = useParams();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('ID from URL:', id);

    // Validation simple de l'ID MongoDB (24 caractères hex)
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

  if (loading) return <Spin style={{ display: 'block', margin: '3rem auto' }} />;

  if (error) return <Alert type="error" message={error} showIcon style={{ margin: 20 }} />;

  if (!tree) return <Alert type="warning" message="Aucune donnée à afficher." showIcon style={{ margin: 20 }} />;

  return (
    <Card
      title={<Title level={3}>{tree.name}</Title>}
      style={{ maxWidth: 600, margin: '20px auto', borderRadius: 12 }}
      // remplacement de bodyStyle (deprecated) par styles.body
      styles={{ body: { padding: 20 } }}
    >
      <Paragraph><Text strong>Espèce :</Text> {tree.species}</Paragraph>
      <Paragraph><Text strong>Âge :</Text> {tree.age} ans</Paragraph>
      <Paragraph><Text strong>Hauteur :</Text> {tree.height} m</Paragraph>
      <Paragraph><Text strong>Circonférence :</Text> {tree.circumference} m</Paragraph>
      <Paragraph><Text strong>Adresse :</Text> {tree.address}</Paragraph>
      <Paragraph><Text strong>Coordonnées GPS :</Text> {tree.location.coordinates[1]}, {tree.location.coordinates[0]}</Paragraph>
      {tree.description && <Paragraph><Text strong>Description :</Text> {tree.description}</Paragraph>}
      {/* Affiche les images si présentes */}
      {tree.images && tree.images.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
          {tree.images.map((img, idx) => (
            <img
              key={idx}
              src={`http://localhost:5000/${img}`}
              alt={`Arbre ${tree.name} image ${idx + 1}`}
              style={{ maxWidth: 150, borderRadius: 8 }}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default TreeDetails;
