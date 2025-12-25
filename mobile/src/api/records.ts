import { get } from '@/lib/api-client';
import {
  Patient,
  Encounter,
  Allergy,
  Medication,
  Condition,
  LabResult,
  Document,
  Vitals,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

interface ImmunizationRecord {
  id: string;
  vaccineName: string;
  vaccineCode?: string;
  dateAdministered: string;
  lotNumber?: string;
  administeredBy?: string;
  site?: string;
  route?: string;
  doseNumber?: number;
  seriesComplete?: boolean;
  notes?: string;
}

interface ProcedureHistory {
  id: string;
  code: string;
  description: string;
  date: string;
  provider?: string;
  location?: string;
  notes?: string;
}

export const recordsApi = {
  /**
   * Get patient profile and demographics
   */
  async getPatientProfile(): Promise<ApiResponse<Patient>> {
    return get<Patient>('/portal/profile');
  },

  /**
   * Get health summary (overview of all health info)
   */
  async getHealthSummary(): Promise<
    ApiResponse<{
      allergies: Allergy[];
      medications: Medication[];
      conditions: Condition[];
      recentVitals?: Vitals;
      upcomingAppointments: number;
      unreadMessages: number;
    }>
  > {
    return get('/portal/health-summary');
  },

  /**
   * Get all encounters/visits
   */
  async getEncounters(
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Encounter>>> {
    return get<PaginatedResponse<Encounter>>('/portal/encounters', {
      page,
      pageSize,
    });
  },

  /**
   * Get a single encounter by ID
   */
  async getEncounter(id: string): Promise<ApiResponse<Encounter>> {
    return get<Encounter>(`/portal/encounters/${id}`);
  },

  /**
   * Get all allergies
   */
  async getAllergies(): Promise<ApiResponse<Allergy[]>> {
    return get<Allergy[]>('/portal/allergies');
  },

  /**
   * Get all medications
   */
  async getMedications(): Promise<ApiResponse<Medication[]>> {
    return get<Medication[]>('/portal/medications');
  },

  /**
   * Get active medications only
   */
  async getActiveMedications(): Promise<ApiResponse<Medication[]>> {
    return get<Medication[]>('/portal/medications', { status: 'ACTIVE' });
  },

  /**
   * Get all conditions/diagnoses
   */
  async getConditions(): Promise<ApiResponse<Condition[]>> {
    return get<Condition[]>('/portal/conditions');
  },

  /**
   * Get lab results
   */
  async getLabResults(
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<LabResult>>> {
    return get<PaginatedResponse<LabResult>>('/portal/lab-results', {
      page,
      pageSize,
    });
  },

  /**
   * Get a single lab result by ID
   */
  async getLabResult(id: string): Promise<ApiResponse<LabResult>> {
    return get<LabResult>(`/portal/lab-results/${id}`);
  },

  /**
   * Get immunization records
   */
  async getImmunizations(): Promise<ApiResponse<ImmunizationRecord[]>> {
    return get<ImmunizationRecord[]>('/portal/immunizations');
  },

  /**
   * Get procedure history
   */
  async getProcedureHistory(
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<ProcedureHistory>>> {
    return get<PaginatedResponse<ProcedureHistory>>('/portal/procedures', {
      page,
      pageSize,
    });
  },

  /**
   * Get vitals history
   */
  async getVitalsHistory(
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<Vitals & { date: string }>>> {
    return get<PaginatedResponse<Vitals & { date: string }>>('/portal/vitals', {
      page,
      pageSize,
    });
  },

  /**
   * Get most recent vitals
   */
  async getLatestVitals(): Promise<ApiResponse<Vitals & { date: string }>> {
    return get<Vitals & { date: string }>('/portal/vitals/latest');
  },

  /**
   * Get all documents
   */
  async getDocuments(
    category?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<Document>>> {
    return get<PaginatedResponse<Document>>('/portal/documents', {
      category,
      page,
      pageSize,
    });
  },

  /**
   * Get document download URL
   */
  async getDocumentUrl(id: string): Promise<ApiResponse<{ url: string }>> {
    return get<{ url: string }>(`/portal/documents/${id}/download`);
  },

  /**
   * Get care team (providers)
   */
  async getCareTeam(): Promise<
    ApiResponse<
      {
        id: string;
        name: string;
        specialty?: string;
        role: string;
        phone?: string;
        email?: string;
      }[]
    >
  > {
    return get('/portal/care-team');
  },

  /**
   * Get family history
   */
  async getFamilyHistory(): Promise<
    ApiResponse<
      {
        id: string;
        relationship: string;
        condition: string;
        ageAtOnset?: number;
        deceased?: boolean;
        notes?: string;
      }[]
    >
  > {
    return get('/portal/family-history');
  },

  /**
   * Get social history
   */
  async getSocialHistory(): Promise<
    ApiResponse<{
      smokingStatus?: string;
      alcoholUse?: string;
      drugUse?: string;
      occupation?: string;
      exerciseFrequency?: string;
      dietType?: string;
      notes?: string;
    }>
  > {
    return get('/portal/social-history');
  },
};

export default recordsApi;
