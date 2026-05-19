import axios from 'axios';

const API_BASE = '/api';

export const loginWithMicrosoft = () => {
  window.location.href = `${API_BASE}/auth/login`;
};

export const getHealth = async () => {
  const response = await axios.get(`${API_BASE}/health`);
  return response.data;
};

export const fetchData = async (token: string) => {
  const response = await axios.get(`${API_BASE}/data/fetch`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
