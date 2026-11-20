import type { ApiClient, ApiRequestOptions } from './client'
import type { PaginatedApiResponse, Patient } from './models'

export type PatientListResponse = PaginatedApiResponse<Patient>

export const patientsApi = (client: ApiClient) => ({
  list: (options?: ApiRequestOptions) => client.get<PatientListResponse>('/api/patients', options),
  get: (id: number) => client.get<unknown>(`/api/patients/${id}`),
  create: (patient: Omit<Patient, 'id'>) =>
    client.post<unknown>('/api/patients', patient),
  update: (id: number, patient: Partial<Omit<Patient, 'id'>>) =>
    client.patch<unknown>(`/api/patients/${id}`, patient),
  remove: (id: number) => client.delete<unknown>(`/api/patients/${id}`),
})
