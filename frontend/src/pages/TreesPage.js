import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TreesList from '../components/TreesList';
import { Spin, Alert } from 'antd';

const TreesPage = () => {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrees = async () => {
      const token = localStorage.getItem('token'); // récupération du token

      if (!token) {
        setError('Token manquant. Veuillez vous connecter.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/trees', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 🔍 Vérifie la structure de la réponse
        console.log('✅ Réponse complète :', res.data);

        // Ici on suppose que le backend renvoie { success: true, trees: [...] }
        if (res.data.success && Array.isArray(res.data.trees)) {
          setTrees(res.data.trees);
        } else if (Array.isArray(res.data)) {
          // Si backend renvoie directement un tableau
          setTrees(res.data);
        } else {
          setError('Données inattendues reçues du serveur');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur lors du chargement des arbres');
      } finally {
        setLoading(false);
      }
    };

    fetchTrees();
  }, []);

  if (loading) return <Spin style={{ display: 'block', marginTop: 100 }} />;
  if (error) return <Alert type="error" message={error} showIcon style={{ marginTop: 100 }} />;

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <TreesList trees={trees} />
    </div>
  );
};

export default TreesPage;
