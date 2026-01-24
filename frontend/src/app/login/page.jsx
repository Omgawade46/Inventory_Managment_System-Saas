'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/redux/hooks';
import { login } from '@/redux/features/authSlice';
import { Lock, Mail, Store } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const dispatch = useAppDispatch();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await dispatch(login({ email, password })).unwrap();
            router.push('/dashboard');
        } catch (err) {
            setError(err || 'Login failed');
        }
    };

    // Quick fill helper for demo
    const fillOwner = () => {
        setEmail('owner@example.com');
        setPassword('password123');
    };

    const fillManager = () => {
        setEmail('manager@example.com');
        setPassword('password123');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="text-center mb-8">
                    <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                        <Store className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">Sign in to your Inventory Dashboard</p>
                </div>

                <div className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={fillOwner}
                            className="flex-1 text-xs text-slate-500 hover:text-blue-600 underline"
                        >
                            Fill Owner Credentials
                        </button>
                        <button
                            type="button"
                            onClick={fillManager}
                            className="flex-1 text-xs text-slate-500 hover:text-blue-600 underline"
                        >
                            Fill Manager Credentials
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
