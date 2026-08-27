/**
 * Universal UPI & P2P Counterparty Forensic Intelligence Engine
 * =============================================================
 * Industry-grade clustering, aggregation, and classification of all:
 *   - Person-to-Person (P2P) transfers (Friends, Family, Colleagues)
 *   - Self-transfers & Internal Account Sweeps
 *   - Merchant & E-Commerce payments (Swiggy, Zomato, Amazon, Blinkit, Uber, etc.)
 *   - Crypto & Trading exchange deposits (Binance, WazirX, CoinDCX, Mudrex, Groww, Zerodha, Upstox)
 *   - Digital Lenders & NBFC debt flows (mPokket, Vivifi, KreditBee, Cashe, Prefr, etc.)
 *   - Utility & Telecom bills (Airtel Payments Bank, Jio, Electricity, Fastag, LIC)
 *
 * Provides multi-VPA unification under canonical person entities, reciprocal balance analysis,
 * and comprehensive audit sorting by latest date, gross amount, net flow, and name.
 */

import { CanonicalTransaction } from '../types';

export type CounterpartyCategory = 
  | 'P2P_CONTACT'
  | 'SELF_TRANSFER'
  | 'MERCHANT_COMMERCE'
  | 'CRYPTO_INVESTMENT'
  | 'LENDER_NBFC'
  | 'UTILITY_BILL'
  | 'EMPLOYER_PAYROLL'
  | 'INSTITUTIONAL_OTHER';

export interface CounterpartyCluster {
  id: string;
  displayName: string;
  vpas: string[];
  primaryVpa: string | null;
  category: CounterpartyCategory;
  categoryLabel: string;
  icon: string;
  totalSent: number;         // Debits (outflow)
  totalReceived: number;     // Credits (inflow)
  netFlow: number;           // totalReceived - totalSent (+ = Net Creditor, - = Net Debtor)
  grossVolume: number;       // totalSent + totalReceived
  txnCount: number;
  sentCount: number;
  receivedCount: number;
  averageTxn: number;
  largestTxn: number;
  smallestTxn: number;
  firstDate: string;
  latestDate: string;
  reciprocalRatio: number;   // 0 to 100% reciprocity
  posture: 'NET_CREDITOR' | 'NET_DEBTOR' | 'RECIPROCATED_BALANCED';
  transactions: CanonicalTransaction[];
}

export interface P2PForensicSummary {
  totalGrossVolume: number;
  totalSentToPeers: number;
  totalReceivedFromPeers: number;
  netPeerBalance: number;
  uniquePeerCount: number;
  totalSelfTransferVolume: number;
  selfTransferCount: number;
  totalMerchantVolume: number;
  totalCryptoVolume: number;
  clusters: CounterpartyCluster[];
}

// ── KEYWORD DICTIONARIES ──────────────────────────────────────────────────────

const CRYPTO_INVESTMENT_KEYWORDS = [
  'BINANCE', 'WAZIRX', 'COINDCX', 'MUDREX', 'ZEBPAY', 'GROWW', 'ZERODHA', 
  'UPSTOX', 'ANGELONE', 'ANGEL ONE', 'COINSWITCH', 'KUDOS', 'BITCOIN', 'CRYPTO',
  'VAULD', 'COINBASE', 'KRAKEN', 'KUCOIN', 'OKX', 'BITBNS', 'BYBIT', '5PAISA',
  'SHAREKHAN', 'MOTILAL OSWAL', 'INDMONEY', 'SMALLCASE'
];

const LENDER_NBFC_KEYWORDS = [
  'MPOKKET', 'VIVIFI', 'FLEXSALARY', 'KREDITBEE', 'CASHE', 'PREFR', 'MONEYVIEW', 
  'RING', 'NAVI', 'BRANCH', 'TALA', 'TALAZEN', 'LENDINGPLATE', 'RUPEEK', 'FIBE', 
  'EARLYSALARY', 'SALARYNOW', 'SALARY NOW', 'ZED LEAFIN', 'GROW MONEY', 'MEGHDOOT', 
  'KASAR', 'LENDINGKART', 'AVINASH', 'POONAWALLA', 'PIRAMAL', 'FULLERTON', 
  'CHOLAMANDALAM', 'MUTHOOT', 'MANAPPURAM', 'BAJAJ FINANCE', 'TATA CAPITAL',
  'HOME CREDIT', 'DMI FINANCE', 'SMARTCOIN', 'FINZOOM', 'KRAZYBEE', 'PAYME'
];

