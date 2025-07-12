import API from './api.js';

export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const getCurrentUser = () => API.get('/auth/me');