import type { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { getApi } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, FileText, ArrowLeft } from 'lucide-react';

type VoidedPayment = {
    id: number;
    receipt_number: string;
    student: {
        id: number;
        first_name: string;
        last_name: string;
        student_number: string;
    } | number;
    amount: number;
    payment_method: string;
    fee_type?: string;
    date: string;
    void_reason: string;
    voided_at: string;
    voided_by: string;
    cashier_name: string;
};

const VoidHistoryPage: NextPage = () => {
    const [payments, setPayments] = useState<VoidedPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const formatDate = (iso: string) => {
        try {
            const d = new Date(iso);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        } catch { return iso; }
    };

    const formatDateTime = (iso: string) => {
        try {
            const d = new Date(iso);
            return d.toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch { return iso; }
    };

    const fetchVoidedPayments = useCallback(async () => {
        setLoading(true);
        try {
            const api = getApi();
            const res = await api.get(`payments/?status=voided&ordering=-voided_at&page=${page}&page_size=${pageSize}`);
            const data = res.data;

            if (data && Array.isArray(data.results)) {
                setPayments(data.results);
                setTotalCount(data.count || 0);
            } else {
                setPayments(data);
                setTotalCount(Array.isArray(data) ? data.length : 0);
            }
        } catch (e: any) {
            console.error('Failed to load voided payments:', e);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize]);

    useEffect(() => {
        fetchVoidedPayments();
    }, [fetchVoidedPayments]);

    const filteredPayments = payments.filter(p => {
        if (!query) return true;
        const q = query.toLowerCase();
        const studentName = typeof p.student === 'number' ? '' : `${p.student.first_name} ${p.student.last_name}`.toLowerCase();
        const studentNum = typeof p.student === 'number' ? '' : p.student.student_number.toLowerCase();
        return studentName.includes(q) || studentNum.includes(q) || p.receipt_number.toLowerCase().includes(q);
    });

    const handleExportCSV = () => {
        const headers = ['Receipt #', 'Student', 'Amount', 'Method', 'Original Date', 'Void Reason', 'Voided By', 'Voided At'];
        const rows = filteredPayments.map(p => {
            const studentName = typeof p.student === 'number' ? `#${p.student}` : `${p.student.first_name} ${p.student.last_name}`;
            return [
                p.receipt_number,
                studentName,
                p.amount,
                p.payment_method,
                formatDate(p.date),
                p.void_reason,
                p.voided_by,
                formatDateTime(p.voided_at)
            ].join(',');
        });
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `void_history_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <Button variant="ghost" asChild className="mb-2">
                        <Link href="/payments">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payments
                        </Link>
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">Void History</h2>
                    <p className="text-muted-foreground">All voided payment transactions with audit trail</p>
                </div>
                <Button onClick={handleExportCSV} variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Voided Payments ({totalCount})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 py-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by student, receipt number..."
                                className="pl-8"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-bold">Receipt #</TableHead>
                                    <TableHead className="font-bold">Student</TableHead>
                                    <TableHead className="text-right font-bold">Amount</TableHead>
                                    <TableHead className="font-bold">Method</TableHead>
                                    <TableHead className="font-bold">Fee Type</TableHead>
                                    <TableHead className="font-bold">Original Date</TableHead>
                                    <TableHead className="font-bold">Void Reason</TableHead>
                                    <TableHead className="font-bold">Voided By</TableHead>
                                    <TableHead className="font-bold">Voided At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredPayments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            No voided payments found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPayments.map((p) => {
                                        const studentName = typeof p.student === 'number' ? `#${p.student}` : `${p.student.first_name} ${p.student.last_name}`;
                                        const studentNum = typeof p.student === 'number' ? '' : p.student.student_number;

                                        return (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-mono">{p.receipt_number}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{studentName}</div>
                                                    {studentNum && <div className="text-xs text-muted-foreground">{studentNum}</div>}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">${Number(p.amount).toFixed(2)}</TableCell>
                                                <TableCell className="capitalize">{p.payment_method}</TableCell>
                                                <TableCell className="capitalize">{p.fee_type?.replace(/_/g, ' ') || 'N/A'}</TableCell>
                                                <TableCell>{formatDate(p.date)}</TableCell>
                                                <TableCell className="max-w-xs">
                                                    <div className="truncate" title={p.void_reason}>
                                                        {p.void_reason}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{p.voided_by}</TableCell>
                                                <TableCell className="text-xs">{formatDateTime(p.voided_at)}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-end space-x-2 py-4">
                        <div className="flex-1 text-sm text-muted-foreground">
                            {totalCount > 0 ? (
                                <>Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}</>
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
                                disabled={(page * pageSize) >= totalCount}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default VoidHistoryPage;
