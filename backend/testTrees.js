const axios = require('axios');

axios.get('http://localhost:5000/api/trees')
  .then(res => {
    console.log('Réponse backend:', res.data);
  })
  .catch(err => {
    if (err.response) {
      // Le serveur a répondu avec un code d'erreur
      console.error('Erreur HTTP:', err.response.status);
      console.error('Détails:', err.response.data);
    } else if (err.request) {
      // La requête a été envoyée mais pas de réponse reçue
      console.error('Pas de réponse du serveur:', err.request);
    } else {
      // Autre erreur lors de la configuration de la requête
      console.error('Erreur:', err.message);
    }
  });
