import { authAxios } from "@/lib/axios-config";

export interface CheckoutValidationResponse {
    success: boolean;
    redirectUrl?: string;
    orderId?: string;
}

export const marketPaymentService = {
    createWebpayTransaction: async (creatorSlug: string, items: { productId: string; quantity: number }[]) => {
        const response = await authAxios.post<{ token: string; url: string; orderId: string }>(
            `/market/${creatorSlug}/webpay/create`,
            { items }
        );
        return response.data;
    },

    createMercadoPagoCheckout: async (creatorSlug: string, items: { productId: string; quantity: number }[]) => {
        const response = await authAxios.post<{ initPoint: string; preferenceId: string; orderId: string }>(
            `/market/${creatorSlug}/mercadopago/create`,
            { items }
        );
        return response.data;
    },

    createPayPalOrder: async (creatorSlug: string, items: { productId: string; quantity: number }[]) => {
        const response = await authAxios.post<{ approveUrl: string; orderId: string }>(
            `/market/${creatorSlug}/paypal/create`,
            { items }
        );
        return response.data;
    },

    validateWebpay: async (creatorSlug: string, token: string) => {
        const response = await authAxios.post<{ status: string; order: any }>(
            `/market/${creatorSlug}/webpay/validate`,
            { token }
        );
        return response.data;
    }
};
