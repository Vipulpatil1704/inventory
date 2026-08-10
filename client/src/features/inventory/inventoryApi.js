import api from '@/lib/api'

export const inventoryApi = {
  increase: (productId, payload) => api.post(`/inventory/${productId}/increase`, payload),
  decrease: (productId, payload) => api.post(`/inventory/${productId}/decrease`, payload),
  history: (productId, params) => api.get(`/inventory/${productId}/history`, { params }),
}
