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
  referenceDetails?: string;
  referenceNumber?: string;
  transferDate?: string;
  bankName?: string;
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
      const resolveStudentId = async (): Promise<number | undefined> => {
        // Verify explicit studentId if provided
        if (payment.studentId && payment.studentId > 0) {
          try {
            await api.get(`students/${payment.studentId}/`);
            return payment.studentId;
          } catch { }
        }
        // Fallback: resolve by studentNumber if available
        if (payment.studentNumber) {
          try {
            const studentsRes = await api.get('students/');
            const list = Array.isArray(studentsRes.data) ? studentsRes.data : (studentsRes.data?.results || []);
            const match = (list || []).find((s: any) => String(s.student_number) === String(payment.studentNumber));
            if (match) return match.id;
          } catch (e) {
            throw e; // Re-throw to be caught by outer block
          }
        }
        return undefined;
      };

      const studentId = await resolveStudentId();
      if (!studentId || studentId === 0) throw new Error('Invalid student identifier');

      const localCashierId = (typeof window !== 'undefined') ? Number(localStorage.getItem('userId') || '') || undefined : undefined;
      await api.post('payments/', {
        student: studentId,
        amount: Number(payment.amount).toFixed(2),
        payment_method: payment.feeType,
        receipt_number: `${studentId}-${Date.now()}`,
        status: 'pending',
        term: payment.term,
        academic_year: payment.academicYear,
        reference_details: payment.referenceDetails,
        reference_number: payment.referenceNumber,
        transfer_date: payment.transferDate,
        bank_name: payment.bankName,
        cashier_id: payment.cashierId ?? localCashierId,
        cashier_name: payment.cashierName || (typeof window !== 'undefined' ? (localStorage.getItem('userName') || localStorage.getItem('cashierName') || 'Unknown') : 'Unknown'),
      });
      results.push({ item: payment, ok: true });
    } catch (err: any) {
      let msg = 'Failed';
      if (err?.response?.data) {
        msg = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
      } else if (err?.message) {
        msg = err.message;
      }
      results.push({ item: payment, ok: false, error: msg });
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

export const clearQueue = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(QUEUE_KEY);
};
