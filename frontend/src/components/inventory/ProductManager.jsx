'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Search, Package, Edit2, Trash2, Tag, DollarSign } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addProduct, deleteProduct, updateProduct } from '@/redux/features/inventorySlice';

// Schema
const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    category: z.string().min(1, 'Category is required'),
    sellingPrice: z.number().min(0, 'Price must be positive'),
});

export default function ProductManager() {
    const dispatch = useAppDispatch();
    const { products } = useAppSelector((state) => state.inventory);
    const { user } = useAppSelector((state) => state.auth);

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const isOwner = user?.role === 'OWNER';
    const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER';

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue
    } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: { sellingPrice: 0 }
    });

    const onSubmit = (data) => {
        const payload = {
            ...data,
            outletId: user?.outletId || '33333333-3333-3333-3333-333333333333',
        };

        if (editingId) {
            dispatch(updateProduct({
                id: editingId,
                outletId: products.find(p => p.id === editingId)?.outletId || '33333333-3333-3333-3333-333333333333',
                ...data
            }));
            setEditingId(null);
        } else {
            dispatch(addProduct({ id: `p-${Date.now()}`, ...payload }));
            setIsAdding(false);
        }
        reset();
    };

    const startEdit = (product) => {
        setEditingId(product.id);
        setValue('name', product.name);
        setValue('category', product.category);
        setValue('sellingPrice', product.sellingPrice);
        setIsAdding(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm"
                    />
                </div>
                {!isAdding && canManage && (
                    <button
                        onClick={() => { reset(); setIsAdding(true); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-200"
                    >
                        <Plus className="w-4 h-4" /> Add Product
                    </button>
                )}
            </div>

            {/* Form Section */}
            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                        <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <Package className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Name</label>
                                <input {...register('name')} className="form-input w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500" placeholder="e.g. Chicken Burger" />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                                <input {...register('category')} className="form-input w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500" placeholder="e.g. Main Course" />
                                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Selling Price (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('sellingPrice', { valueAsNumber: true })}
                                    className="form-input w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                                    placeholder="0.00"
                                />
                                {errors.sellingPrice && <p className="text-xs text-red-500 mt-1">{errors.sellingPrice.message}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-5 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                            >
                                {editingId ? 'Update Product' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="group bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-all duration-200 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg">{product.name}</h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Tag className="w-3 h-3 text-slate-400" />
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{product.category}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div className="text-sm text-slate-500">Price</div>
                                <div className="text-2xl font-bold text-emerald-600 flex items-center">
                                    <span className="text-lg mr-0.5">₹</span>{Number(product.sellingPrice).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {canManage && (
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => startEdit(product)}
                                    className="p-2 bg-white text-blue-600 shadow-md rounded-lg hover:bg-blue-50"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => dispatch(deleteProduct(product.id))}
                                    className="p-2 bg-white text-red-600 shadow-md rounded-lg hover:bg-red-50"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && !isAdding && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No Products Found</h3>
                    <p className="text-slate-500 text-sm">Get started by adding your first product.</p>
                </div>
            )}
        </div>
    );
}
