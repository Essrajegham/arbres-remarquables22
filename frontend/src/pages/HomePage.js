import React, { useRef } from 'react';
import { Layout, Typography, Row, Col, Button } from 'antd';
import { EnvironmentOutlined, ApiOutlined, HeartOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import './HomePage.css';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const features = [
  {
    title: '🌳 Consultation des arbres remarquables',
    description: 'Explorez la liste complète des arbres protégés à Sousse et consultez leur position sur une carte interactive.',
    image: '/images/arbre1.jpg',
    icon: <EnvironmentOutlined />,
    color: '#52c41a',
  },
  {
    title: '📍 Détails & géolocalisation',
    description: 'Accédez aux informations complètes de chaque arbre : espèces, localisation, état, importance écologique...',
    image: '/images/arbre2.jpg',
    icon: <ApiOutlined />,
    color: '#1890ff',
  },
  {
    title: '🤝 Parrainage citoyen',
    description: 'Encouragez la préservation en parrainant un arbre et recevez un certificat de reconnaissance.',
    image: '/images/arbre3.jpg',
    icon: <HeartOutlined />,
    color: '#f5222d',
  },
  {
    title: 'ℹ️ Informations supplémentaires',
    description: 'Trouvez des conseils, astuces et actualités pour mieux protéger nos arbres.',
    image: '/images/arbre4.jpg',
    icon: <InfoCircleOutlined />,
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
          <Paragraph style={{ fontSize: 18, color: '#444', maxWidth: 600, margin: 'auto' }}>
            Découvrez les arbres remarquables de Sousse, consultez leur géolocalisation, et contribuez à leur préservation durable 🌿.
          </Paragraph>
          <Button type="primary" size="large" style={{ marginTop: 30, backgroundColor: '#52c41a' }} onClick={scrollToFeatures}>
            Découvrir les fonctionnalités
          </Button>
        </div>
      </section>

      <Content ref={featuresRef} className="features-section">
        <Row justify="center">
          <Col xs={24} md={22} lg={20}>
            <Swiper
              modules={[Autoplay, Pagination]}
              slidesPerView={1}
              spaceBetween={16}
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
                  <div className="feature-slide">
                    <img src={feature.image} alt={feature.title} className="feature-image" />
                    <div className="feature-content">
                      {React.cloneElement(feature.icon, { style: { fontSize: 36, color: feature.color } })}
                      <Title level={4} style={{ color: '#222' }}>
                        {feature.title}
                      </Title>
                      <Paragraph style={{ color: '#555' }}>{feature.description}</Paragraph>
                    </div>
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