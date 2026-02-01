'use client';

import Link from 'next/link';
import { Scale, ChevronRight, Settings, Info } from 'lucide-react';
import ProfileSettings from '@/components/settings/ProfileSettings';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAppSelector } from '@/redux/hooks';

export default function SettingsPage() {
    const { user } = useAppSelector((state) => state.auth);
    const isOwner = user?.role === 'OWNER';

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                    <Settings className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-500 text-sm">Manage your profile and application preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile */}
                <div className="lg:col-span-1">
                    <ProfileSettings />
                </div>

                {/* Right Column: App Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Administration Section */}
                    {isOwner && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Administration</h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                <Link
                                    href="/dashboard/settings/units"
                                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <Scale className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-900">Unit Management</h4>
                                            <p className="text-xs text-slate-500">Configure measurement units (kg, ltr, pcs)</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                                </Link>

                                {/* Placeholder for other admin settings */}
                                {/* <div className="flex items-center justify-between p-4 opacity-50 cursor-not-allowed">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-100 text-slate-400 rounded-lg">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-900">User Management</h4>
                                            <p className="text-xs text-slate-500">Manage owner and staff access</p>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">Soon</span>
                                </div> */}
                            </div>
                        </div>
                    )}

                    {/* About Application */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">About</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-900">SaaS Inventory System</h4>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Version 1.0.0 <br />
                                        {/* Built with Next.js, Redux, and Tailwind CSS. */}
                                    </p>
                                    <div className="mt-4 text-xs text-slate-400">
                                        &copy; 2026 SaaS Company. All rights reserved.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
