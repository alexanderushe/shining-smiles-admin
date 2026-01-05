import type { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { getApi } from '../../lib/api';
import { AddPaymentDialog } from '../../../components/payments/add-payment-dialog';
import { VoidPaymentDialog } from '../../../components/payments/void-payment-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Download, FileText, MoreHorizontal, Loader2, ArrowUpDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Campus = { id: number; name: string };
type Student = { id: number; student_number: string; first_name: string; last_name: string; campus: Campus };
type Payment = {
  id: number;
  student: number | {
    id: number;
    first_name: string;
    last_name: string;
    student_number: string;
  };
  amount: number;
  payment_method: string;
  receipt_number: string;
  status: 'pending' | 'posted' | 'voided';
  date: string;
  cashier_name: string;
  fee_type?: string;
  reference_id?: string;
  bank_name?: string;
  merchant_provider?: string;
  void_reason?: string;
  voided_at?: string;
  voided_by?: string;
};

const PaymentsPage: NextPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [role, setRole] = useState<'admin' | 'staff' | 'viewer'>('viewer');

  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<'amount' | 'date' | 'status'>('date');
  // Default to descending sort for "Most Recent"
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showVoid, setShowVoid] = useState(false);
  const [current, setCurrent] = useState<Payment | null>(null);

  // Form states for Edit/Delete only now
  const [formStudentId, setFormStudentId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formMethod, setFormMethod] = useState('Cash');
  const [formReceipt, setFormReceipt] = useState('');
  const [formStatus, setFormStatus] = useState<'pending' | 'posted' | 'voided'>('pending');

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const api = getApi();

      // Build ordering parameter for backend
      // Map frontend sortKey to backend field names
      const orderingMap: Record<string, string> = {
        'date': 'date',
        'amount': 'amount',
        'status': 'status'
      };
      const orderField = orderingMap[sortKey] || 'date';
      const orderPrefix = sortDir === 'desc' ? '-' : '';
      const ordering = `${orderPrefix}${orderField},${orderPrefix}id`; // Use ID as tiebreaker

      const [pRes, sRes] = await Promise.all([
        api.get(`payments/?page=${page}&page_size=${pageSize}&ordering=${ordering}`),
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
      setStudents(sRes.data); if (typeof window !== 'undefined') localStorage.setItem('cachedStudents', JSON.stringify(sRes.data));
      setError(null);
    } catch (e: any) {
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortKey, sortDir]);

  useEffect(() => {
    const r = typeof window !== 'undefined' ? (localStorage.getItem('userRole') as 'admin' | 'staff' | 'viewer' | null) : null;
    if (r) setRole(r); else { if (typeof window !== 'undefined') { localStorage.setItem('userRole', 'admin'); setRole('admin'); } }
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const studentById = useMemo(() => {
    const map: Record<number, Student> = {};
    students.forEach(s => { map[s.id] = s; });
    return map;
  }, [students]);

  const enriched = useMemo(() => {
    return payments.map(p => {
      const studentId = typeof p.student === 'number' ? p.student : p.student.id;
      const s = studentById[studentId];
      const name = s ? `${s.first_name} ${s.last_name}` : `#${studentId}`;
      const number = s ? s.student_number : `#${studentId}`;
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

      // Date Sort: Use ID as tiebreaker/proxy for time if dates are equal
      if (sortKey === 'date') {
        const av = new Date(a.date).getTime();
        const bv = new Date(b.date).getTime();
        if (av !== bv) return (av - bv) * dir;
        // If dates are equal, sort by ID (assuming higher ID = newer)
        return (a.id - b.id) * dir;
      }
      return 0;
    });
    return { rows: sorted, total: q ? sorted.length : totalCount };
  }, [enriched, query, sortKey, sortDir, totalCount]);

  const openCreate = () => {
    setShowCreate(true);
  };

  const openEdit = (p: Payment) => {
    setCurrent(p);
    const studentId = typeof p.student === 'number' ? p.student : p.student.id;

    setFormStudentId(String(studentId));
    setFormAmount(String(p.amount));
    setFormMethod(p.payment_method);
    setFormReceipt(p.receipt_number);
    setFormStatus(p.status);
    setShowEdit(true);
  };

  const openDelete = (p: Payment) => {
    setCurrent(p);
    setShowDelete(true);
  };

  const openDetails = (p: Payment) => {
    setCurrent(p);
    setShowDetails(true);
  };

  const openVoid = (p: Payment) => {
    // Expand student object if it's just an ID
    if (typeof p.student === 'number') {
      const s = studentById[p.student];
      if (s) {
        setCurrent({
          ...p,
          student: {
            id: s.id,
            first_name: s.first_name,
            last_name: s.last_name,
            student_number: s.student_number,
          },
        });
      } else {
        setCurrent(p);
      }
    } else {
      setCurrent(p);
    }
    setShowVoid(true);
  };

  const handleEdit = async () => {
    if (!current) return;
    const amountNum = Number(formAmount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      showMessage('error', 'Amount must be a positive number');
      return;
    }

    // Auto-calculate term and year based on current date
    const now = new Date();
    const month = now.getMonth() + 1;
    const term = month <= 4 ? '1' : month <= 8 ? '2' : '3';
    const academicYear = now.getFullYear();

    try {
      await getApi().patch(`payments/${current.id}/`, {
        student: Number(formStudentId),
        amount: amountNum,
        payment_method: formMethod,
        receipt_number: formReceipt,
        status: formStatus,
        term: term,
        academic_year: academicYear,
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

  const handleExportCSV = () => {
    const rows = enriched;
    const headers = ['Student #', 'Name', 'Amount', 'Method', 'Date', 'Status'];
    const csv = [headers.join(',')].concat(rows.map(r => [r.student_number, r.student_name, r.amount, r.payment_method, new Date(r.date).toLocaleDateString(), r.status].join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'payments.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.text('Payments Export', 10, 10);
    let y = 20;
    enriched.forEach(r => {
      doc.text(`${r.student_number} ${r.student_name} ${r.amount} ${r.payment_method} ${new Date(r.date).toLocaleDateString()} ${r.status}`, 10, y);
      y += 8;
    });
    doc.save('payments.pdf');
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href="/payments/offline">Offline Queue</Link>
          </Button>
          {(role === 'admin' || role === 'staff') && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add Payment
            </Button>
          )}
        </div>
      </div>

      {notif && (
        <div className={`${notif.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} p-3 rounded-md mb-4`}>
          {notif.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-8"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <FileText className="mr-2 h-4 w-4" /> Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileText className="mr-2 h-4 w-4" /> Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={sortKey} onValueChange={(val: any) => setSortKey(val)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortDir} onValueChange={(val: any) => setSortDir(val)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Desc</SelectItem>
                  <SelectItem value="asc">Asc</SelectItem>
                </SelectContent>
              </Select>

              <Select value={String(pageSize)} onValueChange={(val) => { setPageSize(Number(val)); setPage(1); }}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Student #</TableHead>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="text-right font-bold">Amount</TableHead>
                  <TableHead className="font-bold">Method</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSortedPaged.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSortedPaged.rows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.student_number}</TableCell>
                      <TableCell className="font-medium">{p.student_name}</TableCell>
                      <TableCell className="text-right font-medium">${Number(p.amount).toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{p.payment_method}</TableCell>
                      <TableCell>{formatDate(p.date)}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'posted' ? 'default' : p.status === 'voided' ? 'destructive' : 'secondary'}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDetails(p)}>
                              View Details
                            </DropdownMenuItem>
                            {/* Actions Logic:
                                - Admin: Can Edit/Void/Delete (Void works for any status except already voided)
                                - Cashier: Can Edit ONLY Pending
                                - Voided payments: Read-only for everyone
                            */}
                            {p.status !== 'voided' && (
                              <>
                                {/* Edit - Only for non-posted payments */}
                                {p.status !== 'posted' && (role === 'admin' || role === 'staff') && (
                                  <DropdownMenuItem onClick={() => openEdit(p)}>
                                    Edit Payment
                                  </DropdownMenuItem>
                                )}

                                {/* Void - Admin only, any status except voided */}
                                {role === 'admin' && (
                                  <DropdownMenuItem onClick={() => openVoid(p)} className="text-orange-600 focus:text-orange-600">
                                    Void Payment
                                  </DropdownMenuItem>
                                )}

                                {/* Delete - Admin only, not posted */}
                                {role === 'admin' && p.status !== 'posted' && (
                                  <DropdownMenuItem onClick={() => openDelete(p)} className="text-red-600 focus:text-red-600">
                                    Delete Payment
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {filteredSortedPaged.total > 0 ? (
                <>Page {page} of {Math.max(1, Math.ceil(filteredSortedPaged.total / pageSize))}</>
              ) : (
                '0 results'
              )}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={(page * pageSize) >= filteredSortedPaged.total}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddPaymentDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onPaymentAdded={() => {
          fetchData();
          showMessage('success', 'Payment added');
        }}
      />

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>
              Update payment details. Status changes may be restricted.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="student" className="text-sm font-medium">Student</label>
              <Select value={formStudentId} onValueChange={setFormStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.student_number} – {s.first_name} {s.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="amount" className="text-sm font-medium">Amount</label>
              <Input id="amount" placeholder="Amount" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="method" className="text-sm font-medium">Method</label>
              <Select value={formMethod} onValueChange={setFormMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Select value={formStatus} onValueChange={(val: any) => setFormStatus(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                  {(role === 'admin') && <SelectItem value="voided">Voided</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment receipt? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">Receipt: {current?.receipt_number}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Transaction Information
            </DialogDescription>
          </DialogHeader>
          {current && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Receipt Number</label>
                  <p className="text-sm font-medium mt-1">{current.receipt_number}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Date</label>
                  <p className="text-sm font-medium mt-1">{formatDate(current.date)}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Student</label>
                <p className="text-sm font-medium mt-1">{(current as any).student_name} ({(current as any).student_number})</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Amount</label>
                  <p className="text-lg font-bold mt-1">${Number(current.amount).toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Fee Type</label>
                  <p className="text-sm font-medium mt-1 capitalize">{current.fee_type?.replace(/_/g, ' ') || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2">
                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Payment Method</label>
                  <p className="text-sm font-medium mt-1">{current.payment_method}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Status</label>
                  <div className="mt-1">
                    <Badge variant={current.status === 'posted' ? 'default' : current.status === 'voided' ? 'destructive' : 'secondary'}>
                      {current.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {(current.payment_method === 'Bank Transfer' || current.payment_method === 'Mobile Money') && (
                <div className="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded-md">
                  {current.bank_name && (
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Bank Name</label>
                      <p className="text-sm font-medium mt-1">{current.bank_name}</p>
                    </div>
                  )}
                  {current.merchant_provider && (
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Provider</label>
                      <p className="text-sm font-medium mt-1">{current.merchant_provider}</p>
                    </div>
                  )}
                  {current.reference_id && (
                    <div className="col-span-2">
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Reference ID</label>
                      <p className="text-sm font-mono mt-1">{current.reference_id}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Cashier</label>
                <p className="text-sm font-medium mt-1">{current.cashier_name}</p>
              </div>

            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Dialog */}
      <VoidPaymentDialog
        open={showVoid}
        onOpenChange={setShowVoid}
        payment={current}
        onVoided={() => {
          fetchData();
          showMessage('success', 'Payment voided successfully');
        }}
      />
    </div>
  );
};

export default PaymentsPage;
