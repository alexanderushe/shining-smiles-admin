import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await axios.post('http://localhost:8000/api/v1/auth/password-reset/', { email });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
            <div className="w-full max-w-md bg-white rounded-xl shadow border border-zinc-200 p-8 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Forgot Password</h1>
                    <p className="text-zinc-500">Enter your email to receive a reset link</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm text-center">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm text-center space-y-2">
                        <p className="font-medium">Reset link sent!</p>
                        <p>Check your email for instructions to reset your password.</p>
                        <div className="pt-2">
                            <Link href="/auth/login" className="text-black underline hover:no-underline">
                                Return to Login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address</label>
                            <input
                                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                type="email"
                                required
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 rounded bg-black text-white hover:bg-zinc-800 transition-colors font-medium disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Send Reset Link'}
                        </button>

                        <div className="text-center pt-2">
                            <Link href="/auth/login" className="text-sm text-zinc-600 hover:text-black hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
