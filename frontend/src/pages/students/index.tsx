import type { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApi } from '../../lib/api';

type Student = { id: number; name: string };

const StudentList: NextPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const api = getApi();
        const res = await api.get('students/');
        setStudents(res.data);
      } catch (e: any) {
        setError('Failed to load students');
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
      <h1 className="text-2xl font-semibold mb-4">Students</h1>
      <ul className="space-y-2">
        {students.map((s) => (
          <li key={s.id}>
            <Link href={`/students/${s.id}`} className="text-blue-600">
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentList;
