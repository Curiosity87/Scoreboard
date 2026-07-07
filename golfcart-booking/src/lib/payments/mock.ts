import type { CreatePaymentInput, CreatePaymentResult, PaymentProvider, PaymentStatusValue } from "./types";

// Endast för lokala tester: betalningen "godkänns" direkt vid statusfråga.
export class MockPaymentProvider implements PaymentProvider {
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    return {
      providerRef: `mock-${input.reference}`,
      instructions: {
        amount: input.amount,
        phoneNumber: "000-000 00 00",
        reference: input.reference,
      },
      status: "PENDING",
    };
  }

  async getStatus(): Promise<PaymentStatusValue> {
    return "PAID";
  }
}
