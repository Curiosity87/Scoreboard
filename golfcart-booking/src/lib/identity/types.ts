// Gränssnitt för identitetsverifiering. Fas 1 använder bara e-post +
// lösenord (ingen provider alls). Fas 3 kopplar in BankID – i första hand
// via en broker (Criipto/Signicat, OpenID Connect som Auth.js-provider),
// alternativt direkt mot BankID API v6 (mTLS, animerad QR / autostart-token).

export interface StartVerificationInput {
  /** "qr" = annan enhet (animerad QR), "autostart" = samma enhet. */
  flow: "qr" | "autostart";
}

export interface StartVerificationResult {
  ref: string;
  qr?: string;
  autostartToken?: string;
}

export interface VerificationPollResult {
  status: "pending" | "complete" | "failed";
  person?: {
    name: string;
    /** Stabilt subject/uuid från BankID – lagras i users.bankid_subject. */
    subject: string;
  };
}

export interface IdentityProvider {
  startVerification(input: StartVerificationInput): Promise<StartVerificationResult>;
  poll(ref: string): Promise<VerificationPollResult>;
}
