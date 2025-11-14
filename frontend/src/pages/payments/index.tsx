import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { getApi } from '../../lib/api';

type Payment = { id: number; studentId: number; amount: number; feeType: string; date: string };

const PaymentQueue: NextPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const api = getApi();
        const res = await api.get('payments/');
        setPayments(res.data);
      } catch (e: any) {
        setError('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Payments</h1>
      <ul className="space-y-2">
        {payments.map((p) => (
          <li key={p.id} className="border p-2 rounded">
            Student #{p.studentId} – {p.feeType} – {p.amount} on {p.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PaymentQueue;
