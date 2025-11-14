import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getApi } from '../../lib/api';
import { generateStatementPDF } from '../../lib/pdf';

type Transaction = { description: string; Payments: number; Fees_Levies: number };
type Student = { id: number; name: string; transactions: Transaction[] };

const Statement: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      try {
        const api = getApi();
        const res = await api.get(`reports/${id}/`);
        setStudent(res.data);
      } catch (e: any) {
        setError('Failed to load statement');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!student) return <div>Not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Statement: {student.name}</h1>
      <button
        className="px-4 py-2 rounded bg-black text-white"
        onClick={() => generateStatementPDF(student.name, student.transactions || [])}
      >
        Download PDF
      </button>
    </div>
  );
};

export default Statement;
