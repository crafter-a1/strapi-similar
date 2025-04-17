import axios from 'axios';

// Determine the API base URL
const getBaseUrl = () => {
  // For production or deployed environments
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Fallback for development
  const isLocalhost = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';

  // If running locally, use localhost:8080 (backend port)
  // Otherwise, assume API is available at the same domain but with /api path
  return isLocalhost
    ? 'http://localhost:8080/api'
    : `${window.location.origin}/api`;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cms_token');
    console.log('API Request to:', config.url);
    console.log('Token available for request:', token ? 'Yes' : 'No');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', `Bearer ${token.substring(0, 15)}...`);
    } else {
      console.log('No token available, request will be unauthenticated');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response success from:', response.config.url);
    return response;
  },
  (error) => {
    console.log('API Response error from:', error.config?.url);
    console.error('Error details:', error.message);

    // Log response details if available
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }

    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.error('Authentication error - clearing token');

      // Clear token from localStorage
      localStorage.removeItem('cms_token');

      // If not on login page, redirect to login
      if (window.location.pathname !== '/login') {
        console.log('Redirecting to login due to authentication error');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API services
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  register: (username: string, email: string, password: string) =>
    api.post('/auth/signup', { username, email, password }),
};

export const collectionsApi = {
  getAll: () => api.get('/collections'),
  getDetails: () => api.get('/collections/details'),
  getById: (id: string) => api.get(`/collections/${id}`), // Changed from /details to get the basic collection data
  getByIdWithDetails: (id: string) => api.get(`/collections/${id}/details`),
  getByApiId: (apiId: string) => api.get(`/collections/api/${apiId}`),
  create: (data: any) => api.post('/collections', data),
  update: (id: string, data: any) => api.put(`/collections/${id}`, data),
  delete: (id: string) => api.delete(`/collections/${id}`),
};

export const componentsApi = {
  getAll: () => api.get('/components'),
  getActive: () => api.get('/components/active'),
  getById: (id: string) => api.get(`/components/${id}`),
  getByApiId: (apiId: string) => api.get(`/components/api/${apiId}`),
  create: (data: any) => api.post('/components', data),
  update: (id: string, data: any) => api.put(`/components/${id}`, data),
  delete: (id: string) => api.delete(`/components/${id}`),
};

export const fieldTypesApi = {
  getAll: () => api.get('/field-types'),
  getActive: () => api.get('/field-types/active'),
};

export const contentEntriesApi = {
  getAll: () => api.get('/content-entries'),
  getById: (id: string) => api.get(`/content-entries/${id}`),
  getByCollection: (collectionId: string) => api.get(`/content-entries/collection/${collectionId}`),
  create: (data: any) => api.post('/content-entries', data),
  update: (id: string, data: any) => api.put(`/content-entries/${id}`, data),
  delete: (id: string) => api.delete(`/content-entries/${id}`),
};

export const publicApi = {
  getCollections: () => api.get('/public/collections'),
  getSimplifiedCollections: () => api.get('/public/simplified-collections'),
};

export const simplifiedCollectionsApi = {
  getAll: () => api.get('/simplified-collections'),
  getByApiId: (apiId: string) => api.get(`/simplified-collections/api/${apiId}`),
};

// Media API endpoints (placeholder for future implementation)
export const mediaApi = {
  // Assets
  getAllAssets: () => api.get('/media/assets'),
  getAssetById: (id: string) => api.get(`/media/assets/${id}`),
  getAssetsByFolder: (folderId: string) => api.get(`/media/assets/folder/${folderId}`),
  uploadAsset: (formData: FormData) => api.post('/media/assets/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updateAsset: (id: string, data: any) => api.put(`/media/assets/${id}`, data),
  deleteAsset: (id: string) => api.delete(`/media/assets/${id}`),

  // Folders
  getAllFolders: () => api.get('/media/folders'),
  getFolderById: (id: string) => api.get(`/media/folders/${id}`),
  createFolder: (data: any) => api.post('/media/folders', data),
  updateFolder: (id: string, data: any) => api.put(`/media/folders/${id}`, data),
  deleteFolder: (id: string) => api.delete(`/media/folders/${id}`),
};

export default api;
