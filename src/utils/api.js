const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Turns a backend-relative path (e.g. "/uploads/foo.jpg") into an absolute URL.
// Absolute http(s) URLs and data/base64 strings are returned untouched.
export const assetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path;
  if (path.startsWith('/uploads/')) {
    return API_BASE_URL.replace(/\/api\/?$/, '') + path;
  }
  return path;
};

// Uploads a single image via the admin-protected /api/uploads endpoint.
// Returns the stored relative URL (e.g. "/uploads/..."). Callers pipe it into forms.
export const uploadImage = async (file) => {
  const token = localStorage.getItem('fti_token');
  const formData = new FormData();
  formData.append('image', file);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Image upload failed');
  }
  return data.url;
};

export const apiRequest = async (endpoint, method = 'GET', body = null, customHeaders = {}) => {
  const token = localStorage.getItem('fti_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const config = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
};
