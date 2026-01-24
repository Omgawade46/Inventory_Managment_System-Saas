'use client';

import { useAppSelector } from '@/redux/hooks';
import AlertsWidget from '@/components/alerts/AlertsWidget';
import { Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import RoleGuard from '@/components/auth/RoleGuard';

export default function DashboardPage() {
    const { rawMaterials, stockLogs, units } = useAppSelector((state) => state.inventory);
    const { user } = useAppSelector((state) => state.auth);

    // Metrics Calculation
    const totalItems = rawMaterials.length;
    const lowStockCount = rawMaterials.filter(m => m.currentStock <= m.minStockLevel).length;

    // Calculate approximate value (mock logic since we don't track historical cost per batch)
    const totalValue = rawMaterials.reduce((acc, item) => {
        return acc + (item.currentStock * (item.costPerUnit || 0));
    }, 0);

    const recentLogs = stockLogs.slice(0, 5); // Last 5 activities

    const isOwner = user?.role === 'OWNER';

    return (
        <RoleGuard allowedRoles={['OWNER', 'MANAGER', 'STAFF']}>
            <div>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">Welcome back, {user?.name}</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Valid Inventory</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalItems} Items</h3>
                            </div>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Package className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
                                <h3 className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                    {lowStockCount} Items
                                </h3>
                            </div>
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {isOwner && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Inventory Value</p>
                                    <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{totalValue.toLocaleString()}</h3>
                                </div>
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Recent Activity</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stockLogs.length} Ops</h3>
                            </div>
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Widgets Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Alerts Widget */}
                    <div className="lg:col-span-1 h-96">
                        <AlertsWidget />
                    </div>

                    {/* Recent Activity Mini-List */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-96 flex flex-col">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">Recent Stock Movements</h3>
                        </div>
                        <div className="overflow-y-auto flex-1 p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3">Item</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3 text-right">Change</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentLogs.map(log => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-3 font-medium text-slate-700">{log.rawMaterial?.name || 'Unknown Item'}</td>
                                            <td className="px-6 py-3 text-xs text-slate-500">{log.changeType}</td>
                                            <td className={`px-6 py-3 text-right font-bold ${log.changeQuantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {log.changeQuantity > 0 ? '+' : ''}{log.changeQuantity}
                                            </td>
                                        </tr>
                                    ))}
                                    {recentLogs.length === 0 && (
                                        <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No recent activity</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
