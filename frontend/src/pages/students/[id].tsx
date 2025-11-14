import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getApi } from '../../lib/api'; // client-safe API
import { generateStatementPDF } from '../../lib/pdf';

type Transaction = { description: string; Payments: number; Fees_Levies: number };
type Student = { id: number; name: string; transactions: Transaction[] };

const StudentProfile: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const run = async () => {
      try {
        const api = getApi(); // get API instance inside client-only code
        const res = await api.get(`students/${id}/`);
        setStudent(res.data);
      } catch (e: any) {
        console.error(e);
        setError('Failed to load student');
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
      <h1 className="text-2xl font-semibold mb-4">{student.name}</h1>
      <button
        className="px-4 py-2 rounded bg-black text-white"
        onClick={() => generateStatementPDF(student.name, student.transactions || [])}
      >
        Generate Statement PDF
      </button>
      <h2 className="text-xl mt-6 mb-2">Transactions</h2>
      <ul className="space-y-2">
        {(student.transactions || []).map((t, idx) => (
          <li key={idx} className="border p-2 rounded">
            {t.description} – Paid: {t.Payments} – Due: {t.Fees_Levies}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentProfile;
