'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppSelector } from '@/redux/hooks';

export default function StockMovementChart() {
    const { stockLogs } = useAppSelector((state) => state.inventory);

    const data = useMemo(() => {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const logs = stockLogs.filter(log => new Date(log.createdAt) >= last30Days);

        const dailyMap = {};

        // Initialize last 30 days
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString();
            dailyMap[dateStr] = { date: dateStr, Purchase: 0, Sale: 0, Wastage: 0, Other: 0 };
        }

        logs.forEach(log => {
            const dateStr = new Date(log.createdAt).toLocaleDateString();
            if (dailyMap[dateStr]) {
                const type = log.changeType === 'PURCHASE' ? 'Purchase' :
                    log.changeType === 'SALE' ? 'Sale' :
                        log.changeType === 'WASTAGE' ? 'Wastage' : 'Other';

                // We use absolute values for visual comparison in stacked/grouped bars
                dailyMap[dateStr][type] += Math.abs(parseFloat(log.changeQuantity) || 0);
            }
        });

        return Object.values(dailyMap).reverse();
    }, [stockLogs]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Stock Movements (30 Days)</h3>
                <p className="text-sm text-slate-500">Volume of items moved per day</p>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 0,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: '#64748B' }}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#64748B' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="Purchase" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="Sale" fill="#3B82F6" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="Wastage" fill="#EF4444" radius={[4, 4, 0, 0]} stackId="a" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
