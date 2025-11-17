import { useEffect, useState } from 'react';
import { getApi } from '../../lib/api';

type Rec = { id?: number; cashier_id: number; date: string; expected_total: number; actual_amount: number; variance: number; status: 'balanced'|'short'|'over'; notes?: string };

export default function ReconciliationPage() {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [expected, setExpected] = useState<number>(0);
  const [actual, setActual] = useState<number>(0);
  const [status, setStatus] = useState<'balanced'|'short'|'over'>('balanced');
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<Rec[]>([]);

  useEffect(() => {
    const v = actual - expected;
    setStatus(v === 0 ? 'balanced' : v < 0 ? 'short' : 'over');
  }, [expected, actual]);

  const load = async () => {
    const api = getApi();
    const res = await api.get('reports/reconciliation/');
    setItems(res.data);
  };

  useEffect(() => { load(); }, []);

  const fetchExpected = async (d: string) => {
    const api = getApi();
    const cashierId = (typeof window !== 'undefined') ? Number(localStorage.getItem('userId') || '') || 0 : 0;
    if (!cashierId || !d) return;
    try {
      const res = await api.get(`reports/cashier-daily/?date=${d}&cashier_id=${cashierId}`);
      setExpected(Number(res.data.total || 0));
    } catch {}
  };

  useEffect(() => { fetchExpected(date); }, [date]);

  const save = async () => {
    const api = getApi();
    const cashierId = (typeof window !== 'undefined') ? Number(localStorage.getItem('userId') || '') || 0 : 0;
    const variance = actual - expected;
    const payload: any = { cashier_id: cashierId, date, actual_amount: actual, notes };
    await api.post('reports/reconciliation/', payload);
    await load();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Daily Reconciliation</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <input className="border p-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="border p-2" readOnly value={`Expected: ${expected}`} />
        <input className="border p-2" type="number" placeholder="Actual Amount" value={actual || ''} onChange={(e) => setActual(Number(e.target.value))} />
        <input className="border p-2" readOnly value={`Variance: ${actual - expected}`} />
        <input className="border p-2" readOnly value={`Status: ${status}`} />
        <input className="border p-2" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <button className="px-4 py-2 rounded bg-black text-white" onClick={save}>Save</button>

      <h2 className="text-xl font-semibold mt-6 mb-2">History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-zinc-50">
            <tr>
              <th className="p-2 border-b">Date</th>
              <th className="p-2 border-b">Cashier</th>
              <th className="p-2 border-b">Expected</th>
              <th className="p-2 border-b">Actual</th>
              <th className="p-2 border-b">Variance</th>
              <th className="p-2 border-b">Status</th>
              <th className="p-2 border-b">Notes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r, i) => (
              <tr key={i}>
                <td className="p-2 border-b">{r.date}</td>
                <td className="p-2 border-b">{(r as any).cashier || r.cashier_id}</td>
                <td className="p-2 border-b">{r.expected_total}</td>
                <td className="p-2 border-b">{r.actual_amount}</td>
                <td className="p-2 border-b">{r.variance}</td>
                <td className="p-2 border-b">{r.status}</td>
                <td className="p-2 border-b">{r.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}