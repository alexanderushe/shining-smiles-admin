import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { getApi } from '../../lib/api';

type Notification = { id: number; title: string; body: string; created_at: string };

const Notifications: NextPage = () => {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const api = getApi();
        const res = await api.get('notifications/');
        setItems(res.data);
      } catch (e: any) {
        setError('Failed to load notifications');
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
      <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
      <ul className="space-y-2">
        {items.map((n) => (
          <li key={n.id} className="border p-2 rounded">
            <div className="font-medium">{n.title}</div>
            <div className="text-sm text-zinc-600">{n.body}</div>
            <div className="text-xs text-zinc-500">{new Date(n.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;