'use client';

import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RoleGuard({ children, allowedRoles }) {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (user && !allowedRoles.includes(user.role)) {
            // Create a dedicated unauthorized page later, for now redirect or alert
            // router.push('/unauthorized'); 
            console.warn('Access denied: Insufficient permissions');
        }
    }, [user, isAuthenticated, allowedRoles, router]);

    if (!isAuthenticated || !user) {
        return null;
    }

    if (!allowedRoles.includes(user.role)) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center p-8 bg-red-50 rounded-2xl border border-red-100">
                <h2 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h2>
                <p className="text-red-600">You do not have permission to view this content.</p>
                <p className="text-sm text-red-500 mt-2">Required Role: {allowedRoles.join(' or ')}</p>
            </div>
        );
    }

    return <>{children}</>;
}
