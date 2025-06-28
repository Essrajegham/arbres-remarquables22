// ✅ Fichier complet corrigé avec conversion UTM -> Latitude/Longitude
import React, { useState } from 'react';
import { Form, Input, Button, Upload, message, Card, Typography, Avatar } from 'antd';
import { UploadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import proj4 from 'proj4';
import 'leaflet/dist/leaflet.css';

const { Title, Text } = Typography;

// Définir la projection UTM zone 32N (Sousse) vers WGS84
const utm32N = "+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs";
const wgs84 = "+proj=longlat +datum=WGS84 +no_defs";

const convertUTMToLatLng = (x, y) => {
  const [lng, lat] = proj4(utm32N, wgs84, [x, y]);
  return { lat, lng };
};

// Config icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LocationPicker = ({ position, setPosition, form }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      form.setFieldsValue({
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      });
      message.success(`Position sélectionnée : ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    },
  });
  return position ? <Marker position={position} /> : null;
};

const AddTreeForm = () => {
  const [form] = Form.useForm();
  const [position, setPosition] = useState(null);
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState('');

  const handleImageChange = ({ fileList }) => {
    setImages(fileList);
    if (fileList.length > 0 && fileList[0].thumbUrl) {
      setPreviewImage(fileList[0].thumbUrl);
    }
  };

  const handleConvertUTM = () => {
    const x = parseFloat(form.getFieldValue('utmX'));
    const y = parseFloat(form.getFieldValue('utmY'));
    if (!isNaN(x) && !isNaN(y)) {
      const { lat, lng } = convertUTMToLatLng(x, y);
      form.setFieldsValue({
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      });
      setPosition([lat, lng]);
      message.success(`Converti en : ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } else {
      message.error("Coordonnées UTM invalides.");
    }
  };

  const handleSubmit = async (values) => {
    const lat = parseFloat(values.latitude);
    const lng = parseFloat(values.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      message.error('Coordonnées invalides.');
      return;
    }

    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('species', values.species);
    formData.append('age', values.age);
    formData.append('height', values.height);
    formData.append('circumference', values.circumference);
    formData.append('address', values.address);
    formData.append('district', values.district);
    formData.append('location[type]', 'Point');
    formData.append('location[coordinates][]', lng);
    formData.append('location[coordinates][]', lat);

    images.forEach((file) => {
      formData.append('images', file.originFileObj);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/trees', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout");
      }

      message.success('Arbre ajouté avec succès !');
      form.resetFields();
      setPosition(null);
      setImages([]);
      setPreviewImage('');
    } catch (error) {
      message.error(error.message);
      console.error(error);
    }
  };

  return (
    <div className="register-container" style={{ maxWidth: 800, margin: '0 auto', padding: '24px 0' }}>
      <Card className="register-card" style={{ borderColor: '#2e7d32', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ color: '#2e7d32' }}>Ajouter un arbre remarquable</Title>
          <Text type="secondary">Remplissez le formulaire pour enregistrer un nouvel arbre</Text>
        </div>

        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item label="Coordonnée X (UTM)" name="utmX">
            <Input type="number" placeholder="ex: 647204.820561" />
          </Form.Item>
          <Form.Item label="Coordonnée Y (UTM)" name="utmY">
            <Input type="number" placeholder="ex: 3966343.04039" />
          </Form.Item>
          <Button onClick={handleConvertUTM} type="dashed" style={{ marginBottom: 16 }}>
            Convertir UTM → GPS
          </Button>

          <Form.Item name="name" label="Nom" rules={[{ required: true }]}><Input size="large" /></Form.Item>
          <Form.Item name="species" label="Espèce" rules={[{ required: true }]}><Input size="large" /></Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="age" label="Âge (années)" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Input type="number" size="large" min={0} />
            </Form.Item>
            <Form.Item name="height" label="Hauteur (m)" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Input type="number" size="large" min={0} step="0.1" />
            </Form.Item>
            <Form.Item name="circumference" label="Circonférence (cm)" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Input type="number" size="large" min={0} />
            </Form.Item>
          </div>

          <Form.Item name="address" label="Adresse"><Input size="large" /></Form.Item>
          <Form.Item name="district" label="Délégation / Quartier"><Input size="large" /></Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="latitude" label="Latitude" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Input placeholder="ex: 35.8256" size="large" type="number" step="0.000001" />
            </Form.Item>
            <Form.Item name="longitude" label="Longitude" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Input placeholder="ex: 10.6084" size="large" type="number" step="0.000001" />
            </Form.Item>
          </div>

          <Form.Item label="Position GPS (cliquez sur la carte)">
            <div style={{ height: 300, marginBottom: 16, borderRadius: 8, overflow: 'hidden' }}>
              <MapContainer center={[35.8256, 10.6084]} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker position={position} setPosition={setPosition} form={form} />
              </MapContainer>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}>
              Enregistrer l'arbre
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddTreeForm;
