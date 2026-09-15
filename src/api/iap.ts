/**
 * TODO: Real IAP (App Store / Play Billing)
 * - Products: `crew_pass_monthly` (~€6.99–€8.99) and `extra_join` (~€2.49–€3.99).
 * - Use StoreKit 2 / Play Billing via expo-iap or react-native-iap — not Stripe in-app.
 * - Server-side receipt validation on a tiny backend; restore purchases on Profile.
 * - Entitlement = unlimited joins for the period; extra_join adds one credit.
 * v1: local flag only. No charges. No secrets.
 */

export type IapProductId = 'crew_pass_monthly' | 'extra_join';

export const IAP_COPY = {
  passPrice: '€7.99 / month',
  joinPrice: '€2.49 a join',
  honest: 'covers hosting + a bit to keep building.',
} as const;

export async function purchaseMock(product: IapProductId): Promise<{ ok: true; product: IapProductId }> {
  // TODO: replace with real IAP purchase flow.
  return { ok: true, product };
}
