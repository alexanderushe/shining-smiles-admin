import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to dashboard or login
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            router.replace('/dashboard');
        } else {
            router.replace('/auth/login');
        }
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading...</p>
        </div>
    );
}
