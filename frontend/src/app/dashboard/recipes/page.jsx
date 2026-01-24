'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchInventoryData } from '@/redux/features/inventorySlice';
import RecipeBuilder from '@/components/recipes/RecipeBuilder';
import RoleGuard from '@/components/auth/RoleGuard';

export default function RecipesPage() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchInventoryData());
    }, [dispatch]);

    return (
        <RoleGuard allowedRoles={['OWNER']}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Recipe Management</h1>
                    <p className="text-slate-500 mt-1">Map products to raw materials for automatic stock deduction.</p>
                </div>
                <RecipeBuilder />
            </div>
        </RoleGuard>
    );
}
