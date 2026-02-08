'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, UtensilsCrossed, Loader2 } from 'lucide-react';
import { inventoryApi } from '@/services/api';

export default function KitchenSettings() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await inventoryApi.getKitchenCategories();
            setCategories(res.data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            await inventoryApi.createKitchenCategory(data);
            setIsAdding(false);
            reset();
            fetchCategories();
        } catch (error) {
            console.error('Failed to create category', error);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                        Kitchen Stations
                    </h2>
                    <p className="text-sm text-slate-500">Manage cooking stations (e.g., Chinese, Tandoor)</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium shadow-sm shadow-orange-200"
                    >
                        <Plus className="w-4 h-4" /> Add Station
                    </button>
                )}
            </div>

            <div className="p-6">
                {isAdding && (
                    <form onSubmit={handleSubmit(onSubmit)} className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-slate-700 mb-1">Station Name</label>
                                <input
                                    {...register('name', { required: 'Name is required' })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                                    placeholder="e.g. Main Course"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                    </form>
                )}

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <span className="font-medium text-slate-700">{cat.name}</span>
                                {/* Add delete/edit later */}
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <p className="text-center text-slate-400 py-4 text-sm">No stations defined yet.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
