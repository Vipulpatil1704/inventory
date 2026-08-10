import api from '@/lib/api'

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
}
