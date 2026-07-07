import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import type { CreatePaymentInput, CreatePaymentResult, PaymentProvider, PaymentStatusValue } from "./types";

// Fas 1: kunden Swishar manuellt till vårt nummer med referenskoden i
// meddelandet. Providern skapar ingen betalning hos någon extern part –
// den returnerar bara instruktioner och lämnar betalningen PENDING tills
// en admin markerar den som betald i adminvyn.
export class ManualSwishProvider implements PaymentProvider {
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const settings = await getSettings();
    return {
      providerRef: input.reference,
      instructions: {
        amount: input.amount,
        phoneNumber: settings.swishPhone,
        reference: input.reference,
      },
      status: "PENDING",
    };
  }

  async getStatus(providerRef: string): Promise<PaymentStatusValue> {
    // Manuellt flöde: sanningen finns i vår egen databas.
    const payment = await db.payment.findFirst({
      where: { booking: { paymentReference: providerRef } },
      orderBy: { createdAt: "desc" },
    });
    return payment?.status ?? "ERROR";
  }
}
