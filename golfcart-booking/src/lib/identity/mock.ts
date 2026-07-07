import { randomUUID } from "node:crypto";
import type { IdentityProvider, StartVerificationInput, StartVerificationResult, VerificationPollResult } from "./types";

// Dev-implementation: verifieringen lyckas direkt vid första poll.
export class MockIdentityProvider implements IdentityProvider {
  async startVerification(_input: StartVerificationInput): Promise<StartVerificationResult> {
    return { ref: randomUUID(), qr: "mock-qr-data" };
  }

  async poll(ref: string): Promise<VerificationPollResult> {
    return {
      status: "complete",
      person: { name: "Mock Person", subject: `mock-subject-${ref}` },
    };
  }
}
