"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Role = "admin" | "staff" | "viewer";

export default function Home() {
  const [role, setRole] = useState<Role>("viewer");

  useEffect(() => {
    const r = window.localStorage.getItem("userRole") as Role | null;
    if (r) setRole(r);
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/students" className="border p-4 rounded">Students</Link>
        <Link href="/payments" className="border p-4 rounded">Payments</Link>
        <Link href="/payments/offline" className="border p-4 rounded">Offline Queue</Link>
        <Link href="/notifications" className="border p-4 rounded">Notifications</Link>
      </div>
      {role !== "viewer" && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/statements/1" className="border p-4 rounded">Reports & Statements</Link>
        </div>
      )}
    </div>
  );
}
