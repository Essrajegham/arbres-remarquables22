import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTreeContext } from '../contexts/TreeContext';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

// Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export default function MapPage() {
  const { trees, setTrees } = useTreeContext();
  const [center] = useState([35.8256, 10.6084]); // Sousse

  useEffect(() => {
    if (trees.length === 0) {
      fetch('http://localhost:5000/api/trees')
        .then(res => res.json())
        .then(data => setTrees(data))
        .catch(err => console.error("Erreur:", err));
    }
  }, [trees.length, setTrees]);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* Titre flottant au-dessus de la carte */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1000,
        backgroundColor: '#ffffffcc',
        padding: '12px 20px',
        borderRadius: 12,
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        <Title level={4} style={{ margin: 0, color: '#2e7d32' }}>Carte des arbres remarquables</Title>
      </div>

      <MapContainer 
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        />

        {trees.map(tree => (
          tree.location?.coordinates?.length === 2 && (
            <Marker
              key={tree._id}
              position={[
                tree.location.coordinates[1], // Latitude
                tree.location.coordinates[0]  // Longitude
              ]}
            >
              <Popup>
                <div style={{ maxWidth: 220 }}>
                  <Text strong style={{ fontSize: 14, color: '#1b5e20' }}>{tree.name}</Text>
                  <p style={{ margin: '8px 0' }}>
                    <Text type="secondary">Espèce :</Text> {tree.species || 'Non spécifiée'}
                  </p>
                  {tree.age && (
                    <p style={{ margin: 0 }}>
                      <Text type="secondary">Âge :</Text> {tree.age} ans
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
