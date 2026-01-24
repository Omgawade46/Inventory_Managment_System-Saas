'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addStockOperation } from '@/redux/features/inventorySlice';
import { ArrowUpRight, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const adjustmentSchema = z.object({
    rawMaterialId: z.string().min(1, 'Select a material'),
    quantity: z.number().min(0.01, 'Quantity must be positive'),
    reason: z.enum(['WASTAGE', 'SPOILAGE', 'CORRECTION']),
    notes: z.string().min(1, 'Notes are required for adjustments'),
});

export default function StockAdjustment() {
    const dispatch = useAppDispatch();
    const { rawMaterials, units } = useAppSelector((state) => state.inventory);
    const { user } = useAppSelector((state) => state.auth);
    const [successMsg, setSuccessMsg] = useState('');

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        resolver: zodResolver(adjustmentSchema),
    });

    const selectedMaterialId = watch('rawMaterialId');
    const selectedMaterial = rawMaterials.find(m => m.id === selectedMaterialId);
    const selectedUnit = units.find(u => u.id === selectedMaterial?.unitId);

    const onSubmit = (data) => {
        if (!selectedMaterial || !user) return;

        dispatch(addStockOperation({
            outletId: user.outletId || '33333333-3333-3333-3333-333333333333',
            rawMaterialId: data.rawMaterialId,
            changeQuantity: -data.quantity,
            changeType: data.reason === 'SPOILAGE' ? 'WASTAGE' : data.reason,
            reason: `${data.reason}: ${data.notes}`,
        }));

        setSuccessMsg(`Reduced ${data.quantity} ${selectedUnit?.baseUnit || ''} from ${selectedMaterial.name}`);
        reset();
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
            <div className="flex items-center gap-2 mb-6 text-amber-600">
                <div className="p-2 bg-amber-50 rounded-lg">
                    <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Stock Out (Adjustment)</h3>
                    <p className="text-xs text-slate-500">Record wastage or corrections</p>
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
                        Quantity Reduced {selectedUnit && `(${selectedUnit.baseUnit})`}
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                    <select {...register('reason')} className="form-select w-full rounded-lg border-slate-200">
                        <option value="WASTAGE">Wastage (Preparation)</option>
                        <option value="SPOILAGE">Spoilage (Expired/Rotten)</option>
                        <option value="CORRECTION">Correction (Audit Fix)</option>
                    </select>
                    {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Required)</label>
                    <input {...register('notes')} className="form-input w-full rounded-lg border-slate-200" placeholder="Explain why..." />
                    {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes.message}</p>}
                </div>

                <button
                    type="submit"
                    className="w-full bg-amber-600 text-white py-2.5 rounded-xl font-medium hover:bg-amber-700 transition-colors shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
                >
                    <AlertTriangle className="w-4 h-4" /> Record Adjustment
                </button>

                {successMsg && (
                    <div className="p-3 bg-amber-50 text-amber-700 text-sm rounded-lg text-center animate-in fade-in">
                        {successMsg}
                    </div>
                )}
            </form>
        </div>
    );
}
