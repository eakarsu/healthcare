import { get, post, del } from '@/lib/api-client';
import {
  Payment,
  PatientBalance,
  Invoice,
  PaymentRequest,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

interface PaymentMethod {
  id: string;
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'ACH';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  isDefault: boolean;
}

interface SetupIntentResponse {
  clientSecret: string;
  publishableKey: string;
}

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export const paymentsApi = {
  /**
   * Get current balance
   */
  async getBalance(): Promise<ApiResponse<PatientBalance>> {
    return get<PatientBalance>('/portal/payments/balance');
  },

  /**
   * Get payment history
   */
  async getPaymentHistory(
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    return get<PaginatedResponse<Payment>>('/portal/payments/history', {
      page,
      pageSize,
    });
  },

  /**
   * Get all invoices
   */
  async getInvoices(
    status?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<Invoice>>> {
    return get<PaginatedResponse<Invoice>>('/portal/payments/invoices', {
      status,
      page,
      pageSize,
    });
  },

  /**
   * Get a single invoice by ID
   */
  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {
    return get<Invoice>(`/portal/payments/invoices/${id}`);
  },

  /**
   * Get invoice PDF download URL
   */
  async getInvoicePdfUrl(id: string): Promise<ApiResponse<{ url: string }>> {
    return get<{ url: string }>(`/portal/payments/invoices/${id}/pdf`);
  },

  /**
   * Get saved payment methods
   */
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return get<PaymentMethod[]>('/portal/payments/methods');
  },

  /**
   * Create setup intent for adding a new payment method
   */
  async createSetupIntent(): Promise<ApiResponse<SetupIntentResponse>> {
    return post<SetupIntentResponse>('/portal/payments/setup-intent');
  },

  /**
   * Save a new payment method (after Stripe confirmation)
   */
  async savePaymentMethod(
    paymentMethodId: string,
    setAsDefault: boolean = false
  ): Promise<ApiResponse<PaymentMethod>> {
    return post<PaymentMethod>('/portal/payments/methods', {
      paymentMethodId,
      setAsDefault,
    });
  },

  /**
   * Set a payment method as default
   */
  async setDefaultPaymentMethod(
    paymentMethodId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return post<{ success: boolean }>(
      `/portal/payments/methods/${paymentMethodId}/default`
    );
  },

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(
    paymentMethodId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return del<{ success: boolean }>(
      `/portal/payments/methods/${paymentMethodId}`
    );
  },

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    amount: number,
    invoiceId?: string
  ): Promise<ApiResponse<PaymentIntentResponse>> {
    return post<PaymentIntentResponse>('/portal/payments/create-intent', {
      amount,
      invoiceId,
    });
  },

  /**
   * Make a payment using saved payment method
   */
  async makePayment(
    request: PaymentRequest
  ): Promise<ApiResponse<Payment>> {
    return post<Payment>('/portal/payments/charge', request);
  },

  /**
   * Make a quick payment (for outstanding balance)
   */
  async makeQuickPayment(
    amount: number,
    paymentMethodId: string
  ): Promise<ApiResponse<Payment>> {
    return post<Payment>('/portal/payments/quick-pay', {
      amount,
      paymentMethodId,
    });
  },

  /**
   * Setup autopay
   */
  async setupAutopay(
    paymentMethodId: string,
    enabled: boolean
  ): Promise<ApiResponse<{ success: boolean }>> {
    return post<{ success: boolean }>('/portal/payments/autopay', {
      paymentMethodId,
      enabled,
    });
  },

  /**
   * Get autopay status
   */
  async getAutopayStatus(): Promise<
    ApiResponse<{
      enabled: boolean;
      paymentMethodId?: string;
      nextPaymentDate?: string;
    }>
  > {
    return get('/portal/payments/autopay');
  },

  /**
   * Get payment receipt
   */
  async getReceipt(paymentId: string): Promise<ApiResponse<{ url: string }>> {
    return get<{ url: string }>(`/portal/payments/${paymentId}/receipt`);
  },

  /**
   * Request payment plan
   */
  async requestPaymentPlan(
    totalAmount: number,
    monthlyAmount: number,
    startDate: string
  ): Promise<ApiResponse<{ requestId: string; message: string }>> {
    return post('/portal/payments/payment-plan-request', {
      totalAmount,
      monthlyAmount,
      startDate,
    });
  },
};

export default paymentsApi;
