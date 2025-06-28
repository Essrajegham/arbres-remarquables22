import React, { useState } from 'react';
import { Form, Input, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]); // Format [longitude, latitude]
      message.success(`Position sélectionnée: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  });

  return position ? (
    <Marker position={[position[1], position[0]]} />
  ) : null;
};

const AddTreeForm = () => {
  const [form] = Form.useForm();
  const [position, setPosition] = useState(null);
  const [images, setImages] = useState([]);

  const handleSubmit = async (values) => {
    if (!position) {
      message.error('Veuillez sélectionner une position sur la carte');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('species', values.species);
      formData.append('age', values.age);
      formData.append('height', values.height);
      formData.append('circumference', values.circumference);
      formData.append('address', values.address);
      formData.append('district', values.district);
      formData.append('location[type]', 'Point');
      formData.append('location[coordinates][]', position[1]); // ✅ longitude
formData.append('location[coordinates][]', position[0]); // ✅ latitude


      images.forEach(file => {
        formData.append('images', file.originFileObj);
      });

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/trees', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Erreur lors de l\'ajout');

      message.success('Arbre ajouté avec succès!');
      form.resetFields();
      setPosition(null);
      setImages([]);
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h2 style={{ color: '#2e7d32', marginBottom: 24 }}>Ajouter un arbre remarquable</h2>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="species" label="Espèce" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="age" label="Âge (en années)">
          <Input />
        </Form.Item>

        <Form.Item name="height" label="Hauteur (en mètres)">
          <Input />
        </Form.Item>

        <Form.Item name="circumference" label="Circonférence (en cm)">
          <Input />
        </Form.Item>

        <Form.Item name="address" label="Adresse">
          <Input />
        </Form.Item>

        <Form.Item name="district" label="Délégation / Quartier">
          <Input />
        </Form.Item>

        <Form.Item label="Position GPS (cliquez sur la carte)">
          <div style={{ height: 400, marginBottom: 16 }}>
            <MapContainer
              center={[35.8256, 10.6084]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <LocationPicker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
        </Form.Item>

        {position && (
          <>
            <Form.Item label="Longitude">
              <Input value={position[0].toFixed(6)} readOnly />
            </Form.Item>

            <Form.Item label="Latitude">
              <Input value={position[1].toFixed(6)} readOnly />
            </Form.Item>
          </>
        )}

        <Form.Item label="Images">
          <Upload
            multiple
            listType="picture"
            beforeUpload={() => false}
            onChange={({ fileList }) => setImages(fileList)}
            fileList={images}
          >
            <Button icon={<UploadOutlined />}>Ajouter des images</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              backgroundColor: '#2e7d32',
              borderColor: '#2e7d32',
              color: '#fff'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#1b5e20';
              e.target.style.borderColor = '#1b5e20';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#2e7d32';
              e.target.style.borderColor = '#2e7d32';
            }}
          >
            Enregistrer
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddTreeForm;
