import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Card, Typography, Space, Button, message, Tag, Grid } from 'antd';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileExcelOutlined, FilePdfOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { useBreakpoint } = Grid;
const { Text } = Typography;

const AvisListPage = () => {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const screens = useBreakpoint();

  useEffect(() => {
    const fetchAvis = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get('/api/avis', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const transformedData = response.data.data.map(item => {
          const userDisplay = item.username
            ? { username: item.username, isAnonymous: false }
            : { username: 'Anonyme', isAnonymous: true };

          const treeDisplay = item.treeName
            ? { name: item.treeName, isGeneral: false }
            : { name: 'Général', isGeneral: true };

          return {
            ...item,
            user: userDisplay,
            tree: treeDisplay,
            createdAt: item.date || item.createdAt || item.updatedAt,
            ratings: item.ratings || {},
          };
        });

        setAvis(transformedData);
      } catch (err) {
        console.error('Erreur API:', err);
        setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des avis');
        message.error('Échec du chargement des avis');
        setAvis([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvis();
  }, []);

  const getMobileColumns = () => [
    {
      title: 'Utilisateur/Arbre',
      key: 'user_tree',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          {record.user?.isAnonymous ? (
            <Tag icon={<UserOutlined />} color="default">
              Anonyme
            </Tag>
          ) : (
            <Text strong>{record.user?.username}</Text>
          )}
          {record.tree?.isGeneral ? (
            <Tag icon={<EnvironmentOutlined />} color="geekblue">
              Général
            </Tag>
          ) : (
            <Text type="secondary">{record.tree?.name}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Évaluations',
      key: 'ratings',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <div>
            <Text type="secondary">Air: </Text>
            {record.ratings?.airQuality !== undefined && record.ratings?.airQuality !== null ? (
              <Tag color={record.ratings.airQuality >= 3 ? 'green' : 'orange'}>
                {record.ratings.airQuality}/5
              </Tag>
            ) : (
              <Tag color="default">-</Tag>
            )}
          </div>
          <div>
            <Text type="secondary">Arbre: </Text>
            {record.ratings?.treeCondition !== undefined && record.ratings?.treeCondition !== null ? (
              <Tag color={record.ratings.treeCondition >= 3 ? 'green' : 'orange'}>
                {record.ratings.treeCondition}/5
              </Tag>
            ) : (
              <Tag color="default">-</Tag>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Date/Commentaire',
      key: 'date_comment',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Text>
            {record.createdAt
              ? new Date(record.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : '-'}
          </Text>
          {record.comment && (
            <Text ellipsis={{ tooltip: record.comment }} style={{ maxWidth: '150px' }}>
              {record.comment.substring(0, 20) + (record.comment.length > 20 ? '...' : '')}
            </Text>
          )}
        </Space>
      ),
    },
  ];

  const getDesktopColumns = () => [
    {
      title: 'Utilisateur',
      dataIndex: ['user', 'username'],
      key: 'username',
      render: (text, record) => (
        <Space>
          {record.user?.isAnonymous ? (
            <Tag icon={<UserOutlined />} color="default">
              Anonyme
            </Tag>
          ) : (
            <Text>{text}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Arbre',
      dataIndex: ['tree', 'name'],
      key: 'treeName',
      render: (text, record) => (
        <Space>
          {record.tree?.isGeneral ? (
            <Tag icon={<EnvironmentOutlined />} color="geekblue">
              Général
            </Tag>
          ) : (
            <Text>{text}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Qualité air',
      dataIndex: ['ratings', 'airQuality'],
      key: 'airQuality',
      render: (v) =>
        v !== undefined && v !== null ? (
          <Tag color={v >= 3 ? 'green' : 'orange'}>{v}/5</Tag>
        ) : (
          <Tag color="default">-</Tag>
        ),
      width: 100,
      align: 'center',
    },
    {
      title: 'Propreté',
      dataIndex: ['ratings', 'cleanliness'],
      key: 'cleanliness',
      render: (v) =>
        v !== undefined && v !== null ? (
          <Tag color={v >= 3 ? 'green' : 'orange'}>{v}/5</Tag>
        ) : (
          <Tag color="default">-</Tag>
        ),
      width: 100,
      align: 'center',
    },
    {
      title: 'Bruit',
      dataIndex: ['ratings', 'noiseLevel'],
      key: 'noiseLevel',
      render: (v) =>
        v !== undefined && v !== null ? (
          <Tag color={v <= 2 ? 'green' : v <= 4 ? 'orange' : 'red'}>{v}/5</Tag>
        ) : (
          <Tag color="default">-</Tag>
        ),
      width: 100,
      align: 'center',
    },
    {
      title: 'Accessibilité',
      dataIndex: ['ratings', 'accessibility'],
      key: 'accessibility',
      render: (v) =>
        v !== undefined && v !== null ? (
          <Tag color={v >= 3 ? 'green' : 'orange'}>{v}/5</Tag>
        ) : (
          <Tag color="default">-</Tag>
        ),
      width: 100,
      align: 'center',
    },
    {
      title: 'État arbre',
      dataIndex: ['ratings', 'treeCondition'],
      key: 'treeCondition',
      render: (v) =>
        v !== undefined && v !== null ? (
          <Tag color={v >= 3 ? 'green' : 'orange'}>{v}/5</Tag>
        ) : (
          <Tag color="default">-</Tag>
        ),
      width: 100,
      align: 'center',
    },
    {
      title: 'Commentaire',
      dataIndex: 'comment',
      key: 'comment',
      render: (text) =>
        text ? <Text ellipsis={{ tooltip: text }}>{text}</Text> : <Text type="secondary">Aucun</Text>,
      width: 200,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => {
        if (!date) return '-';
        try {
          return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        } catch {
          return date;
        }
      },
      width: 150,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
  ];

  const handleExportExcel = () => {
    const worksheetData = avis.map((a) => ({
      Utilisateur: a.user?.isAnonymous ? 'Anonyme' : a.user?.username,
      Arbre: a.tree?.isGeneral ? 'Général' : a.tree?.name,
      'Qualité air': a.ratings?.airQuality ?? '-',
      Propreté: a.ratings?.cleanliness ?? '-',
      Bruit: a.ratings?.noiseLevel ?? '-',
      Accessibilité: a.ratings?.accessibility ?? '-',
      'État arbre': a.ratings?.treeCondition ?? '-',
      Commentaire: a.comment || 'Aucun',
      Date: a.createdAt ? new Date(a.createdAt).toLocaleDateString('fr-FR') : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Avis');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `avis_${new Date().toISOString().slice(0, 10)}.xlsx`);
    message.success('Export Excel réussi');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toISOString().slice(0, 10);

    doc.text(`Liste des avis - ${dateStr}`, 14, 16);

    autoTable(doc, {
      startY: 25,
      head: [['Utilisateur', 'Arbre', 'Air', 'Propreté', 'Bruit', 'Accessibilité', 'État', 'Commentaire', 'Date']],
      body: avis.map((a) => [
        a.user?.isAnonymous ? 'Anonyme' : a.user?.username,
        a.tree?.isGeneral ? 'Général' : a.tree?.name,
        a.ratings?.airQuality ?? '-',
        a.ratings?.cleanliness ?? '-',
        a.ratings?.noiseLevel ?? '-',
        a.ratings?.accessibility ?? '-',
        a.ratings?.treeCondition ?? '-',
        a.comment?.substring(0, 30) + (a.comment?.length > 30 ? '...' : '') || 'Aucun',
        a.createdAt ? new Date(a.createdAt).toLocaleDateString('fr-FR') : '-',
      ]),
      margin: { top: 20 },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255,
        fontStyle: 'bold',
      },
    });

    doc.save(`avis_${dateStr}.pdf`);
    message.success('Export PDF réussi');
  };

  const columns = screens.xs ? getMobileColumns() : getDesktopColumns();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
        <Spin size="large" tip="Chargement..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          type="error"
          message="Erreur"
          description={error}
          showIcon
          action={
            <Button type="primary" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: screens.xs ? 8 : 24 }}>
      <Card
        title="Gestion des avis"
        extra={
          <Space>
            <Button 
              icon={<FileExcelOutlined />} 
              onClick={handleExportExcel} 
              disabled={avis.length === 0}
              size={screens.xs ? 'small' : 'middle'}
            >
              {screens.xs ? null : 'Excel'}
            </Button>
            <Button 
              icon={<FilePdfOutlined />} 
              onClick={handleExportPDF} 
              disabled={avis.length === 0} 
              danger
              size={screens.xs ? 'small' : 'middle'}
            >
              {screens.xs ? null : 'PDF'}
            </Button>
          </Space>
        }
        bodyStyle={screens.xs ? { padding: 12 } : {}}
      >
        <Table
          columns={columns}
          dataSource={avis}
          rowKey="_id"
          size={screens.xs ? 'small' : 'middle'}
          scroll={{ x: true }}
          pagination={{
            pageSize: 10,
            showSizeChanger: !screens.xs,
            showTotal: (total) => `Total: ${total} avis`,
            pageSizeOptions: ['10', '25', '50', '100'],
            size: screens.xs ? 'small' : 'default',
          }}
          locale={{
            emptyText: 'Aucun avis disponible',
          }}
        />
      </Card>
    </div>
  );
};

export default AvisListPage;