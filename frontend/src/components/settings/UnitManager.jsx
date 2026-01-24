'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Edit2, Scale } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addUnit, deleteUnit, updateUnit } from '@/redux/features/inventorySlice';

// Zod Schema
const unitSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    baseUnit: z.string().min(1, 'Base unit is required').max(5, 'Too long'),
    conversionFactor: z.number().min(0.000001, 'Must be positive'),
});

export default function UnitManager() {
    const dispatch = useAppDispatch();
    const { units } = useAppSelector((state) => state.inventory);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue
    } = useForm({
        resolver: zodResolver(unitSchema),
        defaultValues: {
            name: '',
            baseUnit: '',
            conversionFactor: 1
        }
    });

    const onSubmit = (data) => {
        if (editingId) {
            dispatch(updateUnit({ id: editingId, ...data }));
            setEditingId(null);
        } else {
            dispatch(addUnit({ id: Date.now().toString(), ...data }));
            setIsAdding(false);
        }
        reset();
    };

    const startEdit = (unit) => {
        setEditingId(unit.id);
        setValue('name', unit.name);
        setValue('baseUnit', unit.baseUnit || '');
        setValue('conversionFactor', unit.conversionFactor);
        setIsAdding(true);
    };

    const cancelForm = () => {
        setIsAdding(false);
        setEditingId(null);
        reset();
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-blue-500" />
                        Unit Management
                    </h2>
                    <p className="text-sm text-slate-500">Manage measured units for inventory</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm shadow-blue-200"
                    >
                        <Plus className="w-4 h-4" /> Add Unit
                    </button>
                )}
            </div>

            <div className="p-6">
                {/* Form Area */}
                {isAdding && (
                    <form onSubmit={handleSubmit(onSubmit)} className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">{editingId ? 'Edit Unit' : 'New Unit'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Name (e.g., Kilogram)</label>
                                <input
                                    {...register('name')}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                    placeholder="Unit Name"
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Base Unit (e.g., kg)</label>
                                <input
                                    {...register('baseUnit')}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                    placeholder="Base Unit"
                                />
                                {errors.baseUnit && <p className="text-xs text-red-500 mt-1">{errors.baseUnit.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Conversion Factor</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    {...register('conversionFactor', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                    placeholder="1"
                                />
                                {errors.conversionFactor && <p className="text-xs text-red-500 mt-1">{errors.conversionFactor.message}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={cancelForm}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                            >
                                {editingId ? 'Update Unit' : 'Save Unit'}
                            </button>
                        </div>
                    </form>
                )}

                {/* List Area */}
                <div className="overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Base Unit</th>
                                <th className="px-4 py-3">Conversion</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {units.map((unit) => (
                                <tr key={unit.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-700">{unit.name}</td>
                                    <td className="px-4 py-3 text-slate-600">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">{unit.baseUnit}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{unit.conversionFactor}</td>
                                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => startEdit(unit)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => dispatch(deleteUnit(unit.id))}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {units.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                        No units defined yet. Click &quot;Add Unit&quot; to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
