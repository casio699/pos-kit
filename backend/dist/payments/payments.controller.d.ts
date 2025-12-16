import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPaymentIntent(createPaymentDto: CreatePaymentDto): Promise<{
        clientSecret: string | null;
        id: string;
    }>;
    getPaymentStatus(paymentIntentId: string): Promise<import("stripe").Stripe.Response<import("stripe").Stripe.PaymentIntent>>;
}
//# sourceMappingURL=payments.controller.d.ts.map