const MERCHANT_COMMERCE_KEYWORDS = [
  'SWIGGY', 'ZOMATO', 'AMAZON', 'FLIPKART', 'BLINKIT', 'ZEPTO', 'INSTAMART', 
  'BIGBASKET', 'DMART', 'D-MART', 'UBER', 'OLA', 'RAPIDO', 'IRCTC', 'NETFLIX', 
  'SPOTIFY', 'HOTSTAR', 'MAKEMYTRIP', 'GOIBIBO', 'BOOKMYSHOW', 'MYNTRA', 'AJIO', 
  'NYKAA', 'TATA 1MG', 'APOLLO', 'PHARMEASY', 'DOMINOS', 'MCDONALDS', 'KFC', 
  'STARBUCKS', 'RELIANCE', 'DECATHLON', 'LENSKART', 'PVR', 'INOX', 'CULTURE',
  'CULT FIT', 'URBAN COMPANY', 'URBANCLAP', 'BBDAILY', 'DUNZO', 'MEESHO', 'TATA CLIQ'
];

const UTILITY_BILL_KEYWORDS = [
  'AIRTEL', 'JIO', 'VODAFONE', 'VI', 'BSNL', 'BESCOM', 'UPPCL', 'TNEB', 'TSSPDCL', 
  'MAHADISCOM', 'LIC', 'LIFE INSURANCE', 'FASTAG', 'HPCL', 'BPCL', 'IOCL', 
  'PAYTM FASTAG', 'ICICI FASTAG', 'CYLINDER', 'GAS', 'WATER', 'ELECTRICITY', 
  'MUNICIPAL', 'CHALLAN', 'TOLL', 'BROADBAND', 'TATASKY', 'DISH TV', 'SUN DIRECT'
];

const SELF_TRANSFER_KEYWORDS = [
  'SELF PAY', 'SELF TRF', 'SELF TRANSFER', 'TO OWN ACCOUNT', 'OWN A/C', 
  'WALLET TO BANK', 'WALLETMONEYTOBANK', 'SWEEP', '8400869600'
];

const CORPORATE_EMPLOYER_KEYWORDS = [
  'LIMITED', 'LIMITE', 'LTD', 'PVT LTD', 'PVTLTD', 'PRIVATE LIMITED', 
  'TECHNOLOGIES', 'TECH NOLOGIES', 'SOLUTIONS', 'SERVICES', 'INFOTECH', 
  'SOFTWARE', 'CORP', 'CORPORATION', 'INC', 'INCORPORATED', 'HOLDINGS'
];

// ── CLASSIFIER HELPER ─────────────────────────────────────────────────────────

export function classifyCounterpartyCategory(
  name: string,
  vpa: string | null,
  narration: string,
  isSalary: boolean = false
): { category: CounterpartyCategory; label: string; icon: string } {
  if (isSalary) {
    return { category: 'EMPLOYER_PAYROLL', label: 'Corporate Employer', icon: '💼' };
  }

  const u = `${name} ${vpa || ''} ${narration}`.toUpperCase();

  if (SELF_TRANSFER_KEYWORDS.some((k) => u.includes(k))) {
    return { category: 'SELF_TRANSFER', label: 'Self Transfer / Sweep', icon: '🔄' };
  }
  if (CRYPTO_INVESTMENT_KEYWORDS.some((k) => u.includes(k))) {
    return { category: 'CRYPTO_INVESTMENT', label: 'Crypto & Investment', icon: '🪙' };
  }
  if (LENDER_NBFC_KEYWORDS.some((k) => u.includes(k))) {
    return { category: 'LENDER_NBFC', label: 'Digital Lender / Debt', icon: '🏦' };
  }
  if (MERCHANT_COMMERCE_KEYWORDS.some((k) => u.includes(k))) {
    return { category: 'MERCHANT_COMMERCE', label: 'Merchant & Commerce', icon: '🛍️' };
  }
  if (UTILITY_BILL_KEYWORDS.some((k) => u.includes(k))) {
    return { category: 'UTILITY_BILL', label: 'Utility & Telecom', icon: '⚡' };
  }
  if (CORPORATE_EMPLOYER_KEYWORDS.some((k) => u.includes(k)) && !u.includes('UPI')) {
    return { category: 'INSTITUTIONAL_OTHER', label: 'Institutional Entity', icon: '🏛️' };
  }

  return { category: 'P2P_CONTACT', label: 'P2P Personal Contact', icon: '👤' };
}

// ── VPA & ENTITY EXTRACTOR ───────────────────────────────────────────────────

