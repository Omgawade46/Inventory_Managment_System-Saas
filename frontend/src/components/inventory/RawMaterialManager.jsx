'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Search, Filter, AlertTriangle, Edit2, Trash2, Package } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addRawMaterial, deleteRawMaterial, updateRawMaterial } from '@/redux/features/inventorySlice';

// Schema
const materialSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    category: z.string().min(1, 'Category is required'),
    unitId: z.string().min(1, 'Unit is required'),
    minStockLevel: z.number().min(0, 'Must be positive'),
    costPerUnit: z.number().min(0).optional(),
    supplierName: z.string().optional(),
});

export default function RawMaterialManager() {
    const dispatch = useAppDispatch();
    const { rawMaterials, units } = useAppSelector((state) => state.inventory);
    const { user } = useAppSelector((state) => state.auth);

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const isOwner = user?.role === 'OWNER';

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue
    } = useForm({
        resolver: zodResolver(materialSchema),
        defaultValues: { minStockLevel: 5 }
    });

    const onSubmit = (data) => {
        const payload = {
            ...data,
            currentStock: 0, // Initial stock is 0
            costPerUnit: isOwner ? data.costPerUnit : 0, // Only owner sets cost
            outletId: user?.outletId || '33333333-3333-3333-3333-333333333333',
        };

        if (editingId) {
            dispatch(updateRawMaterial({
                id: editingId,
                currentStock: rawMaterials.find(m => m.id === editingId)?.currentStock || 0, // Preserve stock
                outletId: rawMaterials.find(m => m.id === editingId)?.outletId || '33333333-3333-3333-3333-333333333333',
                ...data
            }));
            setEditingId(null);
        } else {
            dispatch(addRawMaterial({ id: `m-${Date.now()}`, ...payload }));
            setIsAdding(false);
        }
        reset();
    };

    const startEdit = (material) => {
        setEditingId(material.id);
        setValue('name', material.name);
        setValue('category', material.category);
        setValue('unitId', material.unitId);
        setValue('minStockLevel', material.minStockLevel);
        if (isOwner) setValue('costPerUnit', material.costPerUnit);
        setValue('supplierName', material.supplierName);
        setIsAdding(true);
    };

    const filteredMaterials = rawMaterials.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search raw materials..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm"
                    />
                </div>
                {!isAdding && (
                    <button
                        onClick={() => { reset(); setIsAdding(true); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-200"
                    >
                        <Plus className="w-4 h-4" /> Add Material
                    </button>
                )}
            </div>

            {/* Form Section */}
            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Material' : 'Add New Material'}</h3>
                        <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <Package className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Material Name</label>
                                <input {...register('name')} className="form-input w-full rounded-lg border-slate-200" placeholder="e.g. Flour" />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                                <input {...register('category')} className="form-input w-full rounded-lg border-slate-200" placeholder="e.g. Dry Goods" />
                                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
                                <select {...register('unitId')} className="form-select w-full rounded-lg border-slate-200">
                                    <option value="">Select Unit</option>
                                    {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.baseUnit})</option>)}
                                </select>
                                {errors.unitId && <p className="text-xs text-red-500 mt-1">{errors.unitId.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Min Stock Alert</label>
                                <input
                                    type="number"
                                    {...register('minStockLevel', { valueAsNumber: true })}
                                    className="form-input w-full rounded-lg border-slate-200"
                                />
                                {errors.minStockLevel && <p className="text-xs text-red-500 mt-1">{errors.minStockLevel.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Supplier Name</label>
                                <input {...register('supplierName')} className="form-input w-full rounded-lg border-slate-200" placeholder="e.g. Metro" />
                            </div>

                            {isOwner && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Cost per Unit (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('costPerUnit', { valueAsNumber: true })}
                                        className="form-input w-full rounded-lg border-slate-200"
                                        placeholder="0.00"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-5 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                            >
                                {editingId ? 'Update Material' : 'Save Material'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMaterials.map((material) => {
                    const unit = units.find(u => u.id === material.unitId);
                    const isLowStock = material.currentStock <= material.minStockLevel;

                    return (
                        <div key={material.id} className="group bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-all duration-200 relative overflow-hidden">
                            {isLowStock && (
                                <div className="absolute top-0 right-0 bg-red-50 text-red-600 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Low Stock
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">{material.name}</h4>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{material.category}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="text-sm text-slate-500">Stock</div>
                                    <div className={`text-2xl font-bold ${isLowStock ? 'text-red-500' : 'text-slate-700'}`}>
                                        {material.currentStock} <span className="text-sm font-medium text-slate-400">{unit?.baseUnit}</span>
                                    </div>
                                </div>

                                {isOwner && material.costPerUnit !== undefined && (
                                    <div className="flex justify-between items-center py-2 border-t border-dashed border-slate-100">
                                        <div className="text-xs text-slate-400">Cost/Unit</div>
                                        <div className="text-sm font-semibold text-slate-600">₹{material.costPerUnit}</div>
                                    </div>
                                )}
                            </div>

                            <div className="absolute top-4 right-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => startEdit(material)}
                                    className="p-2 bg-white text-blue-600 shadow-md rounded-lg hover:bg-blue-50"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => dispatch(deleteRawMaterial(material.id))}
                                    className="p-2 bg-white text-red-600 shadow-md rounded-lg hover:bg-red-50"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
