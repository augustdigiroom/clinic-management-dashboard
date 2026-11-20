export interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialization: string
}

export interface Patient {
  id: number
  first_name: string
  last_name: string
  age: number
  gender: string
  diagnosis: string
  contact_number: string
  doctor_id: number | null
}

export interface Appointment {
  id: number
  patient_id: number
  doctor_id: number | null
  appointment_date: string
  reason: string
  status: string
}

export interface AppointmentCreateRequest {
  patient_id: number
  doctor_id: number | null
  date: string
  reason: string
  status: string
}

export interface Pagination {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

export interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data: T
}

export interface PaginatedApiResponse<T> {
  data: T[]
  pagination: Pagination
}

export interface ApiError {
  message: string
  status?: number
  details?: unknown
}

export interface DemoResetResult {
  doctors: number
  patients: number
  appointments: number
}

export interface DemoResetResponse extends ApiEnvelope<DemoResetResult> {
  success: true
}
