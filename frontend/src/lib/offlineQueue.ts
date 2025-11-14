// frontend/src/lib/offlineQueue.ts
import { getApi } from './api';

export interface Payment {
  studentId: number;
  amount: number;
  feeType: string;
  date: string;
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
  if (typeof window === 'undefined') return;

  const queue = getQueue();
  if (!queue.length) return;

  const api = getApi();

  for (const payment of queue) {
    try {
      await api.post('payments/', {
        student: payment.studentId,
        amount: payment.amount,
        fee_type: payment.feeType,
        date: payment.date,
        payment_method: 'Cash', // default; change if dynamic
        cashier_name: 'Offline Sync', // default; adjust if needed
        status: 'posted', // must match your model choices: pending/posted/voided
      });
      console.log('Synced payment:', payment);
    } catch (err) {
      console.error('Failed to sync payment:', err);
      // Stop flushing on first failure to retry later
      return;
    }
  }

  // Clear queue if all succeeded
  localStorage.removeItem(QUEUE_KEY);
  console.log('Offline queue cleared.');
};
