'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAppSelector } from '@/redux/hooks';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function InventoryValueChart() {
    const { rawMaterials } = useAppSelector((state) => state.inventory);

    const data = useMemo(() => {
        const categoryMap = {};

        rawMaterials.forEach(item => {
            const category = item.category || 'Uncategorized';
            const value = (parseFloat(item.currentStock) || 0) * (parseFloat(item.costPerUnit) || 0);

            if (categoryMap[category]) {
                categoryMap[category] += value;
            } else {
                categoryMap[category] = value;
            }
        });

        return Object.keys(categoryMap).map(key => ({
            name: key,
            value: categoryMap[key]
        })).filter(item => item.value > 0);
    }, [rawMaterials]);

    const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-80">
                <p className="text-slate-400">No inventory data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Inventory Value by Category</h3>
                <p className="text-sm text-slate-500">Total Value: ₹{totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => `₹${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
