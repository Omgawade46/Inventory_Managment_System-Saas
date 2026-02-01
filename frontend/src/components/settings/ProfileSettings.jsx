'use client';

import { useAppSelector } from '@/redux/hooks';
import { User, Mail, Shield, Lock } from 'lucide-react';

export default function ProfileSettings() {
    const { user } = useAppSelector((state) => state.auth);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    My Profile
                </h2>
                <p className="text-sm text-slate-500">Manage your account settings</p>
            </div>

            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-md">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">{user?.name || 'User Name'}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-medium text-xs border border-blue-100">
                                {user?.role || 'ROLE'}
                            </span>
                            <span>•</span>
                            <span className="text-slate-400">Active</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-100">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium">{user?.email || 'email@example.com'}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Role Permissions</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-100">
                            <Shield className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium">
                                {user?.role === 'OWNER' ? 'Full Access' : 'Restricted Access'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-slate-400" />
                        Security
                    </h4>
                    <button
                        className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                        disabled
                    >
                        Change Password
                        <span className="text-xs text-slate-400 font-normal">(Coming Soon)</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
