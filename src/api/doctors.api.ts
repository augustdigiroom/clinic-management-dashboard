import type { ApiClient, ApiRequestOptions } from './client'
import type { Doctor, PaginatedApiResponse, Pagination } from './models'

export type DoctorListResponse = PaginatedApiResponse<Doctor>

export const doctorsApi = (client: ApiClient) => ({
  list: (options?: ApiRequestOptions) => client.get<DoctorListResponse>('/api/doctors', options),
  get: (id: number) => client.get<unknown>(`/api/doctors/${id}`),
  create: (doctor: Omit<Doctor, 'id'>) =>
    client.post<Doctor>('/api/doctors', doctor),
  update: (id: number, doctor: Partial<Omit<Doctor, 'id'>>) =>
    client.patch<Doctor>(`/api/doctors/${id}`, doctor),
  remove: (id: number) => client.delete<Doctor>(`/api/doctors/${id}`),
})

export type { Pagination }
