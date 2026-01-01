// frontend/src/lib/offlineQueue.ts
import { getApi } from './api';

export interface Payment {
  studentId: number;
  amount: number;
  feeType: string;
  date: string;
  cashierName?: string;
  cashierId?: number;
  studentNumber?: string;
  term?: string;
  academicYear?: number;
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
        } catch {}
      }
      if (!studentId || studentId === 0) throw new Error('Missing student identifier');
      const localCashierId = (typeof window !== 'undefined') ? Number(localStorage.getItem('userId') || '') || undefined : undefined;
      await api.post('payments/', {
        student: studentId,
        amount: payment.amount,
        payment_method: payment.feeType,
        receipt_number: `${payment.studentId}-${Date.now()}`,
        status: 'pending',
        term: payment.term,
        academic_year: payment.academicYear,
        cashier_id: payment.cashierId ?? localCashierId,
        cashier_name: payment.cashierName || (typeof window !== 'undefined' ? (localStorage.getItem('userName') || localStorage.getItem('cashierName') || 'Unknown') : 'Unknown'),
      });
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
