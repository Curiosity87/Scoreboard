import type { PaymentProviderKind } from "@prisma/client";
import { ManualSwishProvider } from "./manual-swish";
import { MockPaymentProvider } from "./mock";
import type { PaymentProvider } from "./types";

export type { PaymentProvider, PaymentStatusValue, SwishInstructions } from "./types";

// Väljs via env PAYMENT_PROVIDER. Fas 2 lägger till "swish" här
// (SwishPaymentProvider mot Swish Handel-API:t) utan att röra bokningskoden.
export function getPaymentProvider(): { provider: PaymentProvider; kind: PaymentProviderKind } {
  switch (process.env.PAYMENT_PROVIDER) {
    case "mock":
      return { provider: new MockPaymentProvider(), kind: "MOCK" };
    case "manual-swish":
    default:
      return { provider: new ManualSwishProvider(), kind: "MANUAL_SWISH" };
  }
}
