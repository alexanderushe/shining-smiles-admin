import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getApi } from '../../lib/api';

type Campus = { id: number; name: string };
type Student = { id: number; student_number: string; first_name: string; last_name: string; campus: Campus };
type Payment = { id: number; student: number; amount: number; payment_method: string; receipt_number: string; status: 'pending'|'posted'|'voided'; date: string; cashier_name: string };

const PaymentDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [payment, setPayment] = useState<Payment | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const api = getApi();
        const p = await api.get(`payments/${id}/`);
        setPayment(p.data);
        const s = await api.get(`students/${p.data.student}/`);
        setStudent(s.data);
        setError(null);
      } catch (e: any) {
        setError('Failed to load payment');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!payment) return <div className="p-6">Not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Payment Details</h1>
      <div className="space-y-2">
        <div>Receipt: {payment.receipt_number}</div>
        <div>Student: {student ? `${student.student_number} – ${student.first_name} ${student.last_name}` : `#${payment.student}`}</div>
        <div>Amount: {payment.amount}</div>
        <div>Method: {payment.payment_method}</div>
        <div>Status: {payment.status}</div>
        <div>Cashier: {payment.cashier_name}</div>
        <div>Date: {new Date(payment.date).toLocaleDateString()}</div>
      </div>
    </div>
  );
};

export default PaymentDetail;