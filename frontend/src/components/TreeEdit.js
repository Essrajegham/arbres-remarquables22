import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  message, 
  Spin, 
  Card,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Select,
  Upload,
  Typography,
  Avatar
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Configuration pour les marqueurs de carte
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const TreeEdit = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [treeData, setTreeData] = useState(null);
  const [position, setPosition] = useState(null);
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Décoder le token pour vérifier les permissions
        const payload = JSON.parse(atob(token.split('.')[1]));
        const res = await axios.get(`http://localhost:5000/api/trees/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          // Vérifier les permissions
          if (payload.role !== 'admin' && 
              payload.role !== 'superadmin' && 
              res.data.data.addedBy !== payload.userId) {
            message.error("Vous n'avez pas les permissions nécessaires");
            navigate('/trees');
            return;
          }

          const tree = res.data.data;
          setTreeData(tree);
          
          // Positionner le marqueur sur la carte
          if (tree.location && tree.location.coordinates) {
            setPosition([tree.location.coordinates[1], tree.location.coordinates[0]]);
          }

          // Préparer les valeurs pour le formulaire
          const formValues = {
            ...tree,
            plantingDate: tree.plantingDate ? moment(tree.plantingDate) : null,
            latitude: tree.location?.coordinates[1],
            longitude: tree.location?.coordinates[0]
          };

          form.setFieldsValue(formValues);

          // Gérer l'image de prévisualisation si elle existe
          if (tree.images && tree.images.length > 0) {
            setPreviewImage(tree.images[0]);
          }
        }
      } catch (err) {
        message.error('Erreur lors du chargement des données');
        navigate('/trees');
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [id, form, navigate]);

  const handleImageChange = ({ fileList }) => {
    setImages(fileList);
    if (fileList.length > 0 && fileList[0].thumbUrl) {
      setPreviewImage(fileList[0].thumbUrl);
    } else {
      setPreviewImage('');
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

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      const fields = [
        'name', 'genus', 'species', 'family', 'order', 'type',
        'greenSpace', 'district', 'neighborhood', 'age', 'height', 'circumference',
        'plantingDate', 'latitude', 'longitude'
      ];
      
      fields.forEach(field => {
        if (values[field] !== undefined && values[field] !== null) {
          formData.append(field, values[field]);
        }
      });

      formData.append('location[type]', 'Point');
      formData.append('location[coordinates][]', values.longitude);
      formData.append('location[coordinates][]', values.latitude);

      // Ajouter les nouvelles images si elles existent
      images.forEach(file => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });

      const res = await axios.put(
        `http://localhost:5000/api/trees/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (res.data.success) {
        message.success('Arbre mis à jour avec succès');
        navigate(`/trees/${id}`);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        message.error("Vous n'avez pas les permissions nécessaires");
      } else {
        message.error('Erreur lors de la mise à jour');
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const LocationPicker = () => {
    return (
      <Marker 
        position={position} 
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            setPosition([lat, lng]);
            form.setFieldsValue({
              latitude: lat.toFixed(6),
              longitude: lng.toFixed(6),
            });
          }
        }}
      />
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!treeData) {
    return <div style={{ padding: 24 }}>Arbre non trouvé</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Card title={`Modifier l'arbre: ${treeData.name || ''}`}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Upload
            listType="picture"
            beforeUpload={() => false}
            onChange={handleImageChange}
            maxCount={1}
            showUploadList={false}
          >
            <Avatar
              src={previewImage}
              size={100}
              style={{
                margin: '0 auto 16px',
                cursor: 'pointer',
                borderRadius: '50%',
                border: '2px solid #2e7d32',
                backgroundColor: previewImage ? 'transparent' : '#e6f4ea',
                display: 'inline-block',
              }}
              icon={!previewImage && <UploadOutlined />}
              alt="Image de l'arbre"
            />
          </Upload>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Nom"
                rules={[{ required: true, message: 'Veuillez entrer un nom' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="species"
                label="Espèce"
                rules={[{ required: true, message: 'Veuillez entrer une espèce' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="genus" label="Genre">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="family" label="Famille">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="order" label="Ordre">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="type" label="Type">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="greenSpace" label="Espace vert">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="district" label="Délégation">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="neighborhood" label="Quartier">
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="plantingDate" label="Date de plantation">
                <DatePicker 
                  style={{ width: '100%' }} 
                  onChange={updateAge} 
                  picker="year" 
                  format="YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="age" label="Âge (années)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="height" label="Hauteur (mètres)">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="circumference" label="Circonférence (cm)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="latitude" label="Latitude" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} step="0.000001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="longitude" label="Longitude" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} step="0.000001" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Position GPS (le marqueur est draggable)">
            <div style={{ height: 300, marginBottom: 16, borderRadius: 8, overflow: 'hidden' }}>
              <MapContainer 
                center={position || [35.8256, 10.6084]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }} 
                scrollWheelZoom
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {position && <LocationPicker />}
              </MapContainer>
            </div>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              style={{ width: '100%' }}
            >
              Enregistrer les modifications
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TreeEdit;