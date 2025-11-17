import { useState } from 'react';
import { getApi } from '../../lib/api';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
      }
      const api = getApi();
      const me = await api.get('auth/me/');
      if (typeof window !== 'undefined') {
        localStorage.setItem('userId', String(me.data.id));
        localStorage.setItem('userName', me.data.full_name || me.data.username || '');
        localStorage.setItem('userRole', 'staff');
      }
      router.push('/');
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm border rounded p-6">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <input className="border p-2 w-full mb-2" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="border p-2 w-full mb-4" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="px-4 py-2 rounded bg-black text-white w-full" onClick={handleLogin} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </div>
    </div>
  );
}
