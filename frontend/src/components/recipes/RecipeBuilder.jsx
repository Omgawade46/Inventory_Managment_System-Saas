'use client';

import { useState, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Save, ChefHat, Calculator, Edit2, ArrowLeft, Eye, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { saveRecipe, deleteRecipe } from '@/redux/features/inventorySlice';

// Schema
const recipeSchema = z.object({
    productId: z.string().min(1, 'Select a product'),
    ingredients: z.array(z.object({
        rawMaterialId: z.string().min(1, 'Select Material'),
        quantity: z.number().min(0.001, 'Min 0.001'),
    })).min(1, 'Add at least one ingredient'),
});

export default function RecipeBuilder() {
    const dispatch = useAppDispatch();
    const { products, rawMaterials, units, recipes } = useAppSelector((state) => state.inventory);

    // View State
    const [viewMode, setViewMode] = useState('list');
    const [selectedProductId, setSelectedProductId] = useState(null);

    // Form
    const { register, control, handleSubmit, watch, reset, setValue } = useForm({
        resolver: zodResolver(recipeSchema),
        defaultValues: {
            ingredients: [{ rawMaterialId: '', quantity: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'ingredients'
    });

    const watchIngredients = watch('ingredients');

    // Derived State
    const selectedProduct = products.find(p => p.id === selectedProductId);
    const existingRecipe = recipes.find(r => r.productId === selectedProductId);

    // Calculate Costs (Shared Logic)
    const costAnalysis = useMemo(() => {
        const currentIngredients = viewMode === 'edit' ? watchIngredients : (existingRecipe?.ingredients || []);

        let totalCost = 0;
        const breakdown = currentIngredients.map(ing => {
            const material = rawMaterials.find(m => m.id === ing.rawMaterialId);
            const unit = units.find(u => u.id === material?.unitId);

            const cost = material?.costPerUnit ? material.costPerUnit * ing.quantity : 0;
            totalCost += cost;

            return {
                name: material?.name || 'Unknown',
                quantity: ing.quantity,
                symbol: unit?.baseUnit || '',
                cost
            };
        });
        return { totalCost, breakdown };
    }, [watchIngredients, rawMaterials, units, existingRecipe, viewMode]);


    // Handlers
    const handleSelectProduct = (productId) => {
        setSelectedProductId(productId);
        const recipe = recipes.find(r => r.productId === productId);
        if (recipe) {
            setViewMode('detail');
        } else {
            // New Recipe
            reset({
                productId: productId,
                ingredients: [{ rawMaterialId: '', quantity: 0 }]
            });
            setViewMode('edit');
        }
    };

    const handleEdit = () => {
        if (!existingRecipe) return;
        setValue('productId', selectedProductId);
        setValue('ingredients', existingRecipe.ingredients);
        setViewMode('edit');
    };

    const handleCancel = () => {
        if (existingRecipe) {
            setViewMode('detail');
        } else {
            setViewMode('list');
            setSelectedProductId(null);
        }
    };

    const onSubmit = (data) => {
        if (!selectedProduct) return;

        // Map ingredients
        const enrichedIngredients = data.ingredients.map(ing => {
            const material = rawMaterials.find(m => m.id === ing.rawMaterialId);
            return {
                ...ing,
                unitId: material?.unitId || ''
            };
        });

        dispatch(saveRecipe({
            id: existingRecipe?.id || '',
            productId: data.productId,
            productName: selectedProduct.name,
            ingredients: enrichedIngredients,
            version: (existingRecipe?.version || 0) + 1,
            isLocked: false,
        }))
            .unwrap()
            .then(() => {
                alert('Recipe Saved Successfully!');
                setViewMode('detail');
            })
            .catch((err) => {
                alert(`Failed to save: ${err}`);
            });
    };

    const handleDelete = () => {
        if (!existingRecipe) return;
        if (confirm('Are you sure you want to delete this recipe?')) {
            dispatch(deleteRecipe(existingRecipe.id))
                .unwrap()
                .then(() => {
                    alert('Recipe Deleted');
                    setViewMode('list');
                    setSelectedProductId(null);
                })
                .catch((err) => alert('Failed to delete'));
        }
    };

    // --- Renderers ---

    if (viewMode === 'list') {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => {
                        const hasRecipe = recipes.some(r => r.productId === product.id);
                        return (
                            <div
                                key={product.id}
                                onClick={() => handleSelectProduct(product.id)}
                                className={`
                                    relative p-6 rounded-2xl border transition-all cursor-pointer group
                                    ${hasRecipe
                                        ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                                        : 'bg-slate-50 border-dashed border-slate-300 hover:border-slate-400'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-white transition-colors">
                                        {hasRecipe ? <ChefHat className="w-6 h-6 text-blue-600" /> : <Plus className="w-6 h-6 text-slate-400" />}
                                    </div>
                                    {hasRecipe && (
                                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
                                            Configured
                                        </span>
                                    )}
                                </div>

                                <h3 className="font-bold text-slate-900 text-lg mb-1">{product.name}</h3>
                                <p className="text-sm text-slate-500">{product.category}</p>

                                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {hasRecipe ? 'View Recipe' : 'Add Recipe'} <ArrowLeft className="w-4 h-4 rotate-180" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No Products Found</h3>
                        <p className="text-slate-500 text-sm">Add products in the Stock Inventory first.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">

                {/* Header / Nav */}
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <button
                        onClick={() => { setViewMode('list'); setSelectedProductId(null); }}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Products
                    </button>

                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-900">{selectedProduct?.name}</h2>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                            {selectedProduct?.category}
                        </span>
                    </div>

                    {viewMode === 'detail' && (
                        <button
                            onClick={handleEdit}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Recipe"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
                    {viewMode === 'detail' ? (
                        /* --- DETAIL VIEW --- */
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                                <div className="p-3 bg-purple-50 rounded-xl">
                                    <Eye className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Recipe Details</h3>
                                    <p className="text-sm text-slate-500">Version {existingRecipe?.version}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Ingredients Configured</h4>
                                <div className="grid gap-3">
                                    {existingRecipe?.ingredients.map((ing, i) => {
                                        const mat = rawMaterials.find(m => m.id === ing.rawMaterialId);
                                        const unit = units.find(u => u.id === mat?.unitId);
                                        return (
                                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <span className="font-medium text-slate-900">{mat?.name || 'Unknown Item'}</span>
                                                </div>
                                                <div className="font-mono text-slate-600 font-bold">
                                                    {ing.quantity} <span className="text-xs text-slate-400 font-normal">{unit?.baseUnit}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* --- EDIT/CREATE VIEW --- */
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <Edit2 className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{existingRecipe ? 'Edit Recipe' : 'Create Recipe'}</h3>
                                    <p className="text-sm text-slate-500">Configure ingredients and quantities</p>
                                </div>
                            </div>

                            <input type="hidden" {...register('productId')} value={selectedProductId || ''} />

                            <div className="space-y-3">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-slate-700">Ingredients</label>
                                    <button
                                        type="button"
                                        onClick={() => append({ rawMaterialId: '', quantity: 0 })}
                                        className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> Add Row
                                    </button>
                                </div>

                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-3 items-start">
                                        <div className="flex-1">
                                            <select
                                                {...register(`ingredients.${index}.rawMaterialId`)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                                            >
                                                <option value="">Select Material</option>
                                                {rawMaterials.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-32">
                                            <input
                                                type="number"
                                                step="0.001"
                                                {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                                                placeholder="Qty"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                {viewMode === 'edit' && existingRecipe && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                                    >
                                        Delete
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" /> Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Analysis Widget */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
                    <div className="flex items-center gap-2 mb-6 text-slate-700">
                        <Calculator className="w-5 h-5" />
                        <h3 className="font-bold">Cost Analysis</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                            <p className="text-xs text-slate-500">Selling Price</p>
                            <p className="text-2xl font-bold text-slate-900">₹{selectedProduct?.sellingPrice}</p>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {costAnalysis.breakdown.length > 0 ? costAnalysis.breakdown.map((item, i) => (
                                item.quantity > 0 && (
                                    <div key={i} className="flex justify-between text-xs py-2 border-b border-dashed border-slate-100 last:border-0">
                                        <span className="text-slate-600">
                                            {item.name} <span className="text-slate-400">({item.quantity} {item.symbol})</span>
                                        </span>
                                        <span className="font-medium text-slate-700">₹{item.cost.toFixed(2)}</span>
                                    </div>
                                )
                            )) : (
                                <p className="text-xs text-slate-400 text-center py-4">Add ingredients to see cost breakdown</p>
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-600">Total Cost</span>
                                <span className="text-lg font-bold text-slate-900">₹{costAnalysis.totalCost.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">Profit</span>
                                <span className={`text-lg font-bold ${(selectedProduct?.sellingPrice || 0) - costAnalysis.totalCost > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    ₹{((selectedProduct?.sellingPrice || 0) - costAnalysis.totalCost).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
