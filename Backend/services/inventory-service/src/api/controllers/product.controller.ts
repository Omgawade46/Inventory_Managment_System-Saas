import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/db';
import { Prisma } from '@prisma/client';
import { StockService } from '../services/stock.service';

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, sellingPrice, outletId, kitchenCategoryId, category } = req.body;
        const userOutletId = req.user?.outletId;

        if (!name) {
            return res.status(400).json({ error: 'Product name is required' });
        }

        // Use outlet from user context if not provided in body
        const finalOutletId = outletId || userOutletId || null;

        const product = await prisma.product.create({
            data: {
                name,
                sellingPrice,
                outletId: finalOutletId,
                kitchenCategoryId,
                category
            },
        });
        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const userOutletId = req.user?.outletId;

        // Filter by outlet if user has outlet context (outlet-level isolation)
        const whereClause: any = { isActive: true };
        if (userOutletId) {
            whereClause.outletId = userOutletId;
        }

        const products = await prisma.product.findMany({
            where: whereClause,
            include: { recipes: true, outlet: true, kitchenCategory: true }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, category, sellingPrice, kitchenCategoryId } = req.body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                category,
                sellingPrice,
                kitchenCategoryId
            }
        });
        res.json(product);
    } catch (error: any) {
        console.error('Update Product Error:', error);
        res.status(500).json({ error: 'Failed to update product', details: error.message, code: error.code });
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.product.update({
            where: { id },
            data: { isActive: false }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
}

/**
 * Check if a product can be sold in the requested quantity
 * This is called by the ordering system before allowing an order
 */
export const checkProductAvailability = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.query;
        const requestedQty = parseInt(String(quantity || 1));

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        if (requestedQty <= 0) {
            return res.status(400).json({ error: 'Quantity must be greater than 0' });
        }

        // Get the product with its active recipe
        const product = await prisma.product.findUnique({
            where: { id: productId, isActive: true },
            include: {
                recipes: {
                    where: { isLocked: true }, // Use locked recipe (production version)
                    include: {
                        ingredients: {
                            include: {
                                rawMaterial: true,
                                unit: true
                            }
                        }
                    },
                    take: 1,
                    orderBy: { version: 'desc' } // Get latest version
                }
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found or inactive' });
        }

        if (!product.recipes || product.recipes.length === 0) {
            return res.status(400).json({
                error: 'Product has no recipe defined. Cannot check availability.',
                available: false
            });
        }

        const recipe = product.recipes[0];
        const unavailableIngredients: Array<{
            rawMaterialId: string;
            rawMaterialName: string;
            required: number;
            available: number;
            unit: string;
        }> = [];

        // Check each ingredient
        for (const ingredient of recipe.ingredients) {
            if (!ingredient.rawMaterialId || !ingredient.rawMaterial) {
                continue;
            }

            const material = ingredient.rawMaterial;
            const requiredQty = Number(ingredient.quantity) * requestedQty;

            // Account for yield loss
            const yieldLoss = Number(ingredient.yieldLossPercent || 0) / 100;
            const adjustedRequiredQty = requiredQty * (1 + yieldLoss);

            const availableStock = Number(material.currentStock || 0);

            if (availableStock < adjustedRequiredQty) {
                unavailableIngredients.push({
                    rawMaterialId: material.id,
                    rawMaterialName: material.name,
                    required: adjustedRequiredQty,
                    available: availableStock,
                    unit: ingredient.unit?.name || ''
                });
            }
        }

        const available = unavailableIngredients.length === 0;

        res.json({
            available,
            productId: product.id,
            productName: product.name,
            requestedQuantity: requestedQty,
            unavailableIngredients: available ? [] : unavailableIngredients,
            message: available
                ? `Product is available for ${requestedQty} unit(s)`
                : `Product is not available. ${unavailableIngredients.length} ingredient(s) insufficient.`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to check product availability' });
    }
};

/**
 * Automatically deduct stock when a product is sold
 * This is called by the ordering system after order confirmation
 */
export const deductStockForSale = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const { quantity, orderId, outletId } = req.body;
        const performedBy = req.body.performedBy || req.user?.id;

        if (!productId || !quantity) {
            return res.status(400).json({ error: 'Product ID and quantity are required' });
        }

        const saleQty = parseInt(String(quantity));
        if (saleQty <= 0) {
            return res.status(400).json({ error: 'Quantity must be greater than 0' });
        }


        try {
            const result = await StockService.deductStockForProduct(
                productId,
                saleQty,
                outletId,
                performedBy,
                orderId
            );

            if (!result.success) {
                return res.status(400).json({
                    error: result.error,
                    unavailableIngredients: result.unavailableIngredients
                });
            }

            res.status(200).json({
                success: true,
                productId,
                quantitySold: saleQty,
                deductions: result.updatedMaterials,
                message: `Stock deducted successfully`
            });

        } catch (e: any) {
            // Handle known errors from service
            if (e.message.includes('Product not found') || e.message.includes('has no recipe')) {
                return res.status(400).json({ error: e.message });
            }
            throw e;
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to deduct stock for sale' });
    }
};

/**
 * Calculate cost breakdown for a product based on its recipe
 */
export const getProductCostBreakdown = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: productId, isActive: true },
            include: {
                recipes: {
                    where: { isLocked: true },
                    include: {
                        ingredients: {
                            include: {
                                rawMaterial: {
                                    include: { unit: true }
                                },
                                unit: true
                            }
                        }
                    },
                    take: 1,
                    orderBy: { version: 'desc' }
                }
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found or inactive' });
        }

        if (!product.recipes || product.recipes.length === 0) {
            return res.status(400).json({ error: 'Product has no recipe defined' });
        }

        const recipe = product.recipes[0];
        let totalCost = 0;
        const costBreakdown = [];

        for (const ingredient of recipe.ingredients) {
            if (!ingredient.rawMaterial || !ingredient.rawMaterial.costPerUnit) {
                continue;
            }

            const quantity = Number(ingredient.quantity);
            const yieldLoss = Number(ingredient.yieldLossPercent || 0) / 100;
            const adjustedQuantity = quantity * (1 + yieldLoss);
            const costPerUnit = Number(ingredient.rawMaterial.costPerUnit);
            const ingredientCost = adjustedQuantity * costPerUnit;

            totalCost += ingredientCost;

            costBreakdown.push({
                rawMaterialId: ingredient.rawMaterial.id,
                rawMaterialName: ingredient.rawMaterial.name,
                quantity: quantity,
                adjustedQuantity: adjustedQuantity,
                unit: ingredient.unit?.name || ingredient.rawMaterial.unit?.name || '',
                costPerUnit: costPerUnit,
                ingredientCost: ingredientCost,
                yieldLossPercent: Number(ingredient.yieldLossPercent || 0)
            });
        }

        res.json({
            productId: product.id,
            productName: product.name,
            recipeVersion: recipe.version,
            totalCost: totalCost,
            sellingPrice: product.sellingPrice ? Number(product.sellingPrice) : null,
            profitMargin: product.sellingPrice
                ? ((Number(product.sellingPrice) - totalCost) / Number(product.sellingPrice)) * 100
                : null,
            costBreakdown
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to calculate product cost breakdown' });
    }
};
