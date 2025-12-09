import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Sidebar: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    router.push('/auth/login');
  };

  const isActive = (path: string) => router.pathname === path || router.pathname.startsWith(path + '/');

  return (
    <aside className="w-64 bg-zinc-900 h-screen fixed left-0 top-0 text-white flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold tracking-tight">Shining Smiles</h1>
        <p className="text-xs text-zinc-400">Admin Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link href="/" className={`block px-3 py-2 rounded-md transition-colors ${router.pathname === '/' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
          Dashboard
        </Link>
        <Link href="/payments" className={`block px-3 py-2 rounded-md transition-colors ${isActive('/payments') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
          Payments
        </Link>
        <Link href="/students" className={`block px-3 py-2 rounded-md transition-colors ${isActive('/students') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
          Students
        </Link>
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
