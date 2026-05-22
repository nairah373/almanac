import { PLATFORM_COMMISSION_RATE } from "@/lib/constants";

/** Split a paid amount into the platform fee and the creator's earning. */
export function splitAmount(amountInPaise: number): {
  amountInPaise: number;
  platformFeeInPaise: number;
  creatorEarningInPaise: number;
} {
  const platformFeeInPaise = Math.round(amountInPaise * PLATFORM_COMMISSION_RATE);
  return {
    amountInPaise,
    platformFeeInPaise,
    creatorEarningInPaise: amountInPaise - platformFeeInPaise,
  };
}
