import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryApi } from '@/services/api';

const initialState = {
    units: [],
    rawMaterials: [],
    stockLogs: [],
    products: [],
    recipes: [],
    loading: false,
    error: null,
};

// --- Async Thunks ---
export const fetchInventoryData = createAsyncThunk(
    'inventory/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const [unitsRes, materialsRes, logsRes, productsRes, recipesRes] = await Promise.all([
                inventoryApi.getUnits(),
                inventoryApi.getMaterials(),
                inventoryApi.getStockLogs(),
                inventoryApi.getProducts(),
                inventoryApi.getRecipes()
            ]);
            // Assuming Backend returns arrays directly or { data: [] }
            return {
                units: unitsRes.data || [],
                rawMaterials: materialsRes.data || [],
                stockLogs: logsRes.data || [],
                products: productsRes.data || [],
                recipes: recipesRes.data || []
            };
        } catch (err) {
            console.error('Fetch Error:', err);
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch inventory data');
        }
        console.log('Fetched Data:', {
            units: unitsRes.data,
            rawMaterials: materialsRes.data,
            stockLogs: logsRes.data,
            products: productsRes.data,
            recipes: recipesRes.data
        });
    }
);

export const addRawMaterial = createAsyncThunk(
    'inventory/addRawMaterial',
    async (material, { rejectWithValue }) => {
        try {
            const res = await inventoryApi.createMaterial(material);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to add material');
        }
    }
);

export const updateRawMaterial = createAsyncThunk(
    'inventory/updateRawMaterial',
    async (material, { rejectWithValue }) => {
        try {
            const res = await inventoryApi.updateMaterial(material.id, material);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update material');
        }
    }
);

export const deleteRawMaterial = createAsyncThunk(
    'inventory/deleteRawMaterial',
    async (id, { rejectWithValue }) => {
        try {
            await inventoryApi.deleteMaterial(id);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete material');
        }
    }
);

export const addUnit = createAsyncThunk(
    'inventory/addUnit',
    async (unit, { rejectWithValue }) => {
        try {
            const res = await inventoryApi.createUnit(unit);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to add unit');
        }
    }
);

export const updateUnit = createAsyncThunk(
    'inventory/updateUnit',
    async (unit, { rejectWithValue }) => {
        try {
            const res = await inventoryApi.updateUnit(unit.id, unit);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update unit');
        }
    }
);

export const deleteUnit = createAsyncThunk(
    'inventory/deleteUnit',
    async (id, { rejectWithValue }) => {
        try {
            await inventoryApi.deleteUnit(id);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete unit');
        }
    }
);

export const addStockOperation = createAsyncThunk(
    'inventory/addStockLog',
    async (log, { rejectWithValue }) => {
        try {
            const res = await inventoryApi.addStockLog(log);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to log stock');
        }
    }
);

export const saveRecipe = createAsyncThunk(
    'inventory/saveRecipe',
    async (recipe, { rejectWithValue }) => {
        try {
            if (recipe.id && !recipe.id.startsWith('r-')) {
                const res = await inventoryApi.updateRecipe(recipe.id, recipe);
                return res.data;
            } else {
                const { id, ...data } = recipe;
                const res = await inventoryApi.createRecipe(data);
                return res.data;
            }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to save recipe');
        }
    }
);

export const deleteRecipe = createAsyncThunk(
    'inventory/deleteRecipe',
    async (id, { rejectWithValue }) => {
        try {
            await inventoryApi.deleteRecipe(id);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete recipe');
        }
    }
);

export const addProduct = createAsyncThunk(
    'inventory/addProduct',
    async (product, { rejectWithValue }) => {
        try {
            const res = await inventoryApi.createProduct(product);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to add product');
        }
    }
);

export const updateProduct = createAsyncThunk(
    'inventory/updateProduct',
    async (product, { rejectWithValue }) => {
        try {
            const res = await inventoryApi.updateProduct(product.id, product);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update product');
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'inventory/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            await inventoryApi.deleteProduct(id);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete product');
        }
    }
);

// --- Slice ---
export const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {
        saveRecipe: (state, action) => {
            const index = state.recipes.findIndex(r => r.productId === action.payload.productId);
            if (index !== -1) {
                state.recipes[index] = action.payload;
            } else {
                state.recipes.push(action.payload);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchInventoryData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInventoryData.fulfilled, (state, action) => {
                state.loading = false;
                state.units = action.payload.units || [];
                state.rawMaterials = action.payload.rawMaterials || [];
                state.stockLogs = action.payload.stockLogs || [];
                state.products = action.payload.products || [];
                state.recipes = action.payload.recipes || [];
            })
            .addCase(fetchInventoryData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Raw Materials
            .addCase(addRawMaterial.fulfilled, (state, action) => {
                state.rawMaterials.push(action.payload);
            })
            .addCase(updateRawMaterial.fulfilled, (state, action) => {
                const index = state.rawMaterials.findIndex(m => m.id === action.payload.id);
                if (index !== -1) state.rawMaterials[index] = action.payload;
            })
            .addCase(deleteRawMaterial.fulfilled, (state, action) => {
                state.rawMaterials = state.rawMaterials.filter(m => m.id !== action.payload);
            })
            // Units
            .addCase(addUnit.fulfilled, (state, action) => {
                state.units.push(action.payload);
            })
            .addCase(updateUnit.fulfilled, (state, action) => {
                const index = state.units.findIndex(u => u.id === action.payload.id);
                if (index !== -1) state.units[index] = action.payload;
            })
            .addCase(deleteUnit.fulfilled, (state, action) => {
                state.units = state.units.filter(u => u.id !== action.payload);
            })
            // Stock Logs
            .addCase(addStockOperation.fulfilled, (state, action) => {
                const { log, newStock } = action.payload || {};
                if (log) {
                    state.stockLogs.unshift(log);
                    const material = state.rawMaterials.find(m => m.id === log.rawMaterialId);
                    if (material) {
                        material.currentStock = newStock;
                    }
                }
            })
            // Products
            .addCase(addProduct.fulfilled, (state, action) => {
                state.products.push(action.payload);
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.products.findIndex(p => p.id === action.payload.id);
                if (index !== -1) state.products[index] = action.payload;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(p => p.id !== action.payload);
            })

            // Recipes
            .addCase(saveRecipe.fulfilled, (state, action) => {
                const index = state.recipes.findIndex(r => r.productId === action.payload.productId);
                if (index !== -1) {
                    state.recipes[index] = action.payload;
                } else {
                    state.recipes.push(action.payload);
                }
            })
            .addCase(deleteRecipe.fulfilled, (state, action) => {
                state.recipes = state.recipes.filter(r => r.id !== action.payload);
            });
    },
});

export const { } = inventorySlice.actions;
export default inventorySlice.reducer;
