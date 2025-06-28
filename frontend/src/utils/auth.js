export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const handleApiError = (error, navigate) => {
  if (error?.response?.status === 401) {
    navigate('/login');
    return 'Session expirée, veuillez vous reconnecter';
  }
  return error.response?.data?.error || error.message || 'Erreur inconnue';
};