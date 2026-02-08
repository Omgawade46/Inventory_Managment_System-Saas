'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ChefHat, BarChart3, Settings, ShieldAlert, ShoppingBag, X } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
    { name: 'Products', href: '/dashboard/products', icon: ShoppingBag },
    { name: 'Recipes', href: '/dashboard/recipes', icon: ChefHat },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'Alerts', href: '/dashboard/alerts', icon: ShieldAlert },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    // Standalone Apps
    { name: 'POS Terminal', href: '/pos', icon: ShoppingBag }, // External Layout
    { name: 'Kitchen Display', href: '/kitchen', icon: ChefHat }, // External Layout
    { name: 'Waiter View', href: '/staff/ready-items', icon: Package }, // External Layout
];

export function Sidebar({ isOpen, onClose }) {
    const pathname = usePathname();
    const { user } = useAppSelector((state) => state.auth);

    return (
        <aside className={`
            fixed top-0 left-0 h-full w-64 bg-slate-900 text-slate-300 z-50 
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0
        `}>
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        SaaS<span className="text-blue-500">Inventory</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">{user?.role || 'Guest'} View</p>
                </div>
                <button
                    onClick={onClose}
                    className="md:hidden text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="px-4 py-6 overflow-y-auto h-[calc(100vh-140px)]">
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => onClose && window.innerWidth < 768 && onClose()}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                        : 'hover:bg-slate-800 hover:text-white'}
                `}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || 'email@example.com'}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}