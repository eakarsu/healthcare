import { get, post, put, del } from '@/lib/api-client';
import {
  Appointment,
  AppointmentType,
  AppointmentBookingRequest,
  Provider,
  Location,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

interface AvailableSlot {
  date: string;
  time: string;
  providerId: string;
  providerName: string;
  locationId: string;
  locationName: string;
}

interface AppointmentFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  providerId?: string;
  page?: number;
  pageSize?: number;
}

export const appointmentsApi = {
  /**
   * Get patient's appointments
   */
  async getAppointments(
    filters?: AppointmentFilters
  ): Promise<ApiResponse<PaginatedResponse<Appointment>>> {
    return get<PaginatedResponse<Appointment>>('/portal/appointments', filters);
  },

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(): Promise<ApiResponse<Appointment[]>> {
    return get<Appointment[]>('/portal/appointments/upcoming');
  },

  /**
   * Get past appointments
   */
  async getPastAppointments(
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Appointment>>> {
    return get<PaginatedResponse<Appointment>>('/portal/appointments/past', {
      page,
      pageSize,
    });
  },

  /**
   * Get a single appointment by ID
   */
  async getAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return get<Appointment>(`/portal/appointments/${id}`);
  },

  /**
   * Get appointment types available for booking
   */
  async getAppointmentTypes(): Promise<ApiResponse<AppointmentType[]>> {
    return get<AppointmentType[]>('/portal/appointment-types');
  },

  /**
   * Get available providers
   */
  async getProviders(): Promise<ApiResponse<Provider[]>> {
    return get<Provider[]>('/portal/providers');
  },

  /**
   * Get locations
   */
  async getLocations(): Promise<ApiResponse<Location[]>> {
    return get<Location[]>('/portal/locations');
  },

  /**
   * Get available time slots
   */
  async getAvailableSlots(
    providerId: string,
    locationId: string,
    appointmentTypeId: string,
    date: string
  ): Promise<ApiResponse<AvailableSlot[]>> {
    return get<AvailableSlot[]>('/portal/appointments/available-slots', {
      providerId,
      locationId,
      appointmentTypeId,
      date,
    });
  },

  /**
   * Book a new appointment
   */
  async bookAppointment(
    request: AppointmentBookingRequest
  ): Promise<ApiResponse<Appointment>> {
    return post<Appointment>('/portal/appointments/book', request);
  },

  /**
   * Request to reschedule an appointment
   */
  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string
  ): Promise<ApiResponse<Appointment>> {
    return put<Appointment>(`/portal/appointments/${appointmentId}/reschedule`, {
      newDate,
      newTime,
    });
  },

  /**
   * Cancel an appointment
   */
  async cancelAppointment(
    appointmentId: string,
    reason?: string
  ): Promise<ApiResponse<{ message: string }>> {
    return del<{ message: string }>(
      `/portal/appointments/${appointmentId}?reason=${encodeURIComponent(reason || '')}`
    );
  },

  /**
   * Confirm an appointment
   */
  async confirmAppointment(
    appointmentId: string
  ): Promise<ApiResponse<Appointment>> {
    return post<Appointment>(`/portal/appointments/${appointmentId}/confirm`);
  },

  /**
   * Request a refill for a prescription
   */
  async requestRefill(
    medicationId: string,
    notes?: string
  ): Promise<ApiResponse<{ message: string }>> {
    return post<{ message: string }>('/portal/refill-request', {
      medicationId,
      notes,
    });
  },

  /**
   * Join telehealth appointment
   */
  async joinTelehealth(
    appointmentId: string
  ): Promise<ApiResponse<{ url: string }>> {
    return get<{ url: string }>(`/portal/appointments/${appointmentId}/telehealth`);
  },
};

export default appointmentsApi;
