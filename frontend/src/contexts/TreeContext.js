import React, { createContext, useContext, useState } from 'react';

const TreeContext = createContext();

const TreeProvider = ({ children }) => {
  const [trees, setTrees] = useState([]);
  return (
    <TreeContext.Provider value={{ trees, setTrees }}>
      {children}
    </TreeContext.Provider>
  );
};

export const useTreeContext = () => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error('useTreeContext doit être utilisé dans un TreeProvider');
  }
  return context;
};

export default TreeProvider;