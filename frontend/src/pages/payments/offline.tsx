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
  referenceDetails?: string;
  referenceNumber?: string;
  transferDate?: string;
  bankName?: string;
}

const OfflinePaymentsPage: React.FC = () => {
  const [queue, setQueue] = useState<Payment[]>([]);
  const [results, setResults] = useState<{ item: Payment; ok: boolean; error?: string }[] | null>(null);
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
  const [bankTransferDate, setBankTransferDate] = useState<string>(new Date().toISOString().slice(0, 10));
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
    try { setTodayText(new Date().toLocaleDateString('en-GB')); } catch { }
    try {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('studentsCache') : null;
      if (cached) setStudents(JSON.parse(cached));
      const ts = typeof window !== 'undefined' ? localStorage.getItem('studentsCacheUpdatedAt') : null;
      if (ts) setLastRefreshed(Number(ts));
    } catch { }
    const load = async () => {
      if (typeof window !== 'undefined' && navigator.onLine) {
        try {
          const api = getApi();
          const res = await api.get('students/');
          const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          setStudents(list);
          try { localStorage.setItem('studentsCache', JSON.stringify(list)); } catch { }
          try { localStorage.setItem('studentsCacheUpdatedAt', String(Date.now())); setLastRefreshed(Date.now()); } catch { }
        } catch { }
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
      try { localStorage.setItem('studentsCache', JSON.stringify(list)); } catch { }
      try { localStorage.setItem('studentsCacheUpdatedAt', String(Date.now())); setLastRefreshed(Date.now()); } catch { }
    } catch { }
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
    setBankTransferDate(new Date().toISOString().slice(0, 10));
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
      setResults(res);
      setQueue(getQueue());
    } catch (err) {
      console.error(err);
    }
  };


  const handleResetSession = () => {
    if (confirm('This will log you out and clear any stale session data. Continue?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      window.location.reload();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Offline Payments Queue ({queue.length})</h1>
          <p className="text-zinc-500 mt-1">Manage payments captured while offline</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSession}
            className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors font-medium ml-2"
          >
            Fix Auth / Reset Session
          </button>
          <button onClick={() => window.history.back()} className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded transition-colors font-medium">
            Back to Dashboard
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold"></h1>
        <div className="flex gap-2">
          <button
            onClick={handleFlushQueue}
            disabled={!queue.length}
            className={`px-4 py-2 rounded font-medium text-white transition-colors ${!queue.length ? 'bg-zinc-300 cursor-not-allowed' : 'bg-black hover:bg-zinc-800'}`}
          >
            Sync Queue to Backend
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ADD PAYMENT FORM */}
        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-zinc-100">Add Payment</h2>

          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Student</label>
              <input
                type="text"
                placeholder="Search by number or name..."
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
                className="w-full p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
              />
              {suggestions.length > 0 && (
                <div className="absolute z-10 bg-white border border-zinc-200 rounded-md shadow-lg w-full mt-1 max-h-48 overflow-auto">
                  {suggestions.map((s: any) => (
                    <div
                      key={s.id}
                      className="px-4 py-2 cursor-pointer hover:bg-zinc-50 text-sm"
                      onClick={() => { setStudentNumber(String(s.student_number)); setSuggestions([]); }}
                    >
                      <span className="font-semibold">{s.student_number}</span> – {s.first_name} {s.last_name}
                      {s.campus && <span className="text-zinc-500 text-xs ml-1">({s.campus.name})</span>}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center mt-1">
                <small className="text-xs text-zinc-500">
                  {lastRefreshed ? `Cache updated ${new Date(lastRefreshed).toLocaleTimeString()}` : 'Cache not loaded'}
                </small>
                <button
                  onClick={manualRefresh}
                  disabled={refreshing}
                  className="text-xs text-blue-600 hover:text-blue-800 disabled:text-zinc-400"
                >
                  {refreshing ? 'Refreshing…' : 'Refresh Cache'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-zinc-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  min="0"
                  placeholder="0.00"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2 pl-7 border border-zinc-300 rounded focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Method</label>
                <select
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value)}
                  className="w-full p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-black outline-none bg-white"
                >
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                  <option>Mobile Money</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Details</label>
                <div className="text-sm py-2 px-3 bg-zinc-50 border border-zinc-200 rounded text-zinc-600">
                  {todayText} (Term {term})
                </div>
              </div>
            </div>

            {/* Conditional Fields */}
            {(feeType === 'Mobile Money' || feeType === 'Card') && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Reference / TXN ID</label>
                <input
                  type="text"
                  placeholder="e.g. TX12345678"
                  value={referenceDetails}
                  onChange={(e) => setReferenceDetails(e.target.value)}
                  className="w-full p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-black outline-none"
                />
              </div>
            )}

            {feeType === 'Bank Transfer' && (
              <div className="space-y-4 pt-2 border-t border-zinc-100">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Ref Number</label>
                    <input
                      type="text"
                      placeholder="Ref Number"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Transfer Date</label>
                    <input
                      type="date"
                      value={bankTransferDate}
                      onChange={(e) => setBankTransferDate(e.target.value)}
                      className="w-full p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-black outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleAddPayment}
              className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow-sm transition-colors"
            >
              Add to Queue
            </button>
          </div>
        </div>

        {/* QUEUE DISPLAY */}
        <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-200">
          <h2 className="text-xl font-semibold mb-6 text-zinc-900">Queue Items</h2>

          {results && (
            <div className="mb-4 space-y-2">
              {results.map((r, idx) => (
                <div key={idx} className={`p-3 rounded text-sm border flex items-center justify-between ${r.ok ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                  <span>
                    <span className="font-semibold">{r.item.studentNumber || `#${r.item.studentId}`}</span>
                    <span className="mx-2">•</span>
                    ${Number(r.item.amount).toFixed(2)}
                  </span>
                  <span>{r.ok ? 'Synced ✓' : `Failed: ${r.error || ''}`}</span>
                </div>
              ))}
            </div>
          )}

          {queue.length > 0 ? (
            <div className="space-y-3">
              {queue.map((p, idx) => (
                <div key={idx} className="bg-white p-4 rounded border border-zinc-200 shadow-sm flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-zinc-900">Student {p.studentNumber || p.studentId}</span>
                    <span className="font-bold text-zinc-900">${Number(p.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-zinc-500">
                    <span>{p.feeType}</span>
                    <span>{p.date}</span>
                  </div>
                  {p.cashierName && <div className="text-xs text-zinc-400 mt-1">Cashier: {p.cashierName}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
              <svg width="48" height="48" className="w-12 h-12 mb-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <p>Queue is empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflinePaymentsPage;
