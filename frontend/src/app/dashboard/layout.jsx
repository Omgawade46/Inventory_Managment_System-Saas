'use client';

import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function DashboardLayout({ children }) {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // Redirect Chefs to their dedicated dashboard
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user?.role === 'CHEF') {
            router.push('/kitchen');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null; // Or a loading spinner
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

            <main className={`
                pt-16 min-h-screen transition-all duration-300
                ${isSidebarOpen ? 'md:pl-64' : 'pl-0 md:pl-64'} 
            `}>
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}