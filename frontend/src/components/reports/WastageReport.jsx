'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAppSelector } from '@/redux/hooks';

export default function WastageReport() {
    const { stockLogs, rawMaterials } = useAppSelector((state) => state.inventory);

    const data = useMemo(() => {
        const wastageLogs = stockLogs.filter(log => log.changeType === 'WASTAGE');
        const countMap = {};

        wastageLogs.forEach(log => {
            const materialId = log.rawMaterialId;
            const material = rawMaterials.find(m => m.id === materialId);
            const name = material ? material.name : 'Unknown';
            const cost = material ? (parseFloat(material.costPerUnit) || 0) : 0;
            const quantity = Math.abs(parseFloat(log.changeQuantity) || 0);
            const totalCost = cost * quantity;

            if (countMap[name]) {
                countMap[name].quantity += quantity;
                countMap[name].cost += totalCost;
            } else {
                countMap[name] = { name, quantity, cost: totalCost };
            }
        });

        // Top 5 items solely by cost
        return Object.values(countMap)
            .sort((a, b) => b.cost - a.cost)
            .slice(0, 5);

    }, [stockLogs, rawMaterials]);

    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-80">
                <p className="text-slate-400">No wastage recorded yet</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Top Wastage Items</h3>
                <p className="text-sm text-slate-500">By estimated cost impact</p>
            </div>
            <div className="w-full h-full min-h-0">
                <ResponsiveContainer width="100%" height="85%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 40,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fontSize: 12, fill: '#64748B' }}
                            width={80}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            formatter={(value) => `₹${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                            cursor={{ fill: '#F1F5F9' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="cost" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
