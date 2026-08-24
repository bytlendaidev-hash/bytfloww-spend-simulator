import { FinancialEvent } from '../types';

export interface CategoryMeta {
  color: string;
  iconName: string;
}

export const CATEGORY_META_MAP: Record<string, CategoryMeta> = {
  'Food & Drinks': { color: '#FF7043', iconName: 'utensils' },
  'Groceries': { color: '#4CAF50', iconName: 'shopping-cart' },
  'Shopping': { color: '#AB47BC', iconName: 'shopping-bag' },
  'Travel & Transport': { color: '#29B6F6', iconName: 'car' },
  'Bills & Utilities': { color: '#FFA726', iconName: 'zap' },
  'Subscriptions': { color: '#EC407A', iconName: 'film' },
  'EMI / Debt': { color: '#EF5350', iconName: 'credit-card' },
  'Investment': { color: '#26A69A', iconName: 'trending-up' },
  'Healthcare': { color: '#26C6DA', iconName: 'activity' },
  'Transfers': { color: '#7E57C2', iconName: 'send' },
  'Income': { color: '#00E676', iconName: 'arrow-down-left' },
  'Refund': { color: '#00B0FF', iconName: 'rotate-ccw' },
  'Cash Withdrawal': { color: '#8D6E63', iconName: 'dollar-sign' },
  'Entertainment': { color: '#F06292', iconName: 'tv' },
  'General': { color: '#78909C', iconName: 'tag' },
  'Discretionary': { color: '#80CBC4', iconName: 'pie-chart' },
  'Reminders': { color: '#9E9E9E', iconName: 'bell' },
};

