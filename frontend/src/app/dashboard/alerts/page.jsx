import AlertsWidget from '@/components/alerts/AlertsWidget';
import RoleGuard from '@/components/auth/RoleGuard';

export default function AlertsPage() {
    return (
        <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Alerts & Monitoring</h1>
                <div className="h-[600px]">
                    <AlertsWidget />
                </div>
            </div>
        </RoleGuard>
    );
}
