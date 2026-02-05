const PROD_URL = 'https://mc-backend-lilac.vercel.app/api';
const DEV_URL = 'http://192.168.29.27:5000/api';

export const API_URL = __DEV__ ? DEV_URL : PROD_URL;
