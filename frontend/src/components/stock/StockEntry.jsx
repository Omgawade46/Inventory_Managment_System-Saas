'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addStockOperation } from '@/redux/features/inventorySlice';
import { ArrowDownLeft, Save } from 'lucide-react';
import { useState } from 'react';

const stockEntrySchema = z.object({
    rawMaterialId: z.string().min(1, 'Select a material'),
    quantity: z.number().min(0.01, 'Quantity must be positive'),
    notes: z.string().optional(),
});

export default function StockEntry() {
    const dispatch = useAppDispatch();
    const { rawMaterials, units } = useAppSelector((state) => state.inventory);
    const { user } = useAppSelector((state) => state.auth);
    const [successMsg, setSuccessMsg] = useState('');

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        resolver: zodResolver(stockEntrySchema),
    });

    const selectedMaterialId = watch('rawMaterialId');
    const selectedMaterial = rawMaterials.find(m => m.id === selectedMaterialId);
    const selectedUnit = units.find(u => u.id === selectedMaterial?.unitId);

    const onSubmit = (data) => {
        if (!selectedMaterial || !user) return;

        dispatch(addStockOperation({
            outletId: user.outletId || '33333333-3333-3333-3333-333333333333',
            rawMaterialId: data.rawMaterialId,
            changeQuantity: data.quantity,
            changeType: 'PURCHASE',
            reason: data.notes || 'Purchase Entry',
        }));

        setSuccessMsg(`Added ${data.quantity} ${selectedUnit?.baseUnit || ''} of ${selectedMaterial.name}`);
        reset();
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
            <div className="flex items-center gap-2 mb-6 text-emerald-600">
                <div className="p-2 bg-emerald-50 rounded-lg">
                    <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Stock In (Purchase)</h3>
                    <p className="text-xs text-slate-500">Record new stock arrival</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Raw Material</label>
                    <select {...register('rawMaterialId')} className="form-select w-full rounded-lg border-slate-200">
                        <option value="">Select Material</option>
                        {rawMaterials.map(m => (
                            <option key={m.id} value={m.id}>{m.name} (Current: {m.currentStock})</option>
                        ))}
                    </select>
                    {errors.rawMaterialId && <p className="text-xs text-red-500 mt-1">{errors.rawMaterialId.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Quantity Received {selectedUnit && `(${selectedUnit.baseUnit})`}
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('quantity', { valueAsNumber: true })}
                        className="form-input w-full rounded-lg border-slate-200"
                        placeholder="0.00"
                    />
                    {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes / PO Number</label>
                    <input {...register('notes')} className="form-input w-full rounded-lg border-slate-200" placeholder="Optional" />
                </div>

                <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" /> Record Purchase
                </button>

                {successMsg && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg text-center animate-in fade-in">
                        {successMsg}
                    </div>
                )}
            </form>
        </div>
    );
}
