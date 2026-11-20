import type { ApiClient, ApiRequestOptions } from './client'
import type {
  Appointment,
  AppointmentCreateRequest,
  DemoResetResponse,
  PaginatedApiResponse,
} from './models'

export type AppointmentListResponse = PaginatedApiResponse<Appointment>

export const appointmentsApi = (client: ApiClient) => ({
  list: (options?: ApiRequestOptions) =>
    client.get<AppointmentListResponse>('/api/appointments', options),
  get: (id: number) => client.get<unknown>(`/api/appointments/${id}`),
  create: (appointment: AppointmentCreateRequest) =>
    client.post<unknown>('/api/appointments', appointment),
  update: (id: number, appointment: Partial<AppointmentCreateRequest>) =>
    client.patch<unknown>(`/api/appointments/${id}`, appointment),
  remove: (id: number) => client.delete<unknown>(`/api/appointments/${id}`),
  resetDemo: () => {
    if (client.mode !== 'demo') {
      throw new Error('Demo reset is available only in Demo mode.')
    }
    return client.post<DemoResetResponse>('/api/demo/reset')
  },
})
