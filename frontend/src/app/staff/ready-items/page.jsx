'use client';

import { useState, useEffect } from 'react';
import { inventoryApi } from '@/services/api';
import { CheckCircle, Clock } from 'lucide-react';

export default function ReadyItemsPage() {
    const [items, setItems] = useState([]);

    // Polling setup
    useEffect(() => {
        fetchReadyItems();
        const interval = setInterval(fetchReadyItems, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchReadyItems = async () => {
        try {
            const res = await inventoryApi.getReadyItems();
            setItems(res.data);
        } catch (error) {
            console.error('Failed to fetch ready items');
        }
    };

    const serveItem = async (itemId) => {
        // Optimistic update
        setItems(prev => prev.filter(item => item.id !== itemId));

        try {
            await inventoryApi.markItemServed(itemId);
            // No need to refetch immediately as optimistic update handles UI
        } catch (error) {
            console.error('Failed to serve item');
            fetchReadyItems(); // Revert
        }
    };

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Ready to Serve</h1>
                    <p className="text-slate-500">Pick up these items from the pass</p>
                </div>
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold">
                    {items.length} Pending
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
                            <span className="font-bold text-green-800 text-lg">Table {item.order?.tableNumber}</span>
                            <span className="text-xs font-bold bg-white text-green-600 px-2 py-1 rounded border border-green-100 uppercase">
                                Ready
                            </span>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-medium text-slate-900 mb-4 flex justify-between">
                                <span>{item.product?.name}</span>
                                <span className="font-bold">x{item.quantity}</span>
                            </h3>

                            <button
                                onClick={() => serveItem(item.id)}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-green-200"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Mark Served
                            </button>
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                        <Clock className="w-12 h-12 mb-4 text-slate-300" />
                        <p className="font-medium">All clear! No items waiting.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
