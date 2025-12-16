import { Injectable } from '@nestjs/common';

@Injectable()
export class StripeService {
  async createPaymentIntent(amount: number, currency: string = 'usd') {
    return {
      id: 'pi_' + Math.random().toString(36).substr(2, 9),
      amount,
      currency,
      status: 'requires_payment_method',
      client_secret: 'pi_secret_' + Math.random().toString(36).substr(2, 20),
    };
  }

  async confirmPayment(paymentIntentId: string, paymentMethod: string) {
    return {
      id: paymentIntentId,
      status: 'succeeded',
      charges: {
        data: [
          {
            id: 'ch_' + Math.random().toString(36).substr(2, 9),
            amount: 1000,
            receipt_url: 'https://receipts.stripe.com/...',
          },
        ],
      },
    };
  }

  async refundPayment(chargeId: string, amount?: number) {
    return {
      id: 're_' + Math.random().toString(36).substr(2, 9),
      charge: chargeId,
      amount: amount || 1000,
      status: 'succeeded',
    };
  }
}
