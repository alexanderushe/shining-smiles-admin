import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Wallet, Users, GraduationCap, FileBarChart, LogOut } from 'lucide-react';

const Sidebar: React.FC = () => {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => router.pathname === path || router.pathname.startsWith(path + '/');
  // Check role directly as it's flattened in AuthContext
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="w-64 bg-zinc-900 h-screen fixed left-0 top-0 text-white flex flex-col border-r border-zinc-800">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-xl">✨</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none">Shining Smiles</h1>
            <p className="text-xs text-zinc-500 mt-1">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Main Navigation */}
        <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all ${isActive('/dashboard') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
        <Link href="/payments" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all ${isActive('/payments') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
          <Wallet size={18} />
          Payments
        </Link>
        <Link href="/students" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all ${isActive('/students') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
          <GraduationCap size={18} />
          Students
        </Link>
        <Link href="/reports" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all ${isActive('/reports') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
          <FileBarChart size={18} />
          Reports
        </Link>

        {isAdmin && (
          <Link href="/users" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all ${isActive('/users') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
            <Users size={18} />
            Users
          </Link>
        )}

        {/* Beta Features */}
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <p className="px-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">Beta</p>
          <Link href="/action-center" className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all ${isActive('/action-center') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
            <LayoutDashboard size={18} />
            Action Center
            <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">BETA</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="px-3 py-3 mb-2 rounded-lg bg-zinc-800/50">
          <p className="text-sm font-medium text-white">{user?.full_name || 'User'}</p>
          <p className="text-xs text-zinc-500 capitalize">{user?.role || 'Staff'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
