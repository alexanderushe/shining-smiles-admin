// frontend/src/pages/payments/offline.tsx
import React, { useEffect, useState } from 'react';
import { getQueue, addToQueue, flushQueue } from '../../lib/offlineQueue';

interface Payment {
  studentId: number;
  amount: number;
  feeType: string;
  date: string;
  cashierName?: string;
  studentNumber?: string;
  cashierId?: number;
  term?: string;
  academicYear?: number;
}

const OfflinePaymentsPage: React.FC = () => {
  const [queue, setQueue] = useState<Payment[]>([]);
  const [results, setResults] = useState<{ ok: boolean; error?: string }[] | null>(null);
  const [studentId, setStudentId] = useState<number>(0);
  const [studentNumber, setStudentNumber] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [feeType, setFeeType] = useState<string>('Cash');
  const [date, setDate] = useState<string>('');
  const [cashierName, setCashierName] = useState<string>('');
  const [cashierId, setCashierId] = useState<number | undefined>(undefined);
  const [term, setTerm] = useState<string>('1');
  const [academicYear, setAcademicYear] = useState<number>(new Date().getFullYear());

  // Load the offline queue on mount
  useEffect(() => {
    setQueue(getQueue());
    const cn = typeof window !== 'undefined' ? (localStorage.getItem('userName') || localStorage.getItem('cashierName') || '') : '';
    if (cn) setCashierName(cn);
    const cid = typeof window !== 'undefined' ? Number(localStorage.getItem('userId') || '') || undefined : undefined;
    setCashierId(cid);
    const month = new Date().getMonth() + 1;
    setTerm(month <= 4 ? '1' : month <= 8 ? '2' : '3');
  }, []);

  const handleAddPayment = () => {
    if (!studentId || !amount || !feeType || !date) {
      alert('Please fill all fields.');
      return;
    }

    const payment: Payment = { studentId, studentNumber, amount, feeType, date, cashierName, cashierId, term, academicYear };
    addToQueue(payment);
    setQueue(getQueue());

    // Clear form
    setStudentId(0);
    setAmount(0);
    setStudentNumber('');
    setFeeType('Cash');
    setDate('');
    setTerm(term);
    setAcademicYear(new Date().getFullYear());
    if (!localStorage.getItem('cashierName') && cashierName) {
      localStorage.setItem('cashierName', cashierName);
    }
  };

  const handleFlushQueue = async () => {
    try {
      const res = await flushQueue();
      setResults(res.map(r => ({ ok: r.ok, error: r.error })));
      setQueue(getQueue());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Offline Payments Queue ({queue.length})</h1>

      <h2>Add Payment</h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="number"
          placeholder="Student ID (optional)"
          value={studentId || ''}
          onChange={(e) => setStudentId(Number(e.target.value))}
        />
        <input
          type="text"
          placeholder="Student Number"
          value={studentNumber}
          onChange={(e) => setStudentNumber(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount || ''}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <select
          value={feeType}
          onChange={(e) => setFeeType(e.target.value)}
        >
          <option>Cash</option>
          <option>Card</option>
          <option>Bank Transfer</option>
          <option>Mobile Money</option>
        </select>
        <input
          type="date"
          placeholder="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select value={term} onChange={(e) => setTerm(e.target.value)}>
          <option value="1">Term 1</option>
          <option value="2">Term 2</option>
          <option value="3">Term 3</option>
        </select>
        <input
          type="number"
          placeholder="Academic Year"
          value={academicYear}
          onChange={(e) => setAcademicYear(Number(e.target.value))}
        />
        
        <button onClick={handleAddPayment}>Add to Queue</button>
      </div>

      <h2>Current Queue</h2>
      {queue.length ? (
        <ul>
          {queue.map((p, idx) => (
            <li key={idx}>
              Student {p.studentId} | {p.feeType} | {p.amount} | {p.date} | {p.cashierName || 'Unknown'}
            </li>
          ))}
        </ul>
      ) : (
        <p>No offline payments in queue.</p>
      )}

      <button onClick={handleFlushQueue} disabled={!queue.length}>
        Sync Queue to Backend
      </button>
      {results && (
        <div style={{ marginTop: '1rem' }}>
          {results.map((r, idx) => (
            <div key={idx} style={{ color: r.ok ? 'green' : 'red' }}>
              {r.ok ? 'Synced' : `Failed: ${r.error || ''}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfflinePaymentsPage;
