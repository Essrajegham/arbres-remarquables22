import React from 'react';
import { useParams } from 'react-router-dom';

const TestParams = () => {
  const params = useParams();
  console.log('TestParams useParams:', params);
  return <div>Param ID = {params.id || 'undefined'}</div>;
};

export default TestParams;
