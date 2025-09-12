// src/api/products.bulkUpload.js
import axios from 'axios';

const API_BASE = 'http://13.124.224.246:7778';

const getAuthHeaders = () => {
  const raw = localStorage.getItem('token');
  const token = raw && raw !== 'undefined' && raw !== 'null' ? raw : '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function bulkUploadProducts(items) {
  const resp = await axios.post(
    `${API_BASE}/api/products/bulk`,
    { items },
    { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } }
  );
  return resp.data;
}
