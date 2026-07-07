// Gränssnitt för betalproviders. Fas 1 använder ManualSwishProvider
// (admin bekräftar manuellt). Fas 2 kopplar in SwishPaymentProvider
// (Swish Handel-API, mTLS + callback) bakom SAMMA interface, så att
// bokningsflödet inte behöver skrivas om.

export type PaymentStatusValue = "PENDING" | "PAID" | "DECLINED" | "ERROR" | "REFUNDED";

export interface SwishInstructions {
  /** Belopp i ören. */
  amount: number;
  /** Telefonnummer kunden ska Swisha till. */
  phoneNumber: string;
  /** Referenskod kunden ska ange i Swish-meddelandet. */
  reference: string;
}

export interface CreatePaymentInput {
  bookingId: string;
  /** Belopp i ören. */
  amount: number;
  /** Bokningens payment_reference, t.ex. "GB-4F2A". */
  reference: string;
  payerPhone?: string;
}

export interface CreatePaymentResult {
  providerRef: string;
  instructions?: SwishInstructions;
  /** m-commerce-token eller QR-data (Fas 2). */
  qrOrToken?: string;
  status: PaymentStatusValue;
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getStatus(providerRef: string): Promise<PaymentStatusValue>;
}
