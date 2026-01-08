import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function ResetPasswordPage() {
    const router = useRouter();
    const { uid, token } = router.query;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Validate presence of token/uid
    useEffect(() => {
        if (router.isReady && (!uid || !token)) {
            setError('Invalid reset link. Missing token or user ID.');
        }
    }, [router.isReady, uid, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await axios.post('http://localhost:8000/api/v1/auth/password-reset/confirm/', {
                uid,
                token,
                new_password: password
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to reset password. Link may be expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
            <div className="w-full max-w-md bg-white rounded-xl shadow border border-zinc-200 p-8 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Reset Password</h1>
                    <p className="text-zinc-500">Enter your new password below</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm text-center">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm text-center space-y-4">
                        <p className="font-medium">Password successfully reset!</p>
                        <p>You can now log in with your new password.</p>
                        <div>
                            <Link
                                href="/auth/login"
                                className="inline-block w-full py-2.5 rounded bg-black text-white hover:bg-zinc-800 transition-colors font-medium text-center"
                            >
                                Go to Login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">New Password</label>
                            <input
                                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                type="password"
                                required
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Confirm Password</label>
                            <input
                                className="w-full border border-zinc-300 rounded px-3 py-2 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                type="password"
                                required
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 rounded bg-black text-white hover:bg-zinc-800 transition-colors font-medium disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
                            disabled={loading || !!error}
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Set New Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
