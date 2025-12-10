import type { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getApi } from '../../lib/api';

type Campus = { id: number; name: string };
type Student = { id: number; student_number: string; first_name: string; last_name: string; campus: Campus };
type Payment = { id: number; student: number; amount: number; payment_method: string; receipt_number: string; status: 'pending' | 'posted' | 'voided'; date: string; cashier_name: string };

const PaymentsPage: NextPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [role, setRole] = useState<'admin' | 'staff' | 'viewer'>('viewer');

  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<'amount' | 'date' | 'status'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [current, setCurrent] = useState<Payment | null>(null);

  const [formStudentId, setFormStudentId] = useState('');
  const [formStudentSearch, setFormStudentSearch] = useState('');
  const [studentSuggestions, setStudentSuggestions] = useState<Student[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const [formAmount, setFormAmount] = useState('');
  const [formMethod, setFormMethod] = useState('Cash');
  const [formReceipt, setFormReceipt] = useState('');
  const [formStatus, setFormStatus] = useState<'pending' | 'posted' | 'voided'>('pending');
  const [formTerm, setFormTerm] = useState('1');
  const [formYear, setFormYear] = useState<number>(new Date().getFullYear());
  const [formRefDetails, setFormRefDetails] = useState('');
  const [formRefNumber, setFormRefNumber] = useState('');
  const [formTransferDate, setFormTransferDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formBankName, setFormBankName] = useState('');

  const showMessage = (type: 'success' | 'error', message: string) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 3000);
  };

  const extractErrorMessage = (e: any) => {
    const data = e?.response?.data;
    if (!data) return 'Request failed';
    if (typeof data === 'string') return data;
    try { return JSON.stringify(data); } catch { return 'Request failed'; }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch { return iso; }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const api = getApi();
      const [pRes, sRes] = await Promise.all([
        api.get(`payments/?page=${page}&page_size=${pageSize}`),
        api.get('students/'),
      ]);
      const pData = pRes.data;
      if (pData && Array.isArray(pData.results)) {
        setPayments(pData.results);
        setTotalCount(pData.count || 0);
      } else {
        setPayments(pData);
        setTotalCount(Array.isArray(pData) ? pData.length : 0);
      }
      setStudents(sRes.data);
      setError(null);
    } catch (e: any) {
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const r = typeof window !== 'undefined' ? (localStorage.getItem('userRole') as 'admin' | 'staff' | 'viewer' | null) : null;
    if (r) setRole(r); else { if (typeof window !== 'undefined') { localStorage.setItem('userRole', 'admin'); setRole('admin'); } }
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const studentById = useMemo(() => {
    const map: Record<number, Student> = {};
    students.forEach(s => { map[s.id] = s; });
    return map;
  }, [students]);

  const enriched = useMemo(() => {
    return payments.map(p => {
      const s = studentById[p.student];
      const name = s ? `${s.first_name} ${s.last_name}` : `#${p.student}`;
      const number = s ? s.student_number : `#${p.student}`;
      return { ...p, student_name: name, student_number: number } as Payment & { student_name: string; student_number: string };
    });
  }, [payments, studentById]);

  const filteredSortedPaged = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = enriched.filter(p => {
      if (!q) return true;
      return p.student_number.toLowerCase().includes(q) || p.student_name.toLowerCase().includes(q);
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    const sorted = filtered.sort((a, b) => {
      if (sortKey === 'amount') return (a.amount - b.amount) * dir;
      if (sortKey === 'status') return a.status.localeCompare(b.status) * dir;
      const av = new Date(a.date).getTime();
      const bv = new Date(b.date).getTime();
      return (av - bv) * dir;
    });
    return { rows: sorted, total: q ? sorted.length : totalCount };
  }, [enriched, query, sortKey, sortDir, totalCount]);

  const openCreate = () => {
    setFormStudentId('');
    setFormStudentSearch('');
    setStudentSuggestions([]);
    setFormAmount('');
    setFormMethod('Cash');
    setFormReceipt('');
    setFormStatus('pending');
    const m = new Date().getMonth() + 1;
    setFormTerm(m <= 4 ? '1' : m <= 8 ? '2' : '3');
    setFormYear(new Date().getFullYear());
    setFormRefDetails('');
    setFormRefNumber('');
    setFormTransferDate(new Date().toISOString().slice(0, 10));
    setFormBankName('');
    setShowCreate(true);
  };

  const openEdit = (p: Payment) => {
    setCurrent(p);
    setFormStudentId(String(p.student));
    const s = studentById[p.student];
    setFormStudentSearch(s ? `${s.student_number} – ${s.first_name} ${s.last_name}` : String(p.student));
    setStudentSuggestions([]);
    setFormAmount(String(Number(p.amount).toFixed(2)));
    setFormMethod(p.payment_method);
    setFormReceipt(p.receipt_number);
    setFormStatus(p.status);
    // If backend includes term/year in response in future, set them; else default
    const m = new Date(p.date).getMonth() + 1;
    setFormTerm(m <= 4 ? '1' : m <= 8 ? '2' : '3');
    setFormYear(new Date(p.date).getFullYear());
    setFormRefDetails('');
    setFormRefNumber('');
    setFormTransferDate(new Date().toISOString().slice(0, 10));
    setFormBankName('');
    setShowEdit(true);
  };

  const openDelete = (p: Payment) => {
    setCurrent(p);
    setShowDelete(true);
  };

  const handleCreate = async () => {
    if (!formStudentId || !formAmount || !formMethod || !formReceipt) {
      showMessage('error', 'All fields are required');
      return;
    }
    const amountNum = Number(formAmount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      showMessage('error', 'Amount must be a positive number');
      return;
    }
    if (formMethod === 'Bank Transfer') {
      if (!formRefNumber || !formTransferDate || !formBankName) {
        showMessage('error', 'Bank transfer details are required');
        return;
      }
    }
    if (formMethod === 'Mobile Money' || formMethod === 'Card') {
      if (!formRefDetails) {
        showMessage('error', 'Reference details are required');
        return;
      }
    }
    try {
      await getApi().post('payments/', {
        student: Number(formStudentId),
        amount: amountNum.toFixed(2),
        payment_method: formMethod,
        receipt_number: formReceipt,
        status: formStatus,
        term: formTerm,
        academic_year: formYear,
        reference_details: formRefDetails || undefined,
        reference_number: formRefNumber || undefined,
        transfer_date: formTransferDate || undefined,
        bank_name: formBankName || undefined,
        cashier_id: (typeof window !== 'undefined') ? Number(localStorage.getItem('userId') || '') || undefined : undefined,
      });
      setShowCreate(false);
      await fetchData();
      showMessage('success', 'Payment added');
    } catch (e: any) {
      showMessage('error', extractErrorMessage(e));
    }
  };

  const handleEdit = async () => {
    if (!current) return;
    const amountNum = Number(formAmount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      showMessage('error', 'Amount must be a positive number');
      return;
    }
    if (formMethod === 'Bank Transfer') {
      if (!formRefNumber || !formTransferDate || !formBankName) {
        showMessage('error', 'Bank transfer details are required');
        return;
      }
    }
    if (formMethod === 'Mobile Money' || formMethod === 'Card') {
      if (!formRefDetails) {
        showMessage('error', 'Reference details are required');
        return;
      }
    }
    try {
      await getApi().patch(`payments/${current.id}/`, {
        student: Number(formStudentId),
        amount: amountNum.toFixed(2),
        payment_method: formMethod,
        receipt_number: formReceipt,
        status: formStatus,
        term: formTerm,
        academic_year: formYear,
        reference_details: formRefDetails || undefined,
        reference_number: formRefNumber || undefined,
        transfer_date: formTransferDate || undefined,
        bank_name: formBankName || undefined,
        cashier_id: (typeof window !== 'undefined') ? Number(localStorage.getItem('userId') || '') || undefined : undefined,
      });
      setShowEdit(false);
      await fetchData();
      showMessage('success', 'Payment updated');
    } catch (e: any) {
      showMessage('error', extractErrorMessage(e));
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    try {
      await getApi().delete(`payments/${current.id}/`);
      setShowDelete(false);
      await fetchData();
      showMessage('success', 'Payment deleted');
    } catch (e: any) {
      showMessage('error', extractErrorMessage(e));
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Payments</h1>
        <div className="space-x-2">
          <Link href="/payments/offline" className="px-4 py-2 rounded bg-white border border-zinc-200 hover:bg-zinc-50 font-medium transition-colors">Offline Queue</Link>
          {(role === 'admin' || role === 'staff') && (
            <button className="px-4 py-2 rounded bg-black text-white hover:bg-zinc-800 transition-colors font-medium" onClick={openCreate}>Add Payment</button>
          )}
        </div>
      </div>

      {notif && (
        <div className={`${notif.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} p-3 rounded mb-4`}>
          {notif.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <input
          className="border p-2 rounded flex-1 w-full md:w-auto focus:ring-2 focus:ring-black outline-none"
          placeholder="Search by student number or name"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />
        <div className="flex gap-2 w-full md:w-auto">
          <select className="border p-2 rounded focus:ring-2 focus:ring-black outline-none bg-white" value={sortKey} onChange={(e) => setSortKey(e.target.value as any)}>
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="status">Status</option>
          </select>
          <select className="border p-2 rounded focus:ring-2 focus:ring-black outline-none bg-white" value={sortDir} onChange={(e) => setSortDir(e.target.value as any)}>
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
          <select className="border p-2 rounded focus:ring-2 focus:ring-black outline-none bg-white" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="px-3 py-2 border rounded hover:bg-zinc-50 transition-colors bg-white font-medium text-sm" onClick={() => {
            const rows = enriched;
            const headers = ['Student #', 'Name', 'Amount', 'Method', 'Date', 'Status'];
            const csv = [headers.join(',')].concat(rows.map(r => [r.student_number, r.student_name, Number(r.amount).toFixed(2), r.payment_method, new Date(r.date).toLocaleDateString(), r.status].join(',')).join('\n'));
            const blob = new Blob(csv, { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'payments.csv'; a.click(); URL.revokeObjectURL(url);
          }}>Export CSV</button>
          <button className="px-3 py-2 border rounded hover:bg-zinc-50 transition-colors bg-white font-medium text-sm" onClick={async () => {
            const { default: jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            doc.text('Payments Export', 10, 10);
            let y = 20;
            enriched.forEach(r => {
              doc.text(`${r.student_number} ${r.student_name} ${Number(r.amount).toFixed(2)} ${r.payment_method} ${new Date(r.date).toLocaleDateString()} ${r.status}`, 10, y);
              y += 8;
            });
            doc.save('payments.pdf');
          }}>Export PDF</button>
        </div>
      </div>

      {filteredSortedPaged.total === 0 && (
        <div className="text-zinc-600">No payments found.</div>
      )}

      {filteredSortedPaged.total > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="text-left p-2 border-b">Student #</th>
                <th className="text-left p-2 border-b">Name</th>
                <th className="text-left p-2 border-b">Amount</th>
                <th className="text-left p-2 border-b">Method</th>
                <th className="text-left p-2 border-b">Date</th>
                <th className="text-left p-2 border-b">Status</th>
                <th className="text-left p-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSortedPaged.rows.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50">
                  <td className="p-2 border-b">{p.student_number}</td>
                  <td className="p-2 border-b">{p.student_name}</td>
                  <td className="p-2 border-b">{Number(p.amount).toFixed(2)}</td>
                  <td className="p-2 border-b">{p.payment_method}</td>
                  <td className="p-2 border-b">{formatDate(p.date)}</td>
                  <td className="p-2 border-b">{p.status}</td>
                  <td className="p-2 border-b space-x-2">
                    {(role === 'admin' || role === 'staff') && p.status !== 'posted' && (
                      <>
                        <button className="px-2 py-1 rounded bg-blue-600 text-white" onClick={() => openEdit(p)}>Edit</button>
                        <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => openDelete(p)}>Delete</button>
                      </>
                    )}
                    <Link href={`/payments/${p.id}`} className="px-2 py-1 rounded border">Details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredSortedPaged.total > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-zinc-600">Page {page} of {Math.max(1, Math.ceil(filteredSortedPaged.total / pageSize))}</div>
          <div className="space-x-2">
            <button className="px-3 py-2 rounded border" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</button>
            <button className="px-3 py-2 rounded border" onClick={() => setPage(page + 1)} disabled={(page * pageSize) >= filteredSortedPaged.total}>Next</button>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Payment</h2>
            <div className="relative mb-2">
              <input className="border p-2 w-full" placeholder="Search student by number or name" value={formStudentSearch} onChange={(e) => {
                const v = e.target.value;
                setFormStudentSearch(v);
                const list = students.filter(s => s.student_number.toLowerCase().includes(v.toLowerCase()) || `${s.first_name} ${s.last_name}`.toLowerCase().includes(v.toLowerCase()));
                setStudentSuggestions(list.slice(0, 5));
                setActiveSuggestionIndex(-1);
              }} />
              {studentSuggestions.length > 0 && (
                <div className="absolute z-10 bg-white border border-zinc-200 rounded-md shadow-lg w-full max-h-48 overflow-auto" style={{ top: '100%', left: 0, marginTop: '4px' }}>
                  {studentSuggestions.map((s) => (
                    <div key={s.id} className="px-3 py-2 cursor-pointer hover:bg-zinc-50" onClick={() => { setFormStudentId(String(s.id)); setFormStudentSearch(`${s.student_number} – ${s.first_name} ${s.last_name}`); setStudentSuggestions([]); }}>
                      {s.student_number} – {s.first_name} {s.last_name}{s.campus ? ` (${s.campus.name})` : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input className="border p-2 w-full mb-2" placeholder="Amount (USD)" type="number" step="0.01" inputMode="decimal" min="0" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
            <select className="border p-2 w-full mb-2" value={formMethod} onChange={(e) => setFormMethod(e.target.value)}>
              <option>Cash</option>
              <option>Card</option>
              <option>Bank Transfer</option>
              <option>Mobile Money</option>
            </select>
            {(formMethod === 'Mobile Money' || formMethod === 'Card') && (
              <input className="border p-2 w-full mb-2" placeholder="Reference Details (e.g., TXN ID)" value={formRefDetails} onChange={(e) => setFormRefDetails(e.target.value)} />
            )}
            {formMethod === 'Bank Transfer' && (
              <>
                <input className="border p-2 w-full mb-2" placeholder="Bank Reference Number" value={formRefNumber} onChange={(e) => setFormRefNumber(e.target.value)} />
                <input className="border p-2 w-full mb-2" type="date" placeholder="Transfer Date" value={formTransferDate} onChange={(e) => setFormTransferDate(e.target.value)} />
                <input className="border p-2 w-full mb-2" placeholder="Bank Name" value={formBankName} onChange={(e) => setFormBankName(e.target.value)} />
              </>
            )}
            <input className="border p-2 w-full mb-2" placeholder="Receipt Number" value={formReceipt} onChange={(e) => setFormReceipt(e.target.value)} />
            <select className="border p-2 w-full mb-2" value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)}>
              <option value="pending">Pending</option>
              <option value="posted">Posted</option>
              {(role === 'admin') && <option value="voided">Voided</option>}
            </select>
            <div className="text-sm text-zinc-600 mb-4"><strong>Term:</strong> {formTerm} &nbsp; <strong>Year:</strong> {formYear}</div>

            <div className="flex justify-end space-x-2">
              <button className="px-3 py-2 rounded border" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="px-3 py-2 rounded bg-black text-white" onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}

      {showEdit && current && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Payment</h2>
            <div className="relative mb-2">
              <input className="border p-2 w-full" placeholder="Search student by number or name" value={formStudentSearch} onChange={(e) => {
                const v = e.target.value;
                setFormStudentSearch(v);
                const list = students.filter(s => s.student_number.toLowerCase().includes(v.toLowerCase()) || `${s.first_name} ${s.last_name}`.toLowerCase().includes(v.toLowerCase()));
                setStudentSuggestions(list.slice(0, 5));
                setActiveSuggestionIndex(-1);
              }} />
              {studentSuggestions.length > 0 && (
                <div className="absolute z-10 bg-white border border-zinc-200 rounded-md shadow-lg w-full max-h-48 overflow-auto" style={{ top: '100%', left: 0, marginTop: '4px' }}>
                  {studentSuggestions.map((s) => (
                    <div key={s.id} className="px-3 py-2 cursor-pointer hover:bg-zinc-50" onClick={() => { setFormStudentId(String(s.id)); setFormStudentSearch(`${s.student_number} – ${s.first_name} ${s.last_name}`); setStudentSuggestions([]); }}>
                      {s.student_number} – {s.first_name} {s.last_name}{s.campus ? ` (${s.campus.name})` : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input className="border p-2 w-full mb-2" placeholder="Amount (USD)" type="number" step="0.01" inputMode="decimal" min="0" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
            <select className="border p-2 w-full mb-2" value={formMethod} onChange={(e) => setFormMethod(e.target.value)}>
              <option>Cash</option>
              <option>Card</option>
              <option>Bank Transfer</option>
              <option>Mobile Money</option>
            </select>
            {(formMethod === 'Mobile Money' || formMethod === 'Card') && (
              <input className="border p-2 w-full mb-2" placeholder="Reference Details (e.g., TXN ID)" value={formRefDetails} onChange={(e) => setFormRefDetails(e.target.value)} />
            )}
            {formMethod === 'Bank Transfer' && (
              <>
                <input className="border p-2 w-full mb-2" placeholder="Bank Reference Number" value={formRefNumber} onChange={(e) => setFormRefNumber(e.target.value)} />
                <input className="border p-2 w-full mb-2" type="date" placeholder="Transfer Date" value={formTransferDate} onChange={(e) => setFormTransferDate(e.target.value)} />
                <input className="border p-2 w-full mb-2" placeholder="Bank Name" value={formBankName} onChange={(e) => setFormBankName(e.target.value)} />
              </>
            )}
            <input className="border p-2 w-full mb-2" placeholder="Receipt Number" value={formReceipt} onChange={(e) => setFormReceipt(e.target.value)} />
            <select className="border p-2 w-full mb-2" value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)}>
              <option value="pending">Pending</option>
              <option value="posted">Posted</option>
              {(role === 'admin') && <option value="voided">Voided</option>}
            </select>
            <div className="text-sm text-zinc-600 mb-4"><strong>Term:</strong> {formTerm} &nbsp; <strong>Year:</strong> {formYear}</div>

            <div className="flex justify-end space-x-2">
              <button className="px-3 py-2 rounded border" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={handleEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showDelete && current && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Delete Payment</h2>
            <p className="mb-4">Are you sure you want to delete receipt {current.receipt_number}?</p>
            <div className="flex justify-end space-x-2">
              <button className="px-3 py-2 rounded border" onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="px-3 py-2 rounded bg-red-600 text-white" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
