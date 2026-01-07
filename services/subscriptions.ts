import { apiAxios } from "@/lib/axios-config";

// Tipos para las respuestas de la API
export interface BillingCycle {
  id: string;
  name: string;
  slug: string;
  intervalType: "day" | "week" | "month" | "year";
  intervalCount: number;
}

export interface Price {
  id: string;
  currency: "CLP" | "USD";
  amount: number;
  billingCycle: BillingCycle;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  prices: Price[];
}

export interface PlansResponse {
  plans: Plan[];
}

export interface CreateSubscriptionDto {
  planId: string;
  billingCycleId: string;
  currency?: string;
  paymentMethod?: "mercadopago" | "paypal";
  payerEmail?: string;
  payerFirstName?: string;
  payerLastName?: string;
  payerIdentificationType?: string;
  payerIdentificationNumber?: string;
  backUrl?: string;
}

export interface SubscriptionResponse {
  id: string;
  status: "active" | "cancelled" | "expired" | "paused" | "payment_failed";
  mercadoPagoSubscriptionId?: string;
  initPoint?: string;
  url?: string;
  webpayToken?: string;
  message: string;
}

export interface CreateWebpayTransactionDto {
  planId: string;
  billingCycleId: string;
  currency?: string;
  subscriptionId?: string;
}

export interface CreateWebpayTransactionResponse {
  token: string;
  url: string;
  subscriptionId: string;
}

export interface ValidateWebpayPaymentDto {
  token: string;
}

export interface ValidateWebpayPaymentResponse {
  success: boolean;
  subscription?: UserSubscription;
  redirectUrl?: string;
}

export interface CreatePayPalOrderDto {
  planId: string;
  billingCycleId: string;
  currency?: string;
  subscriptionId?: string;
}

export interface CreatePayPalOrderResponse {
  orderId: string;
  approveUrl: string;
  subscriptionId: string;
}

export interface ValidatePayPalPaymentDto {
  orderId: string;
}

export interface ValidatePayPalPaymentResponse {
  success: boolean;
  subscription?: UserSubscription;
  redirectUrl?: string;
}

export interface CreateMercadoPagoCheckoutDto {
  planId: string;
  billingCycleId: string;
  currency?: string;
  subscriptionId?: string;
}

export interface CreateMercadoPagoCheckoutResponse {
  preferenceId: string;
  initPoint: string;
  subscriptionId: string;
}

export interface ValidateMercadoPagoPaymentDto {
  paymentId: string;
}

export interface ValidateMercadoPagoPaymentResponse {
  success: boolean;
  subscription?: UserSubscription;
  redirectUrl?: string;
}

export interface UserSubscription {
  id: string;
  status: string;
  startedAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt?: string;
  autoRenew: boolean;
  cancellationReason?: string;
  mercadoPagoSubscriptionId?: string;
  plan: Plan;
  billingCycle: BillingCycle;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPayment {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod?: string;
  paymentProvider?: string;
  transactionId?: string;
  periodStart: string;
  periodEnd: string;
  paidAt?: string;
  createdAt: string;
}

export interface CancelSubscriptionResponse {
  message: string;
  subscription: UserSubscription;
}

// GET /subscriptions/plans - Obtener planes de suscripción
export const getPlans = async (): Promise<PlansResponse> => {
  const response = await apiAxios.get<PlansResponse>("/subscriptions/plans");

  return response.data;
};

// GET /subscriptions/current - Obtener suscripción actual del usuario
export const getUserSubscription = async (): Promise<UserSubscription | null> => {
  const response = await apiAxios.get<UserSubscription | null>(`/subscriptions/current`);
  return response.data;
};

// PUT /subscriptions/prices/:id - Actualizar precio
export const updatePrice = async (
  priceId: string,
  amount: number,
): Promise<Price> => {
  const response = await apiAxios.put<Price>(`/subscriptions/prices/${priceId}`, {
    amount,
  });

  return response.data;
};

// POST /subscriptions/subscribe - Crear suscripción
export const createSubscription = async (
  data: CreateSubscriptionDto,
): Promise<SubscriptionResponse> => {
  const response = await apiAxios.post<SubscriptionResponse>(
    "/subscriptions/subscribe",
    data,
  );

  return response.data;
};

// POST /subscriptions/cancel - Cancelar suscripción
export const cancelSubscription = async (
  reason?: string,
): Promise<CancelSubscriptionResponse> => {
  const response = await apiAxios.post<CancelSubscriptionResponse>(
    "/subscriptions/cancel",
    { reason },
  );

  return response.data;
};

// GET /subscriptions/payments - Obtener historial de pagos
export const getPayments = async (): Promise<{
  payments: SubscriptionPayment[];
}> => {
  const response = await apiAxios.get<{ payments: SubscriptionPayment[] }>(
    "/subscriptions/payments",
  );

  return response.data;
};

// Tipos para el endpoint de miembros
export interface MemberSubscription {
  id: string;
  planName: string;
  status: "active" | "cancelled" | "expired" | "paused";
  startedAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  subscription: MemberSubscription | null;
  progress: number;
  totalPaid: number;
  currency: string;
}

export interface MembersStats {
  total: number;
  active: number;
  cancelled: number;
  monthlyRevenue: number;
}

export interface GetMembersParams {
  search?: string;
  status?: "active" | "cancelled" | "expired" | "paused";
}

export interface MembersResponse {
  stats: MembersStats;
  members: Member[];
  total: number;
}

// GET /subscriptions/members - Obtener miembros con filtros opcionales
export const getMembers = async (
  params?: GetMembersParams,
): Promise<MembersResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.search) {
    queryParams.append("search", params.search);
  }

  if (params?.status) {
    queryParams.append("status", params.status);
  }

  const queryString = queryParams.toString();
  const url = `/subscriptions/members${queryString ? `?${queryString}` : ""}`;

  const response = await apiAxios.get<MembersResponse>(url);

  return response.data;
};

