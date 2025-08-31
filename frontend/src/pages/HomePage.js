import React, { useRef } from 'react';
import { Layout, Typography, Row, Col, Button } from 'antd';
import {
  EnvironmentOutlined,
  FileSearchOutlined,
  UsergroupAddOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import './HomePage.css';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const features = [
  {
    title: 'Consultation des arbres remarquables',
    description:
      'Parcourez la liste complète des arbres remarquables de Sousse et visualisez-les sur une carte interactive avec leurs détails botaniques.',
    image: '/images/arbre1.jpg',
    icon: <EnvironmentOutlined />,
    color: '#52c41a',
  },
  {
    title: ' Recherche avancée et filtres',
    description:
      'Trouvez facilement un arbre grâce à des filtres par espèce, quartier, âge ou état, pour une navigation rapide et intuitive.',
    image: '/images/arbre2.jpg',
    icon: <FileSearchOutlined />,
    color: '#1890ff',
  },
  {
    title: ' Gestion des utilisateurs',
    description:
      'Administration complète des utilisateurs et des rôles (utilisateurs, admins, superadmins) avec possibilité d’ajouter ou modifier des profils.',
    image: '/images/arbre3.jpg',
    icon: <UsergroupAddOutlined />,
    color: '#f5222d',
  },
  {
    title: ' Avis et commentaires citoyens',
    description:
      'Partagez votre expérience et évaluez la qualité environnementale autour des arbres via un système d’avis avec notes détaillées et commentaires.',
    image: '/images/arbre4.jpg',
    icon: <CommentOutlined />,
    color: '#faad14',
  },
];

const HomePage = () => {
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Layout className="home-layout">
      <section
        className="hero-section"
        style={{
          backgroundImage: `url('/images/back.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="hero-content-box">
          <Title style={{ fontWeight: 'bold' }}>Bienvenue dans notre app</Title>
          <Title level={2} style={{ color: '#52c41a', fontWeight: 'bold' }}>
            Sousse GreenMap
          </Title>
          <Paragraph
            style={{ fontSize: 18, color: '#444', maxWidth: 600, margin: 'auto' }}
          >
            Découvrez les arbres remarquables de Sousse, consultez leur géolocalisation, et contribuez à leur préservation durable 🌿.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            style={{ marginTop: 30, backgroundColor: '#52c41a' }}
            onClick={scrollToFeatures}
          >
            Découvrir les fonctionnalités
          </Button>
        </div>
      </section>

      <Content
        ref={featuresRef}
        className="features-section"
        style={{ padding: '40px 0' }}
      >
        <Row justify="center">
          <Col xs={24} md={22} lg={20}>
            <Swiper
              modules={[Autoplay, Pagination]}
              slidesPerView={1}
              spaceBetween={24}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{ clickable: true }}
              breakpoints={{
                768: { slidesPerView: 3 },
              }}
              className="feature-swiper"
            >
              {features.map((feature, index) => (
                <SwiperSlide key={index}>
                  <div
                    className="feature-slide"
                    style={{
                      border: '2px solid #52c41a',
                      borderRadius: 10,
                      padding: 16,
                      margin: '0 8px',
                      height: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'center', // Centre horizontalement tout le contenu
                      textAlign: 'center', // Centre le texte aussi
                    }}
                  >
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="feature-image"
                      style={{ borderRadius: 8, marginBottom: 12, width: '100%', objectFit: 'cover' }}
                    />
                    {/* Icône centrée */}
                    {React.cloneElement(feature.icon, {
                      style: { fontSize: 48, color: feature.color, marginBottom: 16 },
                    })}
                    <Title level={4} style={{ color: '#222' }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{ color: '#555', flexGrow: 1 }}>
                      {feature.description}
                    </Paragraph>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default HomePage;
