import { RawSms, parseSmsToEvent, cleanBody } from './bankParsers';
import { categorizeEvent } from './categorizer';
import { deduplicateEvents } from './deduplicator';
import { buildSpendSnapshot } from './accounting';
import { FinancialEvent, SpendSnapshot } from '../types';

export function parseSmsXml(
  xmlText: string, 
  selectedPeriodKey: string = '2026-08'
): { events: FinancialEvent[]; snapshot: SpendSnapshot; rawCount: number } {
  const rawSmsList: RawSms[] = [];

  // Fast & robust Regex-based XML Tag Extraction (handles multi-line bodies, quotes, and encoded XML entities)
  const smsTagRegex = /<sms\s+([^>]+)\/>/gi;
  const attrRegex = /(\w+)="([^"]*)"/g;

  let match;
  while ((match = smsTagRegex.exec(xmlText)) !== null) {
    const attrStr = match[1];
    const attrs: Record<string, string> = {};
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2];
    }

    const address = attrs.address || attrs.sender || 'SMS';
    const body = cleanBody(attrs.body || '');
    const dateStr = attrs.date || `${Date.now()}`;
    const date = parseInt(dateStr, 10) || Date.now();

    if (body) {
      rawSmsList.push({ address, body, date });
    }
  }

  // Fallback: If no single-line <sms ... /> matched, try DOMParser
  if (rawSmsList.length === 0) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const smsElements = xmlDoc.getElementsByTagName('sms');
      for (let i = 0; i < smsElements.length; i++) {
        const el = smsElements[i];
        const address = el.getAttribute('address') || '';
        const body = cleanBody(el.getAttribute('body') || '');
        const dateStr = el.getAttribute('date') || `${Date.now()}`;
        const date = parseInt(dateStr, 10) || Date.now();
        if (body) {
          rawSmsList.push({ address, body, date });
        }
      }
    } catch {
      // ignore
    }
  }

  // 1. Parse raw SMS to candidate financial events
  const candidateEvents: FinancialEvent[] = [];
  for (const raw of rawSmsList) {
    const ev = parseSmsToEvent(raw);
    if (ev) {
      const { category, economicType } = categorizeEvent(ev);
      ev.category = category;
      ev.economicType = economicType;
      candidateEvents.push(ev);
    }
  }

  // 2. Deduplicate multi-channel SMS
  const canonicalEvents = deduplicateEvents(candidateEvents);

  // 3. Generate mathematical SpendSnapshot for selected period
  const snapshot = buildSpendSnapshot(canonicalEvents, rawSmsList.length, selectedPeriodKey);

  return {
    events: canonicalEvents,
    snapshot,
    rawCount: rawSmsList.length,
  };
}
