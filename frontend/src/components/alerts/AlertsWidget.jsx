'use client';

import { useAppSelector } from '@/redux/hooks';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AlertsWidget() {
    const { rawMaterials, units } = useAppSelector((state) => state.inventory);

    const lowStockItems = rawMaterials.filter(m => m.currentStock <= m.minStockLevel);
    const isAllGood = lowStockItems.length === 0;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    {isAllGood ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                    Inventory Alerts
                </h3>
                <Link href="/dashboard/inventory" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            {isAllGood ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-slate-600 font-medium">All Stock Levels Healthy</p>
                    <p className="text-xs text-slate-400">No items below minimum threshold.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {lowStockItems.map(item => {
                        const unit = units.find(u => u.id === item.unitId);
                        return (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                                    <p className="text-xs text-red-600 font-medium mt-0.5">
                                        Current: {item.currentStock} {unit?.baseUnit}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-slate-400 block">Min</span>
                                    <span className="text-xs font-bold text-slate-600">{item.minStockLevel} {unit?.baseUnit}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