export function categorizeEvent(event: FinancialEvent): { category: string; economicType: FinancialEvent['economicType'] } {
  // If event is already refund or salary
  if (event.eventType === 'REFUND') {
    return { category: 'Refund', economicType: 'REFUND' };
  }
  if (event.eventType === 'SALARY') {
    return { category: 'Income', economicType: 'INCOME' };
  }
  if (event.eventType === 'CARD_DUE' || event.eventType === 'LOAN_DUE' || event.eventType === 'MANDATE') {
    return { category: 'Reminders', economicType: 'EXCLUDED' };
  }
  if (event.eventType === 'ATM_WITHDRAWAL') {
    return { category: 'Cash Withdrawal', economicType: 'OUTFLOW' };
  }

  const m = event.merchant.toLowerCase();
  const b = event.notes.toLowerCase();
  const raw = `${m} ${b} ${event.sender.toLowerCase()}`;

  // 1. Food & Dining
  if (
    raw.includes('swiggy') || raw.includes('zomato') || raw.includes('chaayos') || 
    raw.includes('chai point') || raw.includes('tea stall') || raw.includes('starbucks') || 
    raw.includes('mcdonald') || raw.includes('kfc') || raw.includes('burger king') || 
    raw.includes('dominos') || raw.includes('pizza') || raw.includes('cafe') || 
    raw.includes('restaurant') || raw.includes('dhaba') || raw.includes('bakery') || 
    raw.includes('sweets') || raw.includes('biryani')
  ) {
    return { category: 'Food & Drinks', economicType: 'OUTFLOW' };
  }

  // 2. Groceries & Essentials
  if (
    raw.includes('blinkit') || raw.includes('zepto') || raw.includes('instamart') || 
    raw.includes('bigbasket') || raw.includes('dmart') || raw.includes('nature basket') || 
    raw.includes('supermarket') || raw.includes('kirana') || raw.includes('dairy') || 
    raw.includes('milk') || raw.includes('grocery') || raw.includes('vegetable') || raw.includes('fruit')
  ) {
    return { category: 'Groceries', economicType: 'OUTFLOW' };
  }

  // 3. Shopping & Retail
  if (
    raw.includes('trends') || raw.includes('rtrnds') || raw.includes('amazon') || 
    raw.includes('flipkart') || raw.includes('myntra') || raw.includes('ajio') || 
    raw.includes('nykaa') || raw.includes('meesho') || raw.includes('zara') || 
    raw.includes('h&m') || raw.includes('decathlon') || raw.includes('croma') || 
    raw.includes('reliance digital') || raw.includes('shopping') || raw.includes('apparel') || 
    raw.includes('clothing') || raw.includes('mall') || raw.includes('fashion')
  ) {
    return { category: 'Shopping', economicType: 'OUTFLOW' };
  }

  // 4. Travel & Transport
  if (
    raw.includes('uber') || raw.includes('ola') || raw.includes('rapido') || 
    raw.includes('dmrc') || raw.includes('metro') || raw.includes('irctc') || 
    raw.includes('railways') || raw.includes('makemytrip') || raw.includes('cleartrip') || 
    raw.includes('fuel') || raw.includes('petrol') || raw.includes('hpcl') || 
    raw.includes('bpcl') || raw.includes('indian oil') || raw.includes('auto') || raw.includes('cab')
  ) {
    return { category: 'Travel & Transport', economicType: 'OUTFLOW' };
  }

  // 5. Subscriptions & Entertainment
  if (
    raw.includes('netflix') || raw.includes('spotify') || raw.includes('youtube') || 
    raw.includes('google play') || raw.includes('apple') || raw.includes('hotstar') || 
    raw.includes('prime') || raw.includes('hathway') || raw.includes('pvr') || 
    raw.includes('inox') || raw.includes('bookmyshow') || raw.includes('cinema')
  ) {
    return { category: 'Subscriptions', economicType: 'OUTFLOW' };
  }

  // 6. Bills & Utilities
  if (
    raw.includes('airtel') || raw.includes('jio') || raw.includes('vi ') || 
    raw.includes('uppcl') || raw.includes('electricity') || raw.includes('power') || 
    raw.includes('bescom') || raw.includes('tata power') || raw.includes('gas') || 
    raw.includes('water') || raw.includes('recharge') || raw.includes('dth') || 
    raw.includes('broadband') || raw.includes('cred')
  ) {
    return { category: 'Bills & Utilities', economicType: 'OUTFLOW' };
  }

  // 7. EMI, Loans & Debt
  if (
    raw.includes('mpokket') || raw.includes('kreditbee') || raw.includes('moneyview') || 
    raw.includes('flexsalary') || raw.includes('vivifi') || raw.includes('fibe') || 
    raw.includes('cashe') || raw.includes('navi') || raw.includes('bajaj finance') || 
    raw.includes('tata capital') || raw.includes('loan') || raw.includes('emi') || 
    raw.includes('razorpay software') || raw.includes('lendingplate')
  ) {
    return { category: 'EMI / Debt', economicType: 'OUTFLOW' };
  }

  // 8. Investments
  if (
    raw.includes('zerodha') || raw.includes('groww') || raw.includes('kuvera') || 
    raw.includes('indmoney') || raw.includes('upstox') || raw.includes('angelone') || 
    raw.includes('mutual fund') || raw.includes('sip')
  ) {
    return { category: 'Investment', economicType: 'OUTFLOW' };
  }

  // 9. Healthcare & Medical
  if (
    raw.includes('apollo') || raw.includes('1mg') || raw.includes('pharmeasy') || 
    raw.includes('netmeds') || raw.includes('hospital') || raw.includes('pharmacy') || 
    raw.includes('chemist') || raw.includes('clinic') || raw.includes('medical')
  ) {
    return { category: 'Healthcare', economicType: 'OUTFLOW' };
  }

  // 10. Direct Transfers to Persons (Sent Rs to individual name or UPI VPA)
  if (
    raw.includes('@') || raw.includes('sent rs') || raw.includes('to ') || 
    raw.includes('trf to') || event.paymentMode === 'UPI'
  ) {
    return { 
      category: 'Transfers', 
      economicType: event.direction === 'INFLOW' ? 'INCOME' : 'OUTFLOW' 
    };
  }

  // Fallback based on direction
  if (event.direction === 'INFLOW') {
    return { category: 'Income', economicType: 'INCOME' };
  }

  return { category: 'Discretionary', economicType: 'OUTFLOW' };
}
