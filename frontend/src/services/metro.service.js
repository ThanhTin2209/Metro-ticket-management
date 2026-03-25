import api from './api';

const metroService = {
  // Staff Features
  async validateTicket(ticketCode, stationCode) {
    const response = await api.post(`/metro/tickets/${ticketCode}/validate-entry`, {
      stationCode,
    });
    return response.data.data;
  },

  // Inspector Features
  async manualInspection(ticketCode) {
    const response = await api.post(`/metro/tickets/${ticketCode}/manual-inspection`);
    return response.data.data;
  },

  // Admin Features
  async getAllUsers() {
    const response = await api.get('/users');
    return response.data.data;
  },

  async updateUserRole(userId, role) {
    const response = await api.patch(`/users/${userId}/role`, { role });
    return response.data.data;
  },

  // Passenger Features (Draft - to be implemented)
  async purchaseTicket(data) {
    const response = await api.post('/metro/tickets/purchase', data);
    return response.data.data;
  },

  async getMyTickets() {
    const response = await api.get('/metro/my-tickets');
    return response.data.data;
  },

  async topUpAccount(amount) {
    const response = await api.post('/users/top-up', { amount });
    return response.data.data;
  },

  async getTransactions() {
    const response = await api.get('/users/transactions');
    return response.data.data;
  },

  async getValidations() {
    const response = await api.get('/metro/validations');
    return response.data.data;
  },

  async reportIncident(data) {
    const response = await api.post('/metro/incidents', data);
    return response.data.data;
  },

  async getIncidents() {
    const response = await api.get('/metro/incidents');
    return response.data.data;
  },

  async resolveIncident(id) {
    const response = await api.patch(`/metro/incidents/${id}/resolve`);
    return response.data.data;
  },

  async getInspections() {
    const response = await api.get('/metro/inspections');
    return response.data.data;
  },

  async createViolation(data) {
    const response = await api.post('/metro/violations', data);
    return response.data.data;
  },

  async getViolations() {
    const response = await api.get('/metro/violations');
    return response.data.data;
  },
  
  async getMetroData() {
    const response = await api.get('/metro/metro-data');
    return response.data.data;
  }
};

export default metroService;
