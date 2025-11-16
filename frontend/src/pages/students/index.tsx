import type { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApi } from '../../lib/api';

type Campus = { id: number; name: string; location: string; code: string };
type Student = { id: number; student_number: string; first_name: string; last_name: string; dob: string; current_grade: string; campus: Campus };

const StudentList: NextPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [role, setRole] = useState<'admin' | 'staff' | 'viewer'>('viewer');

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [current, setCurrent] = useState<Student | null>(null);

  const [createStudentNumber, setCreateStudentNumber] = useState('');
  const [createFirstName, setCreateFirstName] = useState('');
  const [createLastName, setCreateLastName] = useState('');
  const [createDob, setCreateDob] = useState('');
  const [createGrade, setCreateGrade] = useState('');
  const [createCampusId, setCreateCampusId] = useState('');

  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [campuses, setCampuses] = useState<Campus[]>([]);

  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<'student_number' | 'first_name' | 'last_name' | 'current_grade' | 'campus'>('student_number');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchStudents = async () => {
    try {
      const res = await getApi().get('students/');
      setStudents(res.data);
      setError(null);
    } catch (e: any) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const r = typeof window !== 'undefined' ? (localStorage.getItem('userRole') as 'admin' | 'staff' | 'viewer' | null) : null;
    if (r) setRole(r);
    else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', 'admin');
        setRole('admin');
      }
    }
    fetchStudents();
    (async () => {
      try {
        const res = await getApi().get('students/campuses/');
        setCampuses(res.data);
      } catch (e: any) {
      }
    })();
  }, []);

  const showMessage = (type: 'success' | 'error', message: string) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 3000);
  };

  const extractErrorMessage = (e: any) => {
    const data = e?.response?.data;
    if (!data) return 'Request failed';
    if (typeof data === 'string') return data;
    try {
      return JSON.stringify(data);
    } catch {
      return 'Request failed';
    }
  };

  const openCreate = () => {
    setCreateStudentNumber('');
    setCreateFirstName('');
    setCreateLastName('');
    setCreateDob('');
    setCreateGrade('');
    setCreateCampusId('');
    setShowCreate(true);
  };

  const openEdit = (s: Student) => {
    setCurrent(s);
    setEditFirstName(s.first_name);
    setEditLastName(s.last_name);
    setEditGrade(s.current_grade);
    setShowEdit(true);
  };

  const openDelete = (s: Student) => {
    setCurrent(s);
    setShowDelete(true);
  };

  const handleCreate = async () => {
    // simple client-side validation to prevent 400s
    if (!createStudentNumber || !createFirstName || !createLastName || !createDob || !createGrade || !createCampusId) {
      showMessage('error', 'All fields are required');
      return;
    }
    if (/\s/.test(createStudentNumber)) {
      showMessage('error', 'Student number cannot contain whitespace');
      return;
    }
    const campusIdNum = Number(createCampusId);
    if (Number.isNaN(campusIdNum)) {
      showMessage('error', 'Campus ID must be a number');
      return;
    }
    try {
      await getApi().post('students/', {
        student_number: createStudentNumber,
        first_name: createFirstName,
        last_name: createLastName,
        dob: createDob,
        current_grade: createGrade,
        campus_id: campusIdNum,
      });
      setShowCreate(false);
      await fetchStudents();
      showMessage('success', 'Student created');
    } catch (e: any) {
      showMessage('error', extractErrorMessage(e));
    }
  };

  const handleEdit = async () => {
    if (!current) return;
    try {
      await getApi().patch(`students/${current.id}/`, {
        first_name: editFirstName,
        last_name: editLastName,
        current_grade: editGrade,
      });
      setShowEdit(false);
      await fetchStudents();
      showMessage('success', 'Student updated');
    } catch (e: any) {
      showMessage('error', extractErrorMessage(e));
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    try {
      await getApi().delete(`students/${current.id}/`);
      setShowDelete(false);
      await fetchStudents();
      showMessage('success', 'Student deleted');
    } catch (e: any) {
      showMessage('error', extractErrorMessage(e));
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Students</h1>
        {(role === 'admin' || role === 'staff') && (
          <button className="px-4 py-2 rounded bg-black text-white" onClick={openCreate}>Create Student</button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input className="border p-2 flex-1" placeholder="Search by name or student number" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
        <select className="border p-2" value={sortKey} onChange={(e) => setSortKey(e.target.value as any)}>
          <option value="student_number">Student #</option>
          <option value="first_name">First Name</option>
          <option value="last_name">Last Name</option>
          <option value="current_grade">Grade</option>
          <option value="campus">Campus</option>
        </select>
        <select className="border p-2" value={sortDir} onChange={(e) => setSortDir(e.target.value as any)}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        <select className="border p-2" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {notif && (
        <div className={`${notif.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} p-3 rounded mb-4`}>
          {notif.message}
        </div>
      )}

      {students.length === 0 && (
        <div className="text-zinc-600 mb-4">No students found.</div>
      )}

      {students.length > 0 && (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="text-left p-2 border-b">Student #</th>
              <th className="text-left p-2 border-b">First Name</th>
              <th className="text-left p-2 border-b">Last Name</th>
              <th className="text-left p-2 border-b">Grade</th>
              <th className="text-left p-2 border-b">Campus</th>
              <th className="text-left p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students
              .filter((s) => {
                const q = query.trim().toLowerCase();
                if (!q) return true;
                return (
                  s.student_number.toLowerCase().includes(q) ||
                  s.first_name.toLowerCase().includes(q) ||
                  s.last_name.toLowerCase().includes(q)
                );
              })
              .sort((a, b) => {
                const dir = sortDir === 'asc' ? 1 : -1;
                if (sortKey === 'campus') {
                  const av = a.campus?.name || '';
                  const bv = b.campus?.name || '';
                  return av.localeCompare(bv) * dir;
                }
                const av = String(a[sortKey] as any).toLowerCase();
                const bv = String(b[sortKey] as any).toLowerCase();
                return av.localeCompare(bv) * dir;
              })
              .slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
              .map((s) => (
              <tr key={s.id} className="hover:bg-zinc-50">
                <td className="p-2 border-b">
                  <Link href={`/students/${s.id}`} className="text-blue-600">{s.student_number}</Link>
                </td>
                <td className="p-2 border-b">{s.first_name}</td>
                <td className="p-2 border-b">{s.last_name}</td>
                <td className="p-2 border-b">{s.current_grade}</td>
                <td className="p-2 border-b">{s.campus?.name}</td>
                <td className="p-2 border-b space-x-2">
                  {(role === 'admin' || role === 'staff') && (
                    <>
                      <button className="px-2 py-1 rounded bg-blue-600 text-white" onClick={() => openEdit(s)}>Edit</button>
                      <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => openDelete(s)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {students.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-zinc-600">
            Page {page} of {Math.max(1, Math.ceil(students.filter((s) => {
              const q = query.trim().toLowerCase();
              if (!q) return true;
              return (
                s.student_number.toLowerCase().includes(q) ||
                s.first_name.toLowerCase().includes(q) ||
                s.last_name.toLowerCase().includes(q)
              );
            }).length / pageSize))}
          </div>
          <div className="space-x-2">
            <button className="px-3 py-2 rounded border" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</button>
            <button className="px-3 py-2 rounded border" onClick={() => setPage(page + 1)} disabled={(page * pageSize) >= students.filter((s) => {
              const q = query.trim().toLowerCase();
              if (!q) return true;
              return (
                s.student_number.toLowerCase().includes(q) ||
                s.first_name.toLowerCase().includes(q) ||
                s.last_name.toLowerCase().includes(q)
              );
            }).length}>Next</button>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Student</h2>
            <input className="border p-2 w-full mb-2" placeholder="Student Number" value={createStudentNumber} onChange={(e) => setCreateStudentNumber(e.target.value)} />
            <input className="border p-2 w-full mb-2" placeholder="First Name" value={createFirstName} onChange={(e) => setCreateFirstName(e.target.value)} />
            <input className="border p-2 w-full mb-2" placeholder="Last Name" value={createLastName} onChange={(e) => setCreateLastName(e.target.value)} />
            <input type="date" className="border p-2 w-full mb-2" placeholder="Date of Birth" value={createDob} onChange={(e) => setCreateDob(e.target.value)} />
            <input className="border p-2 w-full mb-2" placeholder="Current Grade" value={createGrade} onChange={(e) => setCreateGrade(e.target.value)} />
            <select className="border p-2 w-full mb-4" value={createCampusId} onChange={(e) => setCreateCampusId(e.target.value)}>
              <option value="">Select Campus</option>
              {campuses.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name} ({c.code})</option>
              ))}
            </select>
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
            <h2 className="text-xl font-semibold mb-4">Edit Student</h2>
            <input className="border p-2 w-full mb-2" placeholder="First Name" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
            <input className="border p-2 w-full mb-2" placeholder="Last Name" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
            <input className="border p-2 w-full mb-4" placeholder="Current Grade" value={editGrade} onChange={(e) => setEditGrade(e.target.value)} />
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
            <h2 className="text-xl font-semibold mb-4">Delete Student</h2>
            <p className="mb-4">Are you sure you want to delete {current.first_name} {current.last_name}?</p>
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

export default StudentList;
