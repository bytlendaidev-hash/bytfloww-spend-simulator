import { FinancialEvent } from '../types';

export function generateFingerprint(event: FinancialEvent): string {
  // Normalize reference number or use composite signature of (amount, 5-minute bucket, account, merchant)
  if (event.referenceNumber && event.referenceNumber.length >= 6) {
    return `ref_${event.referenceNumber}_${Math.round(event.amount)}`;
  }
  const timeBucket = Math.floor(event.timestamp / (5 * 60 * 1000));
  const normMerchant = event.merchant.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
  const normAccount = event.accountHint || 'X';
  return `fp_${Math.round(event.amount)}_${timeBucket}_${normAccount}_${normMerchant}`;
}

export function deduplicateEvents(events: FinancialEvent[]): FinancialEvent[] {
  const seenFingerprints = new Set<string>();
  const canonicalEvents: FinancialEvent[] = [];

  for (const ev of events) {
    const fp = generateFingerprint(ev);
    ev.transactionFingerprint = fp;

    if (!seenFingerprints.has(fp)) {
      seenFingerprints.add(fp);
      canonicalEvents.push(ev);
    }
  }

  // Sort descending chronologically
  return canonicalEvents.sort((a, b) => b.timestamp - a.timestamp);
}
