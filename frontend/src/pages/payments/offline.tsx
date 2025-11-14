// frontend/src/pages/payments/offline.tsx
import React, { useEffect, useState } from 'react';
import { getQueue, addToQueue, flushQueue } from '../../lib/offlineQueue';

interface Payment {
  studentId: number;
  amount: number;
  feeType: string;
  date: string;
}

const OfflinePaymentsPage: React.FC = () => {
  const [queue, setQueue] = useState<Payment[]>([]);
  const [studentId, setStudentId] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [feeType, setFeeType] = useState<string>('');
  const [date, setDate] = useState<string>('');

  // Load the offline queue on mount
  useEffect(() => {
    setQueue(getQueue());
  }, []);

  const handleAddPayment = () => {
    if (!studentId || !amount || !feeType || !date) {
      alert('Please fill all fields.');
      return;
    }

    const payment: Payment = { studentId, amount, feeType, date };
    addToQueue(payment);
    setQueue(getQueue());

    // Clear form
    setStudentId(0);
    setAmount(0);
    setFeeType('');
    setDate('');
  };

  const handleFlushQueue = async () => {
    try {
      await flushQueue();
      setQueue(getQueue());
      alert('Offline queue synced successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to sync queue. Try again later.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Offline Payments Queue</h1>

      <h2>Add Payment</h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="number"
          placeholder="Student ID"
          value={studentId || ''}
          onChange={(e) => setStudentId(Number(e.target.value))}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount || ''}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <input
          type="text"
          placeholder="Fee Type"
          value={feeType}
          onChange={(e) => setFeeType(e.target.value)}
        />
        <input
          type="date"
          placeholder="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={handleAddPayment}>Add to Queue</button>
      </div>

      <h2>Current Queue</h2>
      {queue.length ? (
        <ul>
          {queue.map((p, idx) => (
            <li key={idx}>
              Student {p.studentId} | {p.feeType} | {p.amount} | {p.date}
            </li>
          ))}
        </ul>
      ) : (
        <p>No offline payments in queue.</p>
      )}

      <button onClick={handleFlushQueue} disabled={!queue.length}>
        Sync Queue to Backend
      </button>
    </div>
  );
};

export default OfflinePaymentsPage;
