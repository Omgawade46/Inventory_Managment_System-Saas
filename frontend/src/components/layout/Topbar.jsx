'use client';

import { Bell, Search, Store } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { switchOutlet, logout } from '@/redux/features/authSlice';
import { useRouter } from 'next/navigation';

export function Topbar() {
    const { user } = useAppSelector((state) => state.auth);
    const { rawMaterials } = useAppSelector((state) => state.inventory);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const alertCount = rawMaterials.filter(m => m.currentStock <= m.minStockLevel).length;

    const handleLogout = () => {
        dispatch(logout());
        router.push('/login');
    };

    return (
        <header className="h-16 bg-white border-b border-slate-100 fixed top-0 right-0 left-64 z-40 flex items-center justify-between px-8 bg-opacity-90 backdrop-blur-sm">
            <div className="flex items-center gap-4 w-96">
                <div className="relative w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search inventory, orders..."
                        className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-100 pl-10 pr-4 py-2 rounded-lg text-sm transition-all outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                    <Store className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Main Outlet</span>
                    {/* In future, this will be a dropdown to switch outlets */}
                </div>

                <button
                    onClick={() => router.push('/dashboard/alerts')}
                    className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <Bell className="w-5 h-5" />
                    {alertCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </button>

                <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}