export declare class StripeService {
    createPaymentIntent(amount: number, currency?: string): Promise<{
        id: string;
        amount: number;
        currency: string;
        status: string;
        client_secret: string;
    }>;
    confirmPayment(paymentIntentId: string, paymentMethod: string): Promise<{
        id: string;
        status: string;
        charges: {
            data: {
                id: string;
                amount: number;
                receipt_url: string;
            }[];
        };
    }>;
    refundPayment(chargeId: string, amount?: number): Promise<{
        id: string;
        charge: string;
        amount: number;
        status: string;
    }>;
}
//# sourceMappingURL=stripe.service.d.ts.map