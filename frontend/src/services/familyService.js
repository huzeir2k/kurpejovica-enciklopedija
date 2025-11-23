import api from './api'

export const familyService = {
  async getFamilyMember(id) {
    const response = await api.get(`/family-members/${id}`)
    return response.data
  },

  async getAllFamilyMembers(filters = {}) {
    const response = await api.get('/family-members', { params: filters })
    return response.data
  },

  async searchFamilyMembers(query) {
    const response = await api.get('/family-members/search', { params: { q: query } })
    return response.data
  },

  async createFamilyMember(data) {
    const response = await api.post('/family-members', data)
    return response.data
  },

  async updateFamilyMember(id, data) {
    const response = await api.put(`/family-members/${id}`, data)
    return response.data
  },

  async getFamilyTree(memberId) {
    const response = await api.get(`/family-members/${memberId}/tree`)
    return response.data
  },
}
