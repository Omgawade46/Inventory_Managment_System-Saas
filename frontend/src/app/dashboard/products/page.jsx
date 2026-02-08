'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchProducts } from '@/redux/features/inventorySlice';
import ProductManager from '@/components/inventory/ProductManager';
import RoleGuard from '@/components/auth/RoleGuard';

export default function ProductsPage() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    return (
        <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Product Management</h1>
                        <p className="text-slate-500 mt-1">Manage your menu items and selling prices.</p>
                    </div>
                </div>
                <ProductManager />
            </div>
        </RoleGuard>
    );
}
