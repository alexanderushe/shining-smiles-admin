import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getQueue, addToQueue, flushQueue, removeFromQueue, type Payment } from '../../lib/offlineQueue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Trash, RefreshCw, Plus, ArrowLeft, Loader2, Check, ChevronsUpDown, Info } from 'lucide-react';
import { cn } from "@/lib/utils"

type CachedStudent = { id: number; student_number: string; first_name: string; last_name: string; };

const OfflinePaymentsPage: React.FC = () => {
  const [queue, setQueue] = useState<Payment[]>([]);
  const [results, setResults] = useState<{ ok: boolean; error?: string }[] | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [cachedStudents, setCachedStudents] = useState<CachedStudent[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);

  // Add Form State
  const [showAdd, setShowAdd] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<CachedStudent | null>(null);
  const [manualStudentNumber, setManualStudentNumber] = useState('');
  const [amount, setAmount] = useState<number>(0);

  // NOTE: In previous version validation, 'feeType' was used for Payment Method (Cash, etc).
  // But online form has BOTH 'feeType' (Tuition) AND 'paymentMethod' (Cash).
  // I will rename state to be clear and match online form.
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [feeType, setFeeType] = useState<string>('Tuition'); // New field

  // Conditional Fields
  const [bankName, setBankName] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [merchantProvider, setMerchantProvider] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-calculated defaults (Hidden)
  const [date, setDate] = useState<string>('');
  const [cashierName, setCashierName] = useState<string>('');
  const [term, setTerm] = useState<string>('1');
  const [academicYear, setAcademicYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    setQueue(getQueue());
    const cn = typeof window !== 'undefined' ? (localStorage.getItem('userName') || localStorage.getItem('cashierName') || '') : '';
    if (cn) setCashierName(cn);

    // Set Defaults
    const d = new Date();
    setDate(d.toISOString().split('T')[0]);
    const month = d.getMonth() + 1;
    setTerm(month <= 4 ? '1' : month <= 8 ? '2' : '3');
    setAcademicYear(d.getFullYear());

    // Load Cached Students
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('cachedStudents');
      if (cached) {
        try { setCachedStudents(JSON.parse(cached)); } catch (e) { console.error('Failed to parse cached students'); }
      }
    }
  }, []);

  const handleAddPayment = () => {
    const studentNum = selectedStudent ? selectedStudent.student_number : manualStudentNumber;
    const studentId = selectedStudent ? selectedStudent.id : 0;

    if (!studentNum && !studentId) {
      alert('Please select a student or enter a student number.');
      return;
    }
    if (!amount || !paymentMethod) {
      alert('Please fill all required fields.');
      return;
    }

    const payment: Payment = {
      studentId,
      studentNumber: studentNum,
      amount: Number(amount),

      // Use new field structure
      paymentMethod,  // 'Cash', 'Card', 'Bank Transfer', 'Mobile Money'
      feeCategory: feeType,  // 'Tuition', 'Transport', 'Boarding', etc.

      date,
      cashierName,
      term,
      academicYear,

      // Extra fields based on payment method
      bankName: paymentMethod === 'Bank Transfer' ? bankName : undefined,
      referenceId: (paymentMethod === 'Bank Transfer' || paymentMethod === 'Mobile Money') ? referenceId : undefined,
      merchantProvider: paymentMethod === 'Mobile Money' ? merchantProvider : undefined,
      notes
    };
    addToQueue(payment);
    setQueue(getQueue());
    setShowAdd(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setManualStudentNumber('');
    setAmount(0);
    setPaymentMethod('Cash');
    setFeeType('Tuition');
    setBankName('');
    setReferenceId('');
    setMerchantProvider('');
    setNotes('');
    const d = new Date();
    setDate(d.toISOString().split('T')[0]);
  };

  const handleFlushQueue = async () => {
    setSyncing(true);
    setResults(null);
    try {
      const res = await flushQueue();
      setResults(res.map(r => ({ ok: r.ok, error: r.error })));
      setQueue(getQueue());
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const [role, setRole] = useState<'admin' | 'staff' | 'viewer'>('viewer');

  useEffect(() => {
    // ... existing initialization ...
    const r = typeof window !== 'undefined' ? (localStorage.getItem('userRole') as 'admin' | 'staff' | 'viewer' | null) : null;
    if (r) setRole(r);
  }, []);

  const handleRemove = (index: number) => {
    if (confirm('Are you sure you want to remove this payment from the queue?')) {
      removeFromQueue(index);
      setQueue(getQueue());
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/payments"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Offline Queue</h2>
            <p className="text-muted-foreground text-sm">Transactions recorded here get pending receipts until synced.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Offline Payment</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Offline Payment</DialogTitle>
                <DialogDescription>
                  Use cached student data. Date and Term are auto-assigned.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Student <span className="text-rose-500">*</span></Label>
                  {cachedStudents.length > 0 ? (
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openCombobox} className="w-full justify-between">
                          {selectedStudent ? `${selectedStudent.student_number} - ${selectedStudent.first_name} ${selectedStudent.last_name}` : "Search student..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Search student..." />
                          <CommandList>
                            <CommandEmpty>No student found.</CommandEmpty>
                            <CommandGroup>
                              {cachedStudents.slice(0, 50).map((student) => (
                                <CommandItem key={student.id} value={student.student_number + " " + student.first_name} onSelect={() => {
                                  setSelectedStudent(student);
                                  setOpenCombobox(false);
                                }}>
                                  <Check className={cn("mr-2 h-4 w-4", selectedStudent?.id === student.id ? "opacity-100" : "opacity-0")} />
                                  {student.student_number} - {student.first_name} {student.last_name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Input
                      placeholder="Enter Student ID manually (Cache empty)"
                      value={manualStudentNumber}
                      onChange={e => setManualStudentNumber(e.target.value)}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Fee Type - Currently purely visual as not added to interface yet, but requested for consistency */}
                  <div className="grid gap-2">
                    <Label>Fee Type</Label>
                    <Select value={feeType} onValueChange={setFeeType}>
                      <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tuition">Tuition</SelectItem>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="Boarding">Boarding</SelectItem>
                        <SelectItem value="Registration">Registration</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Amount (USD) <span className="text-rose-500">*</span></Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input type="number" className="pl-7" placeholder="0.00" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Payment Method <span className="text-rose-500">*</span></Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Card">Debit/Credit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === "Bank Transfer" && (
                  <div className="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded-md transition-all">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input placeholder="e.g. Stanbic" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Reference Number</Label>
                      <Input placeholder="Ref #" value={referenceId} onChange={(e) => setReferenceId(e.target.value)} />
                    </div>
                  </div>
                )}

                {paymentMethod === "Mobile Money" && (
                  <div className="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded-md transition-all">
                    <div className="space-y-2">
                      <Label>Provider/Merchant</Label>
                      <Input placeholder="e.g. EcoCash" value={merchantProvider} onChange={(e) => setMerchantProvider(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Reference Number</Label>
                      <Input placeholder="Ref #" value={referenceId} onChange={(e) => setReferenceId(e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Input placeholder="Add any additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddPayment}>Add to Queue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={handleFlushQueue} disabled={queue.length === 0 || syncing}>
            {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Sync Now
          </Button>
        </div>
      </div>

      {results && (
        <div className="space-y-2">
          {results.map((r, idx) => (
            <div key={idx} className={`p-3 rounded border text-sm ${r.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {r.ok ? 'Success: Payment synced' : `Error: ${r.error}`}
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pending Transactions</CardTitle>
          <CardDescription>{queue.length} payments waiting to sync. Receipts will be generated upon sync.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Student</TableHead>
                  <TableHead className="font-bold">Amount</TableHead>
                  <TableHead className="font-bold">Method</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Queue is empty.
                    </TableCell>
                  </TableRow>
                ) : (
                  queue.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{p.studentNumber || p.studentId}</TableCell>
                      <TableCell>${p.amount}</TableCell>
                      <TableCell>{p.feeType}</TableCell>
                      <TableCell>{p.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pending Sync
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {role === 'admin' && (
                          <Button variant="ghost" size="icon" onClick={() => handleRemove(idx)} className="h-8 w-8 text-red-500 hover:text-red-700">
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflinePaymentsPage;
