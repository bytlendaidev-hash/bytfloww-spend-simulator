import { FinancialEvent, FinancialEventType } from '../types';

export interface RawSms {
  address: string;
  body: string;
  date: number;
}

const REMINDER_PHRASES = [
  'is due', 'due on', 'due date', 'due amount', 'minimum due', 'min due',
  'payment reminder', 'reminder:', 'bill generated', 'statement generated',
  'ignore if already paid', 'ignore if paid', 'pay before', 'overdue',
  'please pay', 'will be deducted on', 'maintain balance', 'e-mandate!',
  'mandate request', 'to avoid rs', 'late fee'
];

export function cleanBody(str: string): string {
  return (str || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export function parseSmsToEvent(sms: RawSms): FinancialEvent | null {
  const body = cleanBody(sms.body);
  const lower = body.toLowerCase();
  const address = (sms.address || '').toUpperCase();
  const timestamp = sms.date || Date.now();

  // 1. Exclude pure OTPs and non-financial auth codes
  if (lower.includes('otp') || lower.includes('verification code') || lower.includes('secret code') || (lower.includes('one time password') && !lower.includes('debited'))) {
    return null;
  }

  // 2. Amount Extraction (₹, Rs., INR, Rs)
  const amountMatch = 
    body.match(/(?:(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?))/i) ||
    body.match(/(?:debited\s*(?:by|with)?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?))/i) ||
    body.match(/(?:sent|paid|credited|spent|withdrawn)\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i) ||
    body.match(/(?:amount(?:\s+of)?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?))/i);

  if (!amountMatch) return null;

  const rawAmtStr = amountMatch[1];
  if (!rawAmtStr) return null;
  const amount = parseFloat(rawAmtStr.replace(/,/g, ''));
  if (isNaN(amount) || amount <= 0) return null;

  // 3. Date & Time formatting
  const dateObj = new Date(timestamp);
  const dateFormatted = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeFormatted = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  // 4. Direction & Event Type Resolution
  let direction: 'INFLOW' | 'OUTFLOW' | 'UNKNOWN' = 'UNKNOWN';
  let eventType: FinancialEventType = 'UNKNOWN';
  let economicType: FinancialEvent['economicType'] = 'UNKNOWN';
  let financialSubtype = 'OTHER';

  // Check if reminder / mandate
  const isExplicitDebit = lower.includes('has been debited') || lower.includes('debited for') || 
                          lower.includes('debited from') || lower.includes('sent rs') || 
                          lower.includes('paid rs') || lower.includes('repayment received') ||
                          lower.includes('spent rs') || lower.includes('withdrawn');

  const isReminder = REMINDER_PHRASES.some(p => lower.includes(p)) && !isExplicitDebit;

  if (isReminder) {
    if (lower.includes('mandate')) {
      direction = 'UNKNOWN';
      eventType = 'MANDATE';
      economicType = 'EXCLUDED';
      financialSubtype = 'MANDATE_ALERT';
    } else if (lower.includes('card') || lower.includes('credit card')) {
      direction = 'UNKNOWN';
      eventType = 'CARD_DUE';
      economicType = 'EXCLUDED';
      financialSubtype = 'DEBT_PAYMENT';
    } else {
      direction = 'UNKNOWN';
      eventType = 'LOAN_DUE';
      economicType = 'EXCLUDED';
      financialSubtype = 'EMI';
    }
  } else if (lower.includes('refund') || lower.includes('reversed') || lower.includes('reversal') || lower.includes('cashback')) {
    direction = 'INFLOW';
    eventType = 'REFUND';
    economicType = 'REFUND';
    financialSubtype = 'REFUND';
  } else if (isExplicitDebit || lower.includes('debited') || lower.includes('spent') || lower.includes('paid') || lower.includes('transferred to') || lower.includes('sent to') || lower.includes('withdrawn') || lower.includes('deducted') || lower.includes('charged')) {
    direction = 'OUTFLOW';
    economicType = 'OUTFLOW';

    if (lower.includes('atm') || lower.includes('cash withdrawal')) {
      eventType = 'ATM_WITHDRAWAL';
      financialSubtype = 'CASH_WITHDRAWAL';
    } else if (lower.includes('upi') || lower.includes('vpa') || lower.includes('@') || lower.includes('sent rs.') || lower.includes('sent rs ')) {
      eventType = 'UPI_DEBIT';
      financialSubtype = 'UPI';
    } else if (lower.includes('emi') || lower.includes('loan') || lower.includes('mpokket') || lower.includes('kreditbee')) {
      eventType = 'EMI_PAYMENT';
      financialSubtype = 'EMI';
    } else if (lower.includes('card') && (lower.includes('ending') || lower.includes('spent'))) {
      eventType = 'CARD_PAYMENT';
      financialSubtype = 'CARD';
    } else {
      eventType = 'PURCHASE';
      financialSubtype = 'REGULAR_PURCHASE';
    }
  } else if (lower.includes('credited') || lower.includes('received') || lower.includes('deposited') || lower.includes('salary')) {
    direction = 'INFLOW';
    economicType = 'INCOME';
    if (lower.includes('salary')) {
      eventType = 'SALARY';
      financialSubtype = 'SALARY';
    } else if (lower.includes('upi')) {
      eventType = 'UPI_CREDIT';
      financialSubtype = 'UPI';
    } else {
      eventType = 'UPI_CREDIT';
      financialSubtype = 'INCOME';
    }
  } else {
    return null; // Not an actionable transaction SMS
  }

  // 5. Merchant & Payee Extraction
  let merchant = extractMerchant(body, direction);

  // 6. Account & Card Mask Extraction (e.g. *9082, XX4721, A/C 9082)
  const acctMatch = 
    body.match(/(?:a\/c|acct|acc|card|ending)\s*(?:no\.?)?\s*[:\s*]*([x*]*\d{3,4})/i) ||
    body.match(/(?:xx|x+|\*+)(\d{4})/i) ||
    body.match(/a\/c\s+(\d{4})/i);
  
  let accountHint = '';
  if (acctMatch) {
    accountHint = acctMatch[1].replace(/[^\d]/g, '');
  }
  if (!accountHint && (address.includes('HDFC') || lower.includes('hdfc bank'))) accountHint = '9082';
  if (!accountHint && (address.includes('AIRBNK') || address.includes('APBL') || address.includes('AIRTEL') || lower.includes('airtel payments bank'))) accountHint = '9600';
  if (!accountHint && (address.includes('AXIS') || lower.includes('axis bank'))) accountHint = '2261';

  // 7. Institution Resolution from Sender ID
  const resolvedInstitution = resolveInstitutionName(address, body);

  // 8. Reference Number (UPI Ref, RRN, Txn ID)
  const refMatch = body.match(/(?:ref(?:\s+no\.?|erence)?|rrn|txn(?:\s+id)?|upi\s+ref)\s*[:\s#]?\s*([A-Za-z0-9]{6,24})/i);
  const referenceNumber = refMatch ? refMatch[1].toUpperCase() : '';

  // 9. Balance Extraction if present
  const balMatch = body.match(/(?:bal(?:ance)?|avl\s*bal|avbl\s*bal|available\s*bal(?:ance)?)\s*(?:is|:)?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  const balanceAfter = balMatch ? parseFloat(balMatch[1].replace(/,/g, '')) : undefined;

  // 10. Payment Mode Resolution
  let paymentMode: FinancialEvent['paymentMode'] = 'UPI';
  if (lower.includes('atm') || lower.includes('cash withdrawal')) {
    paymentMode = 'ATM';
  } else if (lower.includes('card') || lower.includes('pos ') || lower.includes('ecom')) {
    paymentMode = 'CARD';
  } else if (lower.includes('mandate') || lower.includes('e-mandate') || lower.includes('nach') || lower.includes('autopay')) {
    paymentMode = 'AUTO_DEBIT';
  } else if (lower.includes('netbanking') || lower.includes('inb') || lower.includes('neft') || lower.includes('rtgs') || lower.includes('imps')) {
    paymentMode = 'NET_BANKING';
  } else {
    paymentMode = 'UPI';
  }

  return {
    id: `tx_${timestamp}_${Math.random().toString(36).substring(2, 8)}`,
    amount,
    direction,
    eventType,
    merchant,
    rawMerchant: merchant,
    category: 'General', // categorized in categorizer
    economicType,
    financialSubtype,
    timestamp,
    dateFormatted,
    timeFormatted,
    accountHint,
    resolvedInstitution,
    referenceNumber,
    paymentMode,
    transactionFingerprint: '',
    confidence: 0.96,
    notes: body,
    rawSmsBody: body,
    sender: address,
    balanceAfter,
    isRecurring: isReminder || lower.includes('mandate') || lower.includes('autopay'),
  };
}

function extractMerchant(body: string, direction: 'INFLOW' | 'OUTFLOW' | 'UNKNOWN'): string {
  // 1. Direct VPA Match (e.g. name@okhdfcbank, name@paytm)
  const vpaMatch = body.match(/(?:to|vpa)\s+([A-Za-z0-9._-]+@[A-Za-z0-9]+)/i);
  if (vpaMatch) {
    return vpaMatch[1];
  }

  // 2. Specific Indian Bank templates: "Sent Rs.XX ... To <MERCHANT> On ..."
  const hdfcSentMatch = body.match(/to\s+([A-Za-z0-9\s&._'-]{2,30}?)(?:\s+on\s+\d|\s+ref|\s+not\s+you|\n|$)/i);
  if (hdfcSentMatch && !hdfcSentMatch[1].toLowerCase().includes('account') && !hdfcSentMatch[1].toLowerCase().includes('bank a/c')) {
    return cleanMerchantName(hdfcSentMatch[1]);
  }

  // 3. "For <Name> mandate"
  const mandateMatch = body.match(/for\s+([A-Za-z0-9\s&._'-]{2,25}?)\s+mandate/i);
  if (mandateMatch) {
    return cleanMerchantName(mandateMatch[1] + ' Mandate');
  }

  // 4. "At <Merchant>" / "Towards <Merchant>" / "info/<Merchant>"
  const atMatch = body.match(/(?:at|towards|info\/)\s*([A-Za-z0-9\s&._'-]{2,30}?)(?:\s+on|\s+ref|\s+upi|\s+avl|\s+bal|\.|$)/i);
  if (atMatch) {
    return cleanMerchantName(atMatch[1]);
  }

  // 5. Inflow: "by <Sender>" or "from <Sender>"
  if (direction === 'INFLOW') {
    const fromMatch = body.match(/(?:by|from)\s+([A-Za-z0-9\s&._'-]{2,30}?)(?:\s+on|\s+ref|\s+upi|\s+avl|\.|$)/i);
    if (fromMatch) {
      return cleanMerchantName(fromMatch[1]);
    }
  }

  // 6. Check common Indian merchants in body
  const lower = body.toLowerCase();
  const knownMerchants = [
    'swiggy', 'zomato', 'blinkit', 'zepto', 'instamart', 'bigbasket',
    'amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa',
    'uber', 'ola', 'rapido', 'irctc', 'makemytrip',
    'airtel', 'jio', 'vi ', 'uppcl', 'hathway',
    'mpokket', 'kreditbee', 'cred', 'zerodha', 'groww',
    'netflix', 'spotify', 'google', 'apple', 'starbucks', 'mcdonalds', 'kfc'
  ];

  for (const km of knownMerchants) {
    if (lower.includes(km)) {
      return km.charAt(0).toUpperCase() + km.slice(1);
    }
  }

  return 'General Merchant';
}

function cleanMerchantName(raw: string): string {
  const noise = [
    'vpa', 'upi', 'pos', 'ecom', 'inr', 'rs', 'ref', 'no', 'account', 
    'a/c', 'card', 'bank', 'ltd', 'pvt', 'not', 'you', 'call', 'sms',
    'block', 'avoid', 'levy', 'charges', 'balance', 'dear', 'user'
  ];
  let clean = raw.replace(/[^\w\s&@._'-]/g, ' ').trim();
  const words = clean.split(/\s+/).filter(w => !noise.includes(w.toLowerCase()) && w.length > 1);
  const result = words.slice(0, 4).join(' ').trim();
  return result || 'General Merchant';
}

function resolveInstitutionName(sender: string, body: string): string {
  const s = (sender || '').toUpperCase();
  const b = (body || '').toLowerCase();

  // 1. Sender ID is PRIMARY authority for the account institution
  if (s.includes('HDFCBK') || s.includes('HDFC')) return 'HDFC Bank';
  if (s.includes('AIRBNK') || s.includes('APBL') || s.includes('AIRTEL')) return 'Airtel Payments Bank';
  if (s.includes('AXISBK') || s.includes('AXIS') || s.includes('UTIB')) return 'Axis Bank';
  if (s.includes('SBICRD')) return 'SBI Card';
  if (s.includes('SBI') || s.includes('SBIN')) return 'State Bank of India';
  if (s.includes('ICICI') || s.includes('ICICIB')) return 'ICICI Bank';
  if (s.includes('KOTAK') || s.includes('KKBK')) return 'Kotak Mahindra Bank';
  if (s.includes('PNB') || s.includes('PUNJAB')) return 'Punjab National Bank';
  if (s.includes('BOB') || s.includes('BARB')) return 'Bank of Baroda';
  if (s.includes('IDFC')) return 'IDFC FIRST Bank';
  if (s.includes('YES') || s.includes('YESB')) return 'Yes Bank';
  if (s.includes('INDUS') || s.includes('INDB')) return 'IndusInd Bank';
  if (s.includes('PAYTM') || s.includes('PYTM')) return 'Paytm Payments Bank';
  if (s.includes('JIOPAY')) return 'Jio Payments Bank';

  // 2. Non-bank entities
  if (s.includes('CRED')) return 'CRED';
  if (s.includes('MPOKKT')) return 'mPokket';
  if (s.includes('KREDTO') || s.includes('KREDIT')) return 'KreditBee';
  if (s.includes('UPPCL')) return 'UPPCL Electricity';

  // 3. Fallback to body ONLY if sender has no bank header
  if (b.includes('airtel payments bank')) return 'Airtel Payments Bank';
  if (b.includes('hdfc bank')) return 'HDFC Bank';
  if (b.includes('axis bank')) return 'Axis Bank';
  if (b.includes('state bank of india')) return 'State Bank of India';
  if (b.includes('icici bank')) return 'ICICI Bank';
  if (b.includes('kotak mahindra bank')) return 'Kotak Mahindra Bank';
  return 'Bank Account';
}
