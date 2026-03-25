import api from './api';

const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { data } = response.data; // Backend wraps in { success, message, data }
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data.data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  async getMe() {
    const response = await api.get('/users/me');
    const { data } = response.data;
    localStorage.setItem('user', JSON.stringify(data.user || data));
    return data.user || data;
  },

  async updateMe(name) {
    const response = await api.patch('/users/me', { name });
    const { data } = response.data;
    const updated = data.user || data;
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  }
};

export default authService;