// POST /subscriptions/webpay/create - Crear transacción WebPay
export const createWebpayTransaction = async (
  data: CreateWebpayTransactionDto,
): Promise<CreateWebpayTransactionResponse> => {
  const response = await apiAxios.post<CreateWebpayTransactionResponse>(
    "/subscriptions/webpay/create",
    data,
  );

  return response.data;
};

// POST /subscriptions/webpay/validate - Validar pago WebPay
export const validateWebpayPayment = async (
  token: string,
  subscriptionId?: string,
): Promise<ValidateWebpayPaymentResponse> => {
  const response = await apiAxios.post<ValidateWebpayPaymentResponse>(
    `/subscriptions/webpay/validate${subscriptionId ? `?subscriptionId=${subscriptionId}` : ""}`,
    { token },
  );

  return response.data;
};

// POST /subscriptions/paypal/create - Crear orden PayPal
export const createPayPalOrder = async (
  data: CreatePayPalOrderDto,
): Promise<CreatePayPalOrderResponse> => {
  const response = await apiAxios.post<CreatePayPalOrderResponse>(
    "/subscriptions/paypal/create",
    data,
  );

  return response.data;
};

// POST /subscriptions/paypal/validate - Validar pago PayPal
export const validatePayPalPayment = async (
  orderId: string,
  subscriptionId?: string,
): Promise<ValidatePayPalPaymentResponse> => {
  const response = await apiAxios.post<ValidatePayPalPaymentResponse>(
    `/subscriptions/paypal/validate${subscriptionId ? `?subscriptionId=${subscriptionId}` : ""}`,
    { orderId },
  );

  return response.data;
};

// POST /subscriptions/mercadopago/create - Crear checkout Mercado Pago
export const createMercadoPagoCheckout = async (
  data: CreateMercadoPagoCheckoutDto,
): Promise<CreateMercadoPagoCheckoutResponse> => {
  const response = await apiAxios.post<CreateMercadoPagoCheckoutResponse>(
    "/subscriptions/mercadopago/create",
    data,
  );

  return response.data;
};

// POST /subscriptions/mercadopago/validate - Validar pago Mercado Pago
export const validateMercadoPagoPayment = async (
  paymentId: string,
  subscriptionId?: string,
): Promise<ValidateMercadoPagoPaymentResponse> => {
  const response = await apiAxios.post<ValidateMercadoPagoPaymentResponse>(
    `/subscriptions/mercadopago/validate${subscriptionId ? `?subscriptionId=${subscriptionId}` : ""}`,
    { paymentId },
  );

  return response.data;
};

export interface PaymentDetails {
  type: 'payment' | 'subscription';
  id: string;
  amount: number;
  currency: string;
  status: string;
  planName: string;
  billingCycle: string;
  userEmail: string;
  userName?: string;
  createdAt: string;
  subscriptionId: string;
}

export const getPaymentDetails = async (id: string): Promise<PaymentDetails> => {
  const response = await apiAxios.get<PaymentDetails>(`/subscriptions/payment-details/${id}`);
  return response.data;
};
