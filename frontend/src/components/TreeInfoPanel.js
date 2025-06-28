import React from 'react';
import { Descriptions, Image } from 'antd';

const TreeInfoPanel = ({ tree }) => {
  if (!tree) return <div>Sélectionnez un arbre</div>;

  return (
    <div style={{ padding: 20 }}>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Nom">{tree.name}</Descriptions.Item>
        <Descriptions.Item label="Espèce">{tree.species}</Descriptions.Item>
        <Descriptions.Item label="Coordonnées">
          {tree.latLng?.join(', ')}
        </Descriptions.Item>
      </Descriptions>
      
      {tree.images?.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Image.PreviewGroup items={tree.images.map(img => img.url)}>
            {tree.images.map((img, i) => (
              <Image key={i} width={100} src={img.url} />
            ))}
          </Image.PreviewGroup>
        </div>
      )}
    </div>
  );
};

export default TreeInfoPanel;