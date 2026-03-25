import api from './api';

const adminService = {
  // Line Management
  async getLines() {
    const response = await api.get('/admin/lines');
    return response.data.data;
  },

  async createLine(data) {
    const response = await api.post('/admin/lines', data);
    return response.data.data;
  },

  // Station Management
  async getStations() {
    const response = await api.get('/admin/stations');
    return response.data.data;
  },

  async createStation(data) {
    const response = await api.post('/admin/stations', data);
    return response.data.data;
  },

  async updateStationStatus(id, status) {
    const response = await api.patch(`/admin/stations/${id}/status`, { status });
    return response.data.data;
  },

  // Pricing
  async updatePricing(data) {
    const response = await api.patch('/admin/pricing', data);
    return response.data.data;
  },

  async getDashboardStats() {
    const response = await api.get('/admin/stats');
    return response.data.data;
  },

  async updateStation(id, data) {
    const response = await api.patch(`/admin/stations/${id}`, data);
    return response.data.data;
  },

  async deleteStation(id) {
    const response = await api.delete(`/admin/stations/${id}`);
    return response.data;
  },

  async updateLine(id, data) {
    const response = await api.patch(`/admin/lines/${id}`, data);
    return response.data.data;
  },

  async deleteLine(id) {
    const response = await api.delete(`/admin/lines/${id}`);
    return response.data;
  },

  async toggleAllMetroStatus(status) {
    const response = await api.patch('/admin/metro/toggle-all', { status });
    return response.data;
  },

  async getUsers() {
    const response = await api.get('/admin/users');
    return response.data.data;
  },

  async createUser(data) {
    const response = await api.post('/admin/users', data);
    return response.data.data;
  },

  async updateUser(userId, data) {
    const response = await api.patch(`/admin/users/${userId}`, data);
    return response.data.data;
  },

  async updateUserRole(userId, role) {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data.data;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  async getReportStats() {
    const response = await api.get('/admin/report-stats');
    return response.data.data;
  }
};

export default adminService;
