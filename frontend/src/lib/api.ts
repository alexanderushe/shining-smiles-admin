import axios from 'axios';

// Named export
export const getApi = () => {
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token') || '';
  }

  return axios.create({
    baseURL: 'http://localhost:8000/api/v1/',
    headers: {
      Authorization: token ? `Token ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
};