export function extractCounterpartyAndVpa(narration: string, existingEntity?: string): { name: string; vpa: string | null; channel: string } {
  const n = (narration || '').trim();
  let name = existingEntity || '';
  let vpa: string | null = null;
  let channel = 'OTHER';

  // 1. Extract VPA handle (e.g. name@bank, phone@paytm, etc.)
  const vpaMatch = n.match(/\b([A-Za-z0-9._-]+@[A-Za-z0-9]+)\b/i);
  if (vpaMatch) {
    vpa = vpaMatch[1].toLowerCase();
    channel = 'UPI';
  }

  // 2. UPI Standard Pattern: UPI-NAME-VPA@BANK-...
  const upiPrefixMatch = n.match(/^UPI[\/-]([A-Za-z0-9\s.'&-]+?)[\/-]([A-Za-z0-9._-]+@[A-Za-z0-9]+)/i);
  if (upiPrefixMatch) {
    name = upiPrefixMatch[1].trim();
    channel = 'UPI';
  } else {
    // REV-UPI Pattern: REV-UPI-ACCOUNT-VPA-PAY-...
    const revMatch = n.match(/REV-UPI[\/-][\d]+[\/-]([A-Za-z0-9._-]+@[A-Za-z0-9]+)/i);
    if (revMatch) {
      vpa = revMatch[1].toLowerCase();
      if (!name) name = vpa.split('@')[0];
      channel = 'UPI';
    }
  }

  // 3. IMPS Pattern: IMPS-RRN-NAME-BANK
  if (!name || name === 'Unknown') {
    const impsMatch = n.match(/IMPS[\/-]\d+[\/-]([A-Za-z\s.&']+?)(?:[\/-]|$)/i);
    if (impsMatch) {
      name = impsMatch[1].trim();
      channel = 'IMPS';
    }
  }

  // 4. NEFT Pattern: NEFT CR-IFSC-NAME-...
  if (!name || name === 'Unknown') {
    const neftMatch = n.match(/NEFT\s*CR[\/-][^-]+[\/-]([A-Za-z\s.&']+)[-\/]/i);
    if (neftMatch) {
      name = neftMatch[1].trim();
      channel = 'NEFT';
    }
  }

  // Clean entity name & format to clean Title Case
  name = name.replace(/[0-9._-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (name.length > 1 && !/^[0-9]+$/.test(name)) {
    name = name
      .split(' ')
      .filter((w) => w.length > 0)
      .map((w) => {
        if (['TCS', 'HCL', 'IBM', 'L&T', 'EPFO', 'LIC', 'GE', 'HP', 'EY', 'PWC', 'KPMG', 'SAP', 'AMD', 'ARM', 'SBI', 'HDFC', 'ICICI', 'AXIS', 'IDFC', 'HSBC'].includes(w.toUpperCase())) {
          return w.toUpperCase();
        }
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(' ');
  } else if (vpa) {
    const vpaPrefix = vpa.split('@')[0].replace(/[0-9._-]/g, ' ').trim();
    name = vpaPrefix.length > 1 
      ? vpaPrefix.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      : vpa;
  } else {
    name = 'Unknown Counterparty';
  }

  return { name, vpa, channel };
}

// ── UNIFIED CANONICAL CLUSTERING KEY ──────────────────────────────────────────

function getCanonicalClusterKey(name: string, vpa: string | null, category: CounterpartyCategory): string {
  const normName = name.toUpperCase().trim();
  const words = normName.split(/\s+/).filter(Boolean);

  // If distinct person name (2+ words) and P2P contact, group under person's canonical name
  if (normName !== 'UNKNOWN COUNTERPARTY' && words.length >= 2 && category === 'P2P_CONTACT') {
    return `NAME::${normName}`;
  }

  // If specific VPA is available
  if (vpa) {
    return `VPA::${vpa.toUpperCase()}`;
  }

  return `NAME::${normName}`;
}

// ── MASTER ANALYTICS & CLUSTERING FUNCTION ────────────────────────────────────

export function analyzeCounterparties(transactions: CanonicalTransaction[]): P2PForensicSummary {
  const clusterMap = new Map<string, {
    displayName: string;
    vpas: Set<string>;
    category: CounterpartyCategory;
    categoryLabel: string;
    icon: string;
    totalSent: number;
    totalReceived: number;
    sentCount: number;
    receivedCount: number;
    amounts: number[];
    dates: string[];
    txns: CanonicalTransaction[];
  }>();

  for (const t of transactions) {
    const isCredit = t.direction === 'CREDIT' || (t.credit !== null && (t.credit ?? 0) > 0);
    const amount = t.amount || (isCredit ? t.credit || 0 : t.debit || 0);
    if (amount <= 0) continue;

    const { name, vpa } = extractCounterpartyAndVpa(t.rawNarration, t.entityName);
    const catInfo = classifyCounterpartyCategory(name, vpa, t.rawNarration, t.isSalary);
    const clusterKey = getCanonicalClusterKey(name, vpa, catInfo.category);

    if (!clusterMap.has(clusterKey)) {
      clusterMap.set(clusterKey, {
        displayName: name,
        vpas: new Set<string>(),
        category: catInfo.category,
        categoryLabel: catInfo.label,
        icon: catInfo.icon,
        totalSent: 0,
        totalReceived: 0,
        sentCount: 0,
        receivedCount: 0,
        amounts: [],
        dates: [],
        txns: [],
      });
    }

    const cluster = clusterMap.get(clusterKey)!;
    if (vpa) cluster.vpas.add(vpa);
    if (name && name !== 'Unknown Counterparty' && cluster.displayName === 'Unknown Counterparty') {
      cluster.displayName = name;
    }

    if (isCredit) {
      cluster.totalReceived += amount;
      cluster.receivedCount++;
    } else {
      cluster.totalSent += amount;
      cluster.sentCount++;
    }

    cluster.amounts.push(amount);
    if (t.transactionDate) cluster.dates.push(t.transactionDate);
    cluster.txns.push(t);
  }

  // Convert map to enriched CounterpartyCluster array
  const clusters: CounterpartyCluster[] = Array.from(clusterMap.entries()).map(([key, data], idx) => {
    const sortedDates = [...data.dates].sort();
    const vpaArray = Array.from(data.vpas);
    const netFlow = data.totalReceived - data.totalSent;
    const grossVolume = data.totalSent + data.totalReceived;
    const totalTxnCount = data.sentCount + data.receivedCount;
    const avgTxn = totalTxnCount > 0 ? Math.round(grossVolume / totalTxnCount) : 0;
    const maxTxn = data.amounts.length > 0 ? Math.max(...data.amounts) : 0;
    const minTxn = data.amounts.length > 0 ? Math.min(...data.amounts) : 0;

    // Calculate reciprocity percentage
    const maxFlow = Math.max(data.totalSent, data.totalReceived);
    const minFlow = Math.min(data.totalSent, data.totalReceived);
    const reciprocalRatio = maxFlow > 0 ? Math.round((minFlow / maxFlow) * 100) : 0;

    let posture: CounterpartyCluster['posture'] = 'RECIPROCATED_BALANCED';
    if (netFlow < -500) {
      posture = 'NET_DEBTOR';     // You paid them more (they owe you or are a net recipient)
    } else if (netFlow > 500) {
      posture = 'NET_CREDITOR';   // They paid you more (you received surplus from them)
    }

    // Sort transactions under this cluster by date descending
    const sortedTxns = [...data.txns].sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));

    return {
      id: `cp_${idx}_${key.replace(/[^A-Za-z0-9]/g, '_')}`,
      displayName: data.displayName,
      vpas: vpaArray,
      primaryVpa: vpaArray[0] || null,
      category: data.category,
      categoryLabel: data.categoryLabel,
      icon: data.icon,
      totalSent: Math.round(data.totalSent),
      totalReceived: Math.round(data.totalReceived),
      netFlow: Math.round(netFlow),
      grossVolume: Math.round(grossVolume),
      txnCount: totalTxnCount,
      sentCount: data.sentCount,
      receivedCount: data.receivedCount,
      averageTxn: avgTxn,
      largestTxn: Math.round(maxTxn),
      smallestTxn: Math.round(minTxn),
      firstDate: sortedDates[0] || '',
      latestDate: sortedDates[sortedDates.length - 1] || '',
      reciprocalRatio,
      posture,
      transactions: sortedTxns,
    };
  });

  // Calculate high-level summary metrics
  const p2pClusters = clusters.filter((c) => c.category === 'P2P_CONTACT');
  const selfClusters = clusters.filter((c) => c.category === 'SELF_TRANSFER');
  const merchantClusters = clusters.filter((c) => c.category === 'MERCHANT_COMMERCE');
  const cryptoClusters = clusters.filter((c) => c.category === 'CRYPTO_INVESTMENT');

  const totalGrossVolume = clusters.reduce((sum, c) => sum + c.grossVolume, 0);
  const totalSentToPeers = p2pClusters.reduce((sum, c) => sum + c.totalSent, 0);
  const totalReceivedFromPeers = p2pClusters.reduce((sum, c) => sum + c.totalReceived, 0);
  const netPeerBalance = totalReceivedFromPeers - totalSentToPeers;
  const totalSelfTransferVolume = selfClusters.reduce((sum, c) => sum + c.grossVolume, 0);
  const selfTransferCount = selfClusters.reduce((sum, c) => sum + c.txnCount, 0);
  const totalMerchantVolume = merchantClusters.reduce((sum, c) => sum + c.totalSent, 0);
  const totalCryptoVolume = cryptoClusters.reduce((sum, c) => sum + c.grossVolume, 0);

  return {
    totalGrossVolume,
    totalSentToPeers,
    totalReceivedFromPeers,
    netPeerBalance,
    uniquePeerCount: p2pClusters.length,
    totalSelfTransferVolume,
    selfTransferCount,
    totalMerchantVolume,
    totalCryptoVolume,
    clusters,
  };
}
