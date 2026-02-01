'use client';

import RoleGuard from '@/components/auth/RoleGuard';
import InventoryValueChart from '@/components/reports/InventoryValueChart';
import StockMovementChart from '@/components/reports/StockMovementChart';
import WastageReport from '@/components/reports/WastageReport';
import { FileBarChart } from 'lucide-react';

export default function ReportsPage() {
    return (
        <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <FileBarChart className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
                        <p className="text-slate-500 text-sm">Insights into your inventory performance</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InventoryValueChart />
                    <WastageReport />
                </div>

                <div className="w-full">
                    <StockMovementChart />
                </div>
            </div>
        </RoleGuard>
    );
}
