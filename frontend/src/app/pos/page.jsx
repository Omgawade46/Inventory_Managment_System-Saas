'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { inventoryApi } from '@/services/api';
import { ShoppingCart, Plus, Minus, ChefHat } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function POSPage() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState({}); // { productId: quantity }
    const [tableNumber, setTableNumber] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const res = await inventoryApi.getProducts();
            setProducts(res.data);
        } catch (error) {
            console.error('Failed to load products');
        }
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => {
            const current = prev[productId] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const { [productId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: next };
        });
    };

    const placeOrder = async () => {
        setLoading(true);
        try {
            const items = Object.entries(cart).map(([productId, quantity]) => ({
                productId,
                quantity
            }));

            await inventoryApi.createOrder({
                tableNumber,
                items
            });

            // Reset
            setCart({});
            alert('Order Sent to Kitchen!');
        } catch (error) {
            console.error('Failed to place order', error);
            alert('Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const cartTotal = Object.entries(cart).reduce((acc, [pid, qty]) => {
        const product = products.find(p => p.id === pid);
        return acc + (qty * (product?.sellingPrice || 0));
    }, 0);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                    POS Terminal (Simulation)
                </h1>
                <div className="flex gap-4">
                    <button onClick={() => router.push('/dashboard/settings')} className="text-slate-500 hover:text-slate-800">Settings</button>
                    <button onClick={() => router.push('/kitchen')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg">
                        <ChefHat className="w-4 h-4" /> Go to Kitchen
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Menu Area */}
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {products.map(product => (
                        <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-40">
                            <div>
                                <h3 className="font-bold text-slate-800 truncate" title={product.name}>{product.name}</h3>
                                <p className="text-green-600 font-medium">₹{product.sellingPrice}</p>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <button
                                    onClick={() => updateQuantity(product.id, -1)}
                                    className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                                    disabled={!cart[product.id]}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold text-slate-900 w-8 text-center">{cart[product.id] || 0}</span>
                                <button
                                    onClick={() => updateQuantity(product.id, 1)}
                                    className="p-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cart Area */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-fit">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Table Number</label>
                        <input
                            type="number"
                            min="1"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(parseInt(e.target.value))}
                            className="w-full px-4 py-2 text-xl font-bold text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="space-y-4 mb-6">
                        {Object.entries(cart).map(([pid, qty]) => {
                            const product = products.find(p => p.id === pid);
                            if (!product) return null;
                            return (
                                <div key={pid} className="flex justify-between items-center text-sm">
                                    <span>{product.name} x {qty}</span>
                                    <span className="font-medium">₹{product.sellingPrice * qty}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-t border-slate-100 pt-4 mb-6">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span>₹{cartTotal}</span>
                        </div>
                    </div>

                    <button
                        onClick={placeOrder}
                        disabled={loading || Object.keys(cart).length === 0}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Send to Kitchen'}
                    </button>
                </div>
            </div>
        </div>
    );
}
