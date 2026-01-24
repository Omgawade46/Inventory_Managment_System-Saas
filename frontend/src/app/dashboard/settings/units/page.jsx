import UnitManager from '@/components/settings/UnitManager';
import RoleGuard from '@/components/auth/RoleGuard';

export default function UnitsPage() {
    return (
        <RoleGuard allowedRoles={['OWNER']}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings / Units</h1>
                <UnitManager />
            </div>
        </RoleGuard>
    );
}
