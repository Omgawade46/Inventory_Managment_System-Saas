'use client';

import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, UserCircle } from 'lucide-react';

export default function StaffLayout({ children }) {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !user) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!['OWNER', 'MANAGER', 'STAFF'].includes(user.role)) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 text-red-600 font-bold">
                Access Denied. Staff only.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Minimal Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50">
                <h1 className="font-bold text-lg tracking-wide text-blue-600">STAFF PORTAL</h1>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <UserCircle className="w-5 h-5" />
                        <span className="font-medium">{user.name}</span>
                    </div>
                </div>
            </header>
            <main className="p-6 max-w-5xl mx-auto">
                {children}
            </main>
        </div>
    );
}
