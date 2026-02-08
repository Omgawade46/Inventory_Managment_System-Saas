'use client';

import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function KitchenLayout({ children }) {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !user) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            </div>
        );
    }

    if (!['OWNER', 'MANAGER', 'CHEF'].includes(user.role)) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 text-red-600 font-bold">
                Access Denied. Chefs only.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            {/* Minimal Header */}
            <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
                <h1 className="font-bold text-lg tracking-wide text-orange-400">KITCHEN DISPLAY SYSTEM</h1>
                <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400">Station: <span className="text-white">All Assigned</span></span>
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                        {user.name?.charAt(0)}
                    </div>
                </div>
            </header>
            <main className="p-4 h-[calc(100vh-3.5rem)] overflow-hidden">
                {children}
            </main>
        </div>
    );
}
