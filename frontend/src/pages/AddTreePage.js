import React, { useState, useRef } from 'react';
import { Form, Input, Button, Upload, message, Card, Typography, Avatar, DatePicker } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import proj4 from 'proj4';
import moment from 'moment';
import 'leaflet/dist/leaflet.css';

const { Title, Text } = Typography;

const utm32N = "+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs";
const wgs84 = "+proj=longlat +datum=WGS84 +no_defs";

const convertUTMToLatLng = (x, y) => {
  const [lng, lat] = proj4(utm32N, wgs84, [x, y]);
  return { lat, lng };
};

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
  const uploadRef = useRef(null);

  const handleImageChange = ({ fileList }) => {
    setImages(fileList);
    if (fileList.length > 0 && fileList[0].thumbUrl) {
      setPreviewImage(fileList[0].thumbUrl);
    } else {
      setPreviewImage('');
    }
  };

  const onAvatarClick = () => {
    if (uploadRef.current) {
      uploadRef.current.click();
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

  const updateAge = (date) => {
    if (date) {
      const currentYear = moment().year();
      const selectedYear = date.year();
      const age = currentYear - selectedYear;
      form.setFieldsValue({ age });
    } else {
      form.setFieldsValue({ age: '' });
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
    const fields = [
      'name', 'genus', 'species', 'family', 'order', 'type',
      'greenSpace', 'district', 'neighborhood', 'age', 'height', 'circumference',
      'plantingDate'
    ];
    
    fields.forEach(field => {
      if (values[field] !== undefined && values[field] !== null) {
        formData.append(field, values[field]);
      }
    });

    formData.append('location[type]', 'Point');
    formData.append('location[coordinates][]', lng);
    formData.append('location[coordinates][]', lat);

    images.forEach(file => {
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

      const result = await response.json();
      message.success(`Arbre ajouté avec succès ! Code: ${result.code}`);
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
          <Upload
            listType="picture"
            beforeUpload={() => false}
            onChange={handleImageChange}
            maxCount={1}
            showUploadList={false}
            customRequest={() => {}}
          >
            <Avatar
              src={previewImage}
              size={100}
              onClick={onAvatarClick}
              style={{
                margin: '0 auto 16px',
                cursor: 'pointer',
                borderRadius: '50%',
                border: '2px solid #2e7d32',
                backgroundColor: previewImage ? 'transparent' : '#e6f4ea',
                display: 'inline-block',
              }}
              alt="Cliquez pour uploader une image"
            />
          </Upload>

          <Title level={3} style={{ color: '#2e7d32' }}>Ajouter un arbre remarquable</Title>
          <Text type="secondary">Remplissez le formulaire pour enregistrer un nouvel arbre</Text>
        </div>

        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={uploadRef}
          onChange={e => {
            if (e.target.files.length > 0) {
              const file = e.target.files[0];
              const reader = new FileReader();
              reader.onload = () => {
                setPreviewImage(reader.result);
              };
              reader.readAsDataURL(file);

              setImages([{ originFileObj: file, thumbUrl: URL.createObjectURL(file) }]);
            }
          }}
        />

        <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
          <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          

          <Form.Item name="species" label="Espèce" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="genus" label="Genre">
            <Input />
          </Form.Item>

          <Form.Item name="family" label="Famille">
            <Input />
          </Form.Item>

          <Form.Item name="order" label="Ordre">
            <Input />
          </Form.Item>

          <Form.Item name="type" label="Type">
            <Input />
          </Form.Item>

          <Form.Item name="greenSpace" label="Espace vert">
            <Input />
          </Form.Item>

          <Form.Item name="district" label="Délégation" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="neighborhood" label="Quartier">
            <Input />
          </Form.Item>

          <Form.Item name="plantingDate" label="Date de plantation" rules={[{ required: true }]}>
            <DatePicker 
              style={{ width: '100%' }} 
              onChange={updateAge} 
              picker="year" 
              format="YYYY"
            />
          </Form.Item>

          <Form.Item name="age" label="Âge (automatique)">
            <Input readOnly />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="height" label="Hauteur (m)" style={{ flex: 1 }}>
              <Input type="number" step="0.1" min={0} />
            </Form.Item>
            <Form.Item name="circumference" label="Circonférence (cm)" style={{ flex: 1 }}>
              <Input type="number" step="0.1" min={0} />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item label="Coordonnée X (UTM)" name="utmX">
              <Input placeholder="ex: 647204.820561" type="number" />
            </Form.Item>
            <Form.Item label="Coordonnée Y (UTM)" name="utmY">
              <Input placeholder="ex: 3966343.04039" type="number" />
            </Form.Item>
          </div>

          <Button onClick={handleConvertUTM} type="dashed" style={{ marginBottom: 24 }}>
            Convertir UTM → GPS
          </Button>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="latitude" label="Latitude" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Input placeholder="ex: 35.8256" type="number" step="0.000001" />
            </Form.Item>
            <Form.Item name="longitude" label="Longitude" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Input placeholder="ex: 10.6084" type="number" step="0.000001" />
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
            <Button type="primary" htmlType="submit" block style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}>
              Enregistrer l'arbre
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddTreeForm;