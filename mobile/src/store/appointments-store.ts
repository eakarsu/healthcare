import { create } from 'zustand';
import { Appointment, AppointmentType, Provider, Location } from '@/types';
import { appointmentsApi } from '@/api';

interface AppointmentsState {
  appointments: Appointment[];
  upcomingAppointments: Appointment[];
  appointmentTypes: AppointmentType[];
  providers: Provider[];
  locations: Location[];
  selectedAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
}

interface AppointmentsActions {
  fetchUpcomingAppointments: () => Promise<void>;
  fetchAppointmentTypes: () => Promise<void>;
  fetchProviders: () => Promise<void>;
  fetchLocations: () => Promise<void>;
  fetchAppointment: (id: string) => Promise<void>;
  bookAppointment: (
    providerId: string,
    locationId: string,
    appointmentTypeId: string,
    date: string,
    time: string,
    reason?: string
  ) => Promise<boolean>;
  cancelAppointment: (id: string, reason?: string) => Promise<boolean>;
  confirmAppointment: (id: string) => Promise<boolean>;
  setSelectedAppointment: (appointment: Appointment | null) => void;
  clearError: () => void;
  refresh: () => Promise<void>;
}

const initialState: AppointmentsState = {
  appointments: [],
  upcomingAppointments: [],
  appointmentTypes: [],
  providers: [],
  locations: [],
  selectedAppointment: null,
  isLoading: false,
  error: null,
};

export const useAppointmentsStore = create<AppointmentsState & AppointmentsActions>(
  (set, get) => ({
    ...initialState,

    fetchUpcomingAppointments: async () => {
      set({ isLoading: true, error: null });

      const response = await appointmentsApi.getUpcomingAppointments();

      if (response.success && response.data) {
        set({ upcomingAppointments: response.data, isLoading: false });
      } else {
        set({ error: response.error || 'Failed to fetch appointments', isLoading: false });
      }
    },

    fetchAppointmentTypes: async () => {
      const response = await appointmentsApi.getAppointmentTypes();

      if (response.success && response.data) {
        set({ appointmentTypes: response.data });
      }
    },

    fetchProviders: async () => {
      const response = await appointmentsApi.getProviders();

      if (response.success && response.data) {
        set({ providers: response.data });
      }
    },

    fetchLocations: async () => {
      const response = await appointmentsApi.getLocations();

      if (response.success && response.data) {
        set({ locations: response.data });
      }
    },

    fetchAppointment: async (id: string) => {
      set({ isLoading: true, error: null });

      const response = await appointmentsApi.getAppointment(id);

      if (response.success && response.data) {
        set({ selectedAppointment: response.data, isLoading: false });
      } else {
        set({ error: response.error || 'Failed to fetch appointment', isLoading: false });
      }
    },

    bookAppointment: async (
      providerId: string,
      locationId: string,
      appointmentTypeId: string,
      date: string,
      time: string,
      reason?: string
    ) => {
      set({ isLoading: true, error: null });

      const response = await appointmentsApi.bookAppointment({
        providerId,
        locationId,
        appointmentTypeId,
        date,
        time,
        reason,
      });

      if (response.success && response.data) {
        const { upcomingAppointments } = get();
        set({
          upcomingAppointments: [...upcomingAppointments, response.data],
          isLoading: false,
        });
        return true;
      }

      set({ error: response.error || 'Failed to book appointment', isLoading: false });
      return false;
    },

    cancelAppointment: async (id: string, reason?: string) => {
      set({ isLoading: true, error: null });

      const response = await appointmentsApi.cancelAppointment(id, reason);

      if (response.success) {
        const { upcomingAppointments } = get();
        set({
          upcomingAppointments: upcomingAppointments.filter((a) => a.id !== id),
          isLoading: false,
        });
        return true;
      }

      set({ error: response.error || 'Failed to cancel appointment', isLoading: false });
      return false;
    },

    confirmAppointment: async (id: string) => {
      set({ isLoading: true, error: null });

      const response = await appointmentsApi.confirmAppointment(id);

      if (response.success && response.data) {
        const { upcomingAppointments } = get();
        set({
          upcomingAppointments: upcomingAppointments.map((a) =>
            a.id === id ? response.data! : a
          ),
          isLoading: false,
        });
        return true;
      }

      set({ error: response.error || 'Failed to confirm appointment', isLoading: false });
      return false;
    },

    setSelectedAppointment: (appointment: Appointment | null) => {
      set({ selectedAppointment: appointment });
    },

    clearError: () => set({ error: null }),

    refresh: async () => {
      await get().fetchUpcomingAppointments();
    },
  })
);

export default useAppointmentsStore;
