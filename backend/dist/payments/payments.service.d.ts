import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsService {
    private configService;
    private stripe;
    constructor(configService: ConfigService);
    createPaymentIntent(createPaymentDto: CreatePaymentDto): Promise<{
        clientSecret: string | null;
        id: string;
    }>;
    getPaymentStatus(paymentIntentId: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
}
//# sourceMappingURL=payments.service.d.ts.map