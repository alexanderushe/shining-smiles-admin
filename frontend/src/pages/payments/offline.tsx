// frontend/src/pages/payments/offline.tsx
import React, { useEffect, useState } from 'react';
import { getQueue, addToQueue, flushQueue } from '../../lib/offlineQueue';
import { getApi } from '../../lib/api';

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
  const [studentNumber, setStudentNumber] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [feeType, setFeeType] = useState<string>('Cash');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [cashierName, setCashierName] = useState<string>('');
  const [cashierId, setCashierId] = useState<number | undefined>(undefined);
  const [term, setTerm] = useState<string>('1');
  const [academicYear, setAcademicYear] = useState<number>(new Date().getFullYear());
  const [referenceDetails, setReferenceDetails] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [bankTransferDate, setBankTransferDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [bankName, setBankName] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [todayText, setTodayText] = useState<string>('');

  // Load the offline queue on mount
  useEffect(() => {
    setQueue(getQueue());
    const cn = typeof window !== 'undefined' ? (localStorage.getItem('userName') || localStorage.getItem('cashierName') || '') : '';
    if (cn) setCashierName(cn);
    const cid = typeof window !== 'undefined' ? Number(localStorage.getItem('userId') || '') || undefined : undefined;
    setCashierId(cid);
    const month = new Date().getMonth() + 1;
    const mapped = (m: number) => (m >= 1 && m <= 3) ? '1' : (m >= 5 && m <= 7) ? '2' : (m >= 9 && m <= 12) ? '3' : (m === 4 ? '1' : (m === 8 ? '2' : '3'));
    setTerm(mapped(month));
    try { setTodayText(new Date().toLocaleDateString('en-GB')); } catch {}
    try {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('studentsCache') : null;
      if (cached) setStudents(JSON.parse(cached));
      const ts = typeof window !== 'undefined' ? localStorage.getItem('studentsCacheUpdatedAt') : null;
      if (ts) setLastRefreshed(Number(ts));
    } catch {}
    const load = async () => {
      if (typeof window !== 'undefined' && navigator.onLine) {
        try {
          const api = getApi();
          const res = await api.get('students/');
          const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          setStudents(list);
          try { localStorage.setItem('studentsCache', JSON.stringify(list)); } catch {}
          try { localStorage.setItem('studentsCacheUpdatedAt', String(Date.now())); setLastRefreshed(Date.now()); } catch {}
        } catch {}
      }
    };
    load();
    let interval: any;
    if (typeof window !== 'undefined' && navigator.onLine) {
      interval = setInterval(load, 5 * 60 * 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, []);

  const manualRefresh = async () => {
    if (!(typeof window !== 'undefined' && navigator.onLine)) return;
    setRefreshing(true);
    try {
      const api = getApi();
      const res = await api.get('students/');
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setStudents(list);
      try { localStorage.setItem('studentsCache', JSON.stringify(list)); } catch {}
      try { localStorage.setItem('studentsCacheUpdatedAt', String(Date.now())); setLastRefreshed(Date.now()); } catch {}
    } catch {}
    setRefreshing(false);
  };

  const handleAddPayment = () => {
    if (!studentNumber || !amount || !feeType) {
      alert('Please fill all fields.');
      return;
    }

    let sid = 0;
    if (studentNumber) {
      const match = students.find((s: any) => String(s.student_number) === String(studentNumber));
      if (match) sid = match.id;
    }
    const payment: Payment = { studentId: sid, studentNumber, amount, feeType, date, cashierName, cashierId, term, academicYear, referenceDetails, referenceNumber, transferDate: bankTransferDate, bankName };
    addToQueue(payment);
    setQueue(getQueue());

    // Clear form
    setAmount(0);
    setStudentNumber('');
    setFeeType('Cash');
    setDate(new Date().toISOString().slice(0, 10));
    setReferenceDetails('');
    setReferenceNumber('');
    setBankTransferDate(new Date().toISOString().slice(0,10));
    setBankName('');
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
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Student Number"
            value={studentNumber}
            onChange={(e) => {
              const v = e.target.value;
              setStudentNumber(v);
              if (v.length >= 1) {
                const list = students.filter((s: any) => String(s.student_number).includes(v) || `${s.first_name} ${s.last_name}`.toLowerCase().includes(v.toLowerCase()));
                setSuggestions(list.slice(0, 5));
              } else {
                setSuggestions([]);
              }
            }}
            className="border p-2 w-full"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 bg-white border border-zinc-200 rounded-md shadow-lg w-full max-h-48 overflow-auto" style={{ top: '100%', left: 0, marginTop: '4px' }}>
              {suggestions.map((s: any) => (
                <div key={s.id} className="px-3 py-2 cursor-pointer hover:bg-zinc-50" onClick={() => { setStudentNumber(String(s.student_number)); setSuggestions([]); }}>
                  {s.student_number} – {s.first_name} {s.last_name}{s.campus ? ` (${s.campus.name})` : ''}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <small>{lastRefreshed ? `Cache updated ${new Date(lastRefreshed).toLocaleString()}` : 'Cache not loaded'}</small>
          <button onClick={manualRefresh} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <input
          type="number"
          step="0.01"
          inputMode="decimal"
          min="0"
          placeholder="Amount (USD)"
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
        <div suppressHydrationWarning={true}>
          <strong>Date:</strong> {todayText || ''}
        </div>
        <div>
          <strong>Term:</strong> {term} &nbsp; <strong>Year:</strong> {academicYear}
        </div>

        {(feeType === 'Mobile Money' || feeType === 'Card') && (
          <input
            type="text"
            placeholder="Reference Details (e.g., TXN ID)"
            value={referenceDetails}
            onChange={(e) => setReferenceDetails(e.target.value)}
          />
        )}
        {feeType === 'Bank Transfer' && (
          <>
            <input
              type="text"
              placeholder="Bank Reference Number"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
            <input
              type="date"
              placeholder="Transfer Date"
              value={bankTransferDate}
              onChange={(e) => setBankTransferDate(e.target.value)}
            />
            <input
              type="text"
              placeholder="Bank Name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </>
        )}
        
        <button onClick={handleAddPayment}>Add to Queue</button>
      </div>

      <h2>Current Queue</h2>
      {queue.length ? (
        <ul>
          {queue.map((p, idx) => (
            <li key={idx}>
              Student {p.studentId} | {p.feeType} | {Number(p.amount).toFixed(2)} | {p.date} | {p.cashierName || 'Unknown'}
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
