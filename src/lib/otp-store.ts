// Simple in-memory OTP store (replace with Redis/database in production)
export interface OTPData {
  otp: string;
  expiresAt: number;
}

class OTPStore {
  private store = new Map<string, OTPData>();

  set(email: string, data: OTPData): void {
    this.store.set(email.toLowerCase(), data);
  }

  get(email: string): OTPData | undefined {
    return this.store.get(email.toLowerCase());
  }

  delete(email: string): void {
    this.store.delete(email.toLowerCase());
  }

  cleanup(): void {
    const now = Date.now();
    for (const [email, data] of this.store.entries()) {
      if (data.expiresAt < now) {
        this.store.delete(email);
      }
    }
  }
}

export const otpStore = new OTPStore();

// Cleanup expired OTPs every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => otpStore.cleanup(), 5 * 60 * 1000);
}
