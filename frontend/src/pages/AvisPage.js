import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, List, Rate, Spin, Alert } from 'antd';

const AvisPage = () => {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvis = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/avis', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvis(res.data);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des avis');
      } finally {
        setLoading(false);
      }
    };

    fetchAvis();
  }, []);

  if (loading) return <Spin tip="Chargement des avis..." />;
  if (error) return <Alert message="Erreur" description={error} type="error" />;

  return (
    <div style={{ padding: 20 }}>
      <h1>Avis des utilisateurs</h1>
      {avis.length === 0 ? (
        <p>Aucun avis disponible.</p>
      ) : (
        <List
          itemLayout="vertical"
          dataSource={avis}
          renderItem={item => (
            <Card key={item._id} title={`Arbre : ${item.treeId}`}>
              <p>Qualité de l'air: <Rate disabled value={item.ratings.question1} /></p>
              <p>Propreté des environs: <Rate disabled value={item.ratings.question2} /></p>
              <p>Niveau de bruit: <Rate disabled value={item.ratings.question3} /></p>
              <p>Accessibilité: <Rate disabled value={item.ratings.question4} /></p>
              <p>État général: <Rate disabled value={item.ratings.question5} /></p>
            </Card>
          )}
        />
      )}
    </div>
  );
};

export default AvisPage;
