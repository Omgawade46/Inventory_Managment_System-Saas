import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import StockEntry from '@/components/stock/StockEntry';
import StockAdjustment from '@/components/stock/StockAdjustment';
import StockLogList from '@/components/stock/StockLogList';
import RoleGuard from '@/components/auth/RoleGuard';

export default function StockPage() {
    return (
        <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
            <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)]">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Stock Operations</h1>
                        <p className="text-slate-500 mt-1">Manage purchases, wastage, and view stock history.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full pb-8">
                    {/* Left Column: Operations */}
                    <div className="lg:col-span-1 space-y-6">
                        <StockEntry />
                        <StockAdjustment />
                    </div>

                    {/* Right Column: Logs */}
                    <div className="lg:col-span-2 h-full">
                        <StockLogList />
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
