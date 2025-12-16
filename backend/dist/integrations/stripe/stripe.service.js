"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
let StripeService = class StripeService {
    async createPaymentIntent(amount, currency = 'usd') {
        return {
            id: 'pi_' + Math.random().toString(36).substr(2, 9),
            amount,
            currency,
            status: 'requires_payment_method',
            client_secret: 'pi_secret_' + Math.random().toString(36).substr(2, 20),
        };
    }
    async confirmPayment(paymentIntentId, paymentMethod) {
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
    async refundPayment(chargeId, amount) {
        return {
            id: 're_' + Math.random().toString(36).substr(2, 9),
            charge: chargeId,
            amount: amount || 1000,
            status: 'succeeded',
        };
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)()
], StripeService);
//# sourceMappingURL=stripe.service.js.map