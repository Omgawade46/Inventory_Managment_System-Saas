'use client';

import { useAppSelector } from '@/redux/hooks';
import { History, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function StockLogList() {
    const { stockLogs } = useAppSelector((state) => state.inventory);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-500" />
                    Recent Activity
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Item</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3 text-right">Change</th>
                            <th className="px-6 py-3">User</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {stockLogs.map((log) => {
                            const date = new Date(log.createdAt);
                            const isPositive = log.changeQuantity > 0;

                            return (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-slate-500">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-700">{date.toLocaleDateString()}</span>
                                            <span className="text-xs">{date.toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-800">{log.rawMaterial?.name || 'Unknown Item'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                        ${log.changeType === 'PURCHASE' ? 'bg-emerald-100 text-emerald-700' :
                                                    log.changeType === 'WASTAGE' ? 'bg-amber-100 text-amber-700' :
                                                        log.changeType === 'CORRECTION' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}
                      `}>
                                                {log.changeType}
                                            </span>
                                        </div>
                                        {log.reason && <p className="text-xs text-slate-400 mt-1 max-w-[150px] truncate">{log.reason}</p>}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                                        <div className="flex items-center justify-end gap-1">
                                            {isPositive ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                            {isPositive ? '+' : ''}{log.changeQuantity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-xs">
                                        {log.performer?.name || 'Unknown'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
