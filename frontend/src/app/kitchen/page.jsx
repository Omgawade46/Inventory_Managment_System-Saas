'use client';

import { useState, useEffect } from 'react';
import { inventoryApi } from '@/services/api';
import { useAppSelector } from '@/redux/hooks';
import { Clock, CheckCircle2, Flame, ChefHat, Eye } from 'lucide-react'; // Added Eye icon

export default function KitchenPage() {
    const [items, setItems] = useState([]);
    const { user } = useAppSelector((state) => state.auth); // access current user role

    // Polling setup
    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchQueue = async () => {
        try {
            console.log('Fetching queue for user role:', user?.role);
            const res = await inventoryApi.getKitchenQueue();
            console.log('Queue data:', res.data);
            setItems(res.data);
        } catch (error) {
            console.error('Failed to fetch kitchen queue');
        }
    };

    const updateStatus = async (itemId, newStatus) => {
        // Optimistic update
        setItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, itemStatus: newStatus } : item
        ));

        // API Call
        try {
            await inventoryApi.updateItemStatus(itemId, newStatus);
            fetchQueue(); // Refresh to ensure sync
        } catch (error) {
            console.error('Update failed');
            fetchQueue(); // Revert on fail
        }
    };

    const getColumns = () => {
        const received = items.filter(i => i.itemStatus === 'RECEIVED');
        const preparing = items.filter(i => i.itemStatus === 'PREPARING');
        const ready = items.filter(i => i.itemStatus === 'READY'); // Usually Chef won't see READY items as they go to staff, but if queue logic returns them...
        // Backend logic only returns RECEIVED and PREPARING for queue, so READY items disappear from here implicitly.

        return { received, preparing };
    };

    const { received, preparing } = getColumns();

    return (
        <div className="h-full flex flex-col gap-4">
            {['OWNER', 'MANAGER'].includes(user?.role) && (
                <div className="bg-indigo-900/30 border border-indigo-500/30 p-3 rounded-xl flex items-center gap-3">
                    <Eye className="w-5 h-5 text-indigo-400" />
                    <div>
                        <h3 className="font-bold text-indigo-200 text-sm">Supervision View</h3>
                        <p className="text-indigo-300 text-xs">Monitoring all kitchen stations. You can override status if needed.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
                {/* RECEIVED COLUMN */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 flex flex-col h-full overflow-hidden">
                    <div className={`p-4 border-b flex justify-between items-center ${['OWNER', 'MANAGER'].includes(user?.role) ? 'bg-slate-900 border-slate-700' : 'bg-slate-800 border-slate-700'
                        }`}>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Clock className="w-6 h-6 text-blue-400" />
                            <span className="text-white">RECEIVED</span>
                        </h2>
                        <span className="bg-blue-900/50 text-blue-200 px-3 py-1 rounded-full text-sm font-bold">
                            {received.length}
                        </span>
                    </div>
                    <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                        {received.map(item => (
                            <TicketCard
                                key={item.id}
                                item={item}
                                onAction={() => updateStatus(item.id, 'PREPARING')}
                                actionLabel="Start Cooking"
                                actionColor="bg-blue-600 hover:bg-blue-500"
                                currentUser={user}
                            />
                        ))}
                        {received.length === 0 && <EmptyState message="No pending orders" />}
                    </div>
                </div>

                {/* PREPARING COLUMN */}
                <div className="bg-slate-800/50 rounded-2xl border border-orange-900/30 flex flex-col h-full overflow-hidden">
                    <div className={`p-4 border-b flex justify-between items-center ${['OWNER', 'MANAGER'].includes(user?.role) ? 'bg-orange-950/30 border-orange-900/30' : 'bg-orange-900/20 border-orange-900/30'
                        }`}>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-orange-400">
                            <Flame className="w-6 h-6" />
                            COOKING
                        </h2>
                        <span className="bg-orange-900/50 text-orange-200 px-3 py-1 rounded-full text-sm font-bold">
                            {preparing.length}
                        </span>
                    </div>
                    <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                        {preparing.map(item => (
                            <TicketCard
                                key={item.id}
                                item={item}
                                onAction={() => updateStatus(item.id, 'READY')} // Status changes to READY, item leaves this view
                                actionLabel="Mark Ready"
                                actionColor="bg-green-600 hover:bg-green-500"
                                isCooking
                                currentUser={user}
                            />
                        ))}
                        {preparing.length === 0 && <EmptyState message="Nothing on the grill" />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TicketCard({ item, onAction, actionLabel, actionColor, isCooking, currentUser }) {
    const timeElapsed = Math.floor((new Date() - new Date(item.order?.createdAt)) / 60000);

    return (
        <div className={`p-4 rounded-xl border ${isCooking ? 'bg-orange-950/20 border-orange-500/50' : 'bg-slate-700 border-slate-600'} shadow-lg animation-fade-in`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Table</span>
                    <h3 className="text-2xl font-bold text-white leading-none mt-1">{item.order?.tableNumber}</h3>
                </div>
                <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${timeElapsed > 15 ? 'bg-red-900 text-red-100' : 'bg-slate-800 text-slate-300'}`}>
                        {timeElapsed} min
                    </span>
                </div>
            </div>

            <div className="py-2 border-t border-b border-slate-600/50 my-3">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-slate-100">{item.product?.name}</span>
                    <span className="text-lg font-bold text-white bg-slate-600/50 px-3 py-0.5 rounded-lg">x{item.quantity}</span>
                </div>
            </div>

            {/* Owner/Manager Visibility: Show Assigned Chef */}
            {['OWNER', 'MANAGER'].includes(currentUser?.role) && item.assignedTo && (
                <div className="mb-3 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-600/30">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Processed By</p>
                    <div className="flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-medium text-slate-200">{item.assignedTo.name || 'Unknown Chef'}</span>
                    </div>
                </div>
            )}

            <button
                onClick={onAction}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all transform active:scale-95 shadow-lg ${actionColor}`}
            >
                {actionLabel}
            </button>
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="h-40 flex flex-col items-center justify-center text-slate-500 opacity-50">
            <ChefHat className="w-12 h-12 mb-2" />
            <p>{message}</p>
        </div>
    );
}
