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
