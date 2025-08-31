import React, { useEffect, useState } from 'react';
import {
  Table,
  Typography,
  Spin,
  message,
  Card,
  Tag,
  Space,
  Button,
  Tooltip,
  Input,
  Modal,
  Form,
  Select,
  Row,
  Col
} from 'antd';
import {
  IdcardOutlined,
  MailOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
  ExclamationCircleFilled
} from '@ant-design/icons';
import axios from 'axios';
import './AdminsList.css'; 

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;
const { useForm } = Form;

const AdminsList = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [form] = useForm();

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authentification requise');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/admins', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      if (Array.isArray(response.data)) {
        setAdmins(response.data);
        setFilteredAdmins(response.data);
        setPagination(prev => ({ ...prev, total: response.data.length }));
      } else {
        throw new Error('Format de données invalide');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        message.error('Session expirée, veuillez vous reconnecter');
        localStorage.removeItem('token');
      } else if (error.request) {
        message.error('Serveur inaccessible');
      } else {
        message.error('Erreur de configuration');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    const filtered = searchText
      ? admins.filter(admin =>
          admin.username?.toLowerCase().includes(searchText.toLowerCase()) ||
          admin.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          admin._id?.toLowerCase().includes(searchText.toLowerCase())
        )
      : admins;
    setFilteredAdmins(filtered);
  }, [searchText, admins]);

  const showDeleteConfirm = (adminId) => {
    confirm({
      title: 'Supprimer cet admin ?',
      icon: <ExclamationCircleFilled />,
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        return handleDelete(adminId);
      }
    });
  };

  const handleDelete = async (adminId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admins/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      message.success("Admin supprimé avec succès");
      await fetchAdmins();
    } catch (err) {
      message.error(err.response?.data?.error || "Erreur de suppression");
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    form.setFieldsValue({
      username: admin.username,
      email: admin.email,
      role: admin.role
    });
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admins/${editingAdmin._id}`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      message.success("Admin modifié avec succès");
      setEditingAdmin(null);
      await fetchAdmins();
    } catch (err) {
      message.error(err.response?.data?.error || "Erreur de mise à jour");
    }
  };

  const columns = [
    {
      title: 'ID', dataIndex: '_id', key: '_id', width: 220, align: 'center',
      render: id => (
        <Tooltip title={id}>
          <Space style={{ cursor: 'pointer' }}>
            <IdcardOutlined style={{ color: '#237804' }} />
            <Text
              copyable={{
                text: id,
                icon: [
                  <IdcardOutlined style={{ color: '#237804' }} key="copy-icon" />,
                  <IdcardOutlined style={{ color: '#145214' }} key="copied-icon" />
                ],
                tooltips: ['Copier', 'Copié!']
              }}
              style={{ color: '#237804', cursor: 'pointer' }}
            >
              {id?.substring(0, 8)}...
            </Text>
          </Space>
        </Tooltip>
      )
    },
    {
      title: 'Nom d\'admin', dataIndex: 'username', key: 'username', width: 200, align: 'center',
      render: text => (
        <Text strong>{text}</Text>
      )
    },
    {
      title: 'Email', dataIndex: 'email', key: 'email', width: 250, align: 'center',
      render: email => (
        <Space><MailOutlined style={{ color: '#237804' }} /><a href={`mailto:${email}`}>{email}</a></Space>
      )
    },
    {
      title: 'Rôle', dataIndex: 'role', key: 'role', width: 120, align: 'center',
      render: role => (
        <Tag color={role === 'admin' ? 'green' : 'lime'} style={{ textTransform: 'uppercase' }}>
          {role}
        </Tag>
      )
    },
    {
      title: 'Actions', key: 'actions', width: 150, fixed: 'right', align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Modifier">
            <Button type="primary" icon={<EditOutlined />} size="small"
              onClick={() => handleEdit(record)}
              style={{ backgroundColor: '#237804', borderColor: '#237804' }}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button danger icon={<DeleteOutlined />} size="small"
              onClick={() => showDeleteConfirm(record._id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <Row justify="center" style={{ padding: 16 }}>
      <Col xs={24} lg={22} xl={20}>
        <Card
          title={
            <Space align="center" wrap>
              <Title level={3} style={{ margin: 0, whiteSpace: 'nowrap' }}>
                Gestion des Admins
              </Title>
              <Tag color="green">{pagination.total} admins</Tag>
            </Space>
          }
          extra={
            <Space wrap style={{ gap: 8 }}>
              <Search
                placeholder="Rechercher par nom, email ou ID"
                allowClear
                enterButton={
                  <Button
                    icon={<SearchOutlined />}
                    style={{
                      backgroundColor: '#237804',
                      borderColor: '#237804',
                      color: '#fff',
                      height: '32px'
                    }}
                  />
                }
                style={{ width: '100%', maxWidth: 280 }}
                onSearch={value => setSearchText(value)}
                onChange={e => setSearchText(e.target.value)}
                className="custom-search"
              />
              <Tooltip title="Rafraîchir">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchAdmins}
                  shape="circle"
                  style={{ color: '#237804', borderColor: '#237804' }}
                />
              </Tooltip>
            </Space>
          }
          bordered={false}
          style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.1)', borderRadius: 8 }}
        >
          <Spin spinning={loading} tip="Chargement en cours...">
            <Table
              dataSource={filteredAdmins}
              columns={columns}
              rowKey="_id"
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: total => `Total ${total} admins`,
                pageSizeOptions: ['5', '10', '20', '50'],
                position: ['bottomCenter']
              }}
              scroll={{ x: 'max-content' }}
              bordered
              size="middle"
              style={{ marginTop: 16 }}
              locale={{ emptyText: 'Aucun admin trouvé' }}
            />
          </Spin>
        </Card>

        <Modal
          title="Modifier l'admin"
          open={!!editingAdmin}
          onOk={handleEditSubmit}
          onCancel={() => setEditingAdmin(null)}
          okText="Enregistrer"
          cancelText="Annuler"
          centered
        >
          <Form form={form} layout="vertical" preserve={false}>
            <Form.Item name="username" label="Nom d'admin" rules={[{ required: true, message: 'Champ requis', whitespace: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Champ requis' }, { type: 'email', message: 'Email invalide' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="role" label="Rôle" rules={[{ required: true, message: 'Champ requis' }]}>
              <Select>
                <Option value="admin">Administrateur</Option>
                <Option value="user">Utilisateur</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Col>
    </Row>
  );
};

export default AdminsList;
