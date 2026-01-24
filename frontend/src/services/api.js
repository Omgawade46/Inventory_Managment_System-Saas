import axios from 'axios';

// Create Axios Instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add Interceptor to attach Token if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const authApi = {
    login: (credentials) => api.post('/auth/login', credentials),
};

export const inventoryApi = {
    // Units
    getUnits: () => api.get('/units'),
    createUnit: (data) => api.post('/units', data),
    updateUnit: (id, data) => api.put(`/units/${id}`, data),
    deleteUnit: (id) => api.delete(`/units/${id}`),

    // Raw Materials
    getMaterials: () => api.get('/raw-materials'),
    createMaterial: (data) => api.post('/raw-materials', data),
    updateMaterial: (id, data) => api.put(`/raw-materials/${id}`, data),
    deleteMaterial: (id) => api.delete(`/raw-materials/${id}`),

    // Stock
    getStockLogs: () => api.get('/stock-logs'),
    addStockLog: (data) => api.post('/stock-logs', data),

    // Products
    getProducts: () => api.get('/products'),
    createProduct: (data) => api.post('/products', data),
    updateProduct: (id, data) => api.put(`/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/products/${id}`),

    // Recipes
    getRecipes: () => api.get('/recipes'),
    createRecipe: (data) => api.post('/recipes', data),
    updateRecipe: (id, data) => api.put(`/recipes/${id}`, data),
    deleteRecipe: (id) => api.delete(`/recipes/${id}`),
};

export default api;
