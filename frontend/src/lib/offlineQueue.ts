// frontend/src/lib/offlineQueue.ts
import { getApi } from './api';

export interface Payment {
  studentId: number;
  amount: number;

  // Clarified naming: payment method (how) vs fee category (what)
  paymentMethod?: string;  // 'Cash', 'Card', 'Bank Transfer', 'Mobile Money'
  feeCategory?: string;    // 'Tuition', 'Transport', 'Boarding', 'Registration', 'Other'

  // Backward compatibility: old queue items used 'feeType' for payment method
  feeType?: string;  // DEPRECATED - kept for backward compat, maps to paymentMethod

  date: string;
  cashierName?: string;
  cashierId?: number;
  studentNumber?: string;
  term?: string;
  academicYear?: number;

  // Conditional / Extra fields
  bankName?: string;
  referenceId?: string;
  merchantProvider?: string;
  notes?: string;
}

const QUEUE_KEY = 'offlinePayments';

// Get queue from localStorage
export const getQueue = (): Payment[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(QUEUE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Add a payment to the offline queue
export const addToQueue = (payment: Payment) => {
  if (typeof window === 'undefined') return;

  const queue = getQueue();
  queue.push(payment);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const removeFromQueue = (index: number) => {
  if (typeof window === 'undefined') return;
  const queue = getQueue();
  if (index >= 0 && index < queue.length) {
    queue.splice(index, 1);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }
};

export const clearQueue = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(QUEUE_KEY);
};

// Flush queue to backend
export const flushQueue = async () => {
  if (typeof window === 'undefined') return [] as { item: Payment; ok: boolean; error?: string }[];

  const queue = getQueue();
  if (!queue.length) return [] as { item: Payment; ok: boolean; error?: string }[];

  const api = getApi();
  const results: { item: Payment; ok: boolean; error?: string }[] = [];
  const remaining: Payment[] = [];

  for (const payment of queue) {
    try {
      let studentId = payment.studentId;
      if ((!studentId || studentId === 0) && payment.studentNumber) {
        try {
          const studentsRes = await api.get('students/');
          const match = (studentsRes.data || []).find((s: any) => s.student_number === payment.studentNumber);
          if (match) studentId = match.id;
        } catch { }
      }
      if (!studentId || studentId === 0) throw new Error('Missing student identifier');
      const localCashierId = (typeof window !== 'undefined') ? Number(localStorage.getItem('userId') || '') || undefined : undefined;

      // Handle backward compatibility: old queue items used 'feeType' for payment method
      const paymentMethod = payment.paymentMethod || payment.feeType || 'Cash';
      const feeCategory = payment.feeCategory || 'Tuition';  // Default if not specified


      const payload: any = {
        student: studentId,
        amount: payment.amount,
        payment_method: paymentMethod,  // Correctly map payment method (Cash, Card, etc.)
        fee_type: feeCategory,          // Correctly map fee category (Tuition, Transport, etc.)
        // in offline.tsx: feeType stores 'Cash','Card' etc. So it is payment_method.
        // AND 'fee_type' (Tuition etc) is missing in the old offline form??
        // Let me check offline.tsx again.
        // Old offline.tsx: <select value={feeType} ...> Option: Cash, Card... So 'feeType' state variable HELD the payment method.
        // BUT Online form has BOTH 'Payment Method' AND 'Fee Type' (Tuition etc).
        // I need to fix this ambiguity in offline.tsx too.

        receipt_number: `${payment.studentId}-${Date.now()}`,
        status: 'pending',
        term: payment.term,
        academic_year: payment.academicYear,
        cashier_id: payment.cashierId ?? localCashierId,
        cashier_name: payment.cashierName || (typeof window !== 'undefined' ? (localStorage.getItem('userName') || localStorage.getItem('cashierName') || 'Unknown') : 'Unknown'),

        // Map extra fields based on payment method
        reference_id: payment.referenceId || null,
        bank_name: payment.bankName || null,
        merchant_provider: payment.merchantProvider || null,
      };

      await api.post('payments/', payload);
      results.push({ item: payment, ok: true });
    } catch (err: any) {
      results.push({ item: payment, ok: false, error: err?.response?.data ? JSON.stringify(err.response.data) : 'Failed' });
      remaining.push(payment);
    }
  }

  if (remaining.length) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } else {
    localStorage.removeItem(QUEUE_KEY);
  }

  return results;
};
