import Link from 'next/link';
import { ArrowRight, Package, ShieldCheck, TrendingUp } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Navbar */}
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="font-bold text-xl text-slate-900 tracking-tight">
                    SaaS<span className="text-blue-600">Inventory</span>
                </div>
                <div className="flex gap-4">
                    <Link href="/login" className="px-5 py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                        Sign In
                    </Link>
                    <Link href="/login" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    v1.0 Now Live
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 max-w-4xl">
                    Inventory control <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        reimagined for growth.
                    </span>
                </h1>

                <p className="text-lg text-slate-500 max-w-2xl mb-10 leading-relaxed">
                    Streamline your operations with our premium inventory management system.
                    Track stock, manage recipes, and analyze costs in real-time.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/login"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-1"
                    >
                        Launch Dashboard <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* Features Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl text-left">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                            <Package className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-2">Smart Inventory</h3>
                        <p className="text-slate-500">Real-time stock tracking with automatic low-stock alerts and purchase logging.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-2">Role Based Control</h3>
                        <p className="text-slate-500">Granular access controls for Owners and Managers to secure sensitive data.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-2">Cost & Recipes</h3>
                        <p className="text-slate-500">Map products to ingredients and automatically calculate profit margins.</p>
                    </div>
                </div>
            </main>

            <footer className="py-8 text-center text-slate-400 text-sm">
                © 2026 SaaS Inventory. All rights reserved.
            </footer>
        </div>
    );
}
