import proj4 from 'proj4';

// Définitions
proj4.defs('EPSG:22391', '+proj=tmerc +lat_0=36.66666666666666 +lon_0=10 +k=0.9998 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');

export const convertCoordinates = {
  toProjected: (lat, lng) => {
    try {
      const [x, y] = proj4('EPSG:4326', 'EPSG:22391', [lng, lat]);
      return { x, y, valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },
  toLatLng: (x, y) => {
    try {
      const [lng, lat] = proj4('EPSG:22391', 'EPSG:4326', [x, y]);
      return { lat, lng, valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
};