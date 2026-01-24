'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchInventoryData } from '@/redux/features/inventorySlice';
import RawMaterialManager from '@/components/inventory/RawMaterialManager';
import RoleGuard from '@/components/auth/RoleGuard';
import Link from 'next/link';
import { ArrowRightLeft } from 'lucide-react';

export default function InventoryPage() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchInventoryData());
    }, [dispatch]);

    return (
        <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                        <p className="text-slate-500 mt-1">Track raw materials, stock levels, and costs.</p>
                    </div>
                    <Link
                        href="/dashboard/inventory/stock"
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-200"
                    >
                        <ArrowRightLeft className="w-4 h-4" /> Stock Operations
                    </Link>
                </div>
                <RawMaterialManager />
            </div>
        </RoleGuard>
    );
}
