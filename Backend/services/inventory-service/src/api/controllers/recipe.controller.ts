import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/db';


export const createRecipe = async (req: Request, res: Response) => {
    try {
        const { productId, ingredients, version, createdBy } = req.body;
        // ingredients: [{ rawMaterialId, quantity, unitId }]

        if (!productId || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Product ID and at least one ingredient are required' });
        }

        // Use transaction to create Recipe and Ingredients together
        const recipe = await prisma.$transaction(async (tx) => {
            // 1. Create Recipe
            const createdRecipe = await tx.recipe.create({
                data: {
                    productId,
                    version: version || 1,
                    createdBy: createdBy || null
                }
            });

            // 2. Add Ingredients
            for (const ing of ingredients) {
                await tx.recipeIngredient.create({
                    data: {
                        recipeId: createdRecipe.id,
                        rawMaterialId: ing.rawMaterialId,
                        quantity: ing.quantity,
                        unitId: ing.unitId,
                        yieldLossPercent: ing.yieldLossPercent || 0
                    }
                });
            }

            return createdRecipe;
        });

        // Fetch complete recipe with details
        const completeRecipe = await prisma.recipe.findUnique({
            where: { id: recipe.id },
            include: {
                ingredients: {
                    include: { rawMaterial: true, unit: true }
                }
            }
        });

        res.status(201).json(completeRecipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create recipe' });
    }
};

export const getRecipes = async (req: Request, res: Response) => {
    try {
        const { productId } = req.query;
        const whereClause = productId ? { productId: String(productId) } : {};

        const recipes = await prisma.recipe.findMany({
            where: whereClause,
            include: {
                product: true,
                ingredients: {
                    include: { rawMaterial: true, unit: true }
                }
            }
        });
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
};

export const getRecipeById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const recipe = await prisma.recipe.findUnique({
            where: { id },
            include: {
                product: true,
                ingredients: {
                    include: { rawMaterial: true, unit: true }
                }
            }
        });
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recipe' });
    }
};

export const updateRecipe = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { productId, ingredients, version, isLocked } = req.body;

        // Check if recipe exists and is locked
        const existingRecipe = await prisma.recipe.findUnique({
            where: { id }
        });

        if (!existingRecipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        if (existingRecipe.isLocked) {
            return res.status(400).json({ error: 'Cannot update a locked recipe' });
        }

        // Use transaction to update Recipe and Ingredients
        const updatedRecipe = await prisma.$transaction(async (tx) => {
            // 1. Update Recipe
            const recipeData: any = {};
            if (productId !== undefined) recipeData.productId = productId;
            if (version !== undefined) recipeData.version = version;
            if (isLocked !== undefined) recipeData.isLocked = isLocked;

            const updated = await tx.recipe.update({
                where: { id },
                data: recipeData
            });

            // 2. Update Ingredients if provided
            if (ingredients && Array.isArray(ingredients)) {
                // Delete existing ingredients
                await tx.recipeIngredient.deleteMany({
                    where: { recipeId: id }
                });

                // Create new ingredients
                for (const ing of ingredients) {
                    await tx.recipeIngredient.create({
                        data: {
                            recipeId: id,
                            rawMaterialId: ing.rawMaterialId,
                            quantity: ing.quantity,
                            unitId: ing.unitId,
                            yieldLossPercent: ing.yieldLossPercent || 0
                        }
                    });
                }
            }

            return updated;
        });

        // Fetch complete recipe with details
        const completeRecipe = await prisma.recipe.findUnique({
            where: { id },
            include: {
                product: true,
                ingredients: {
                    include: { rawMaterial: true, unit: true }
                }
            }
        });

        res.json(completeRecipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update recipe' });
    }
};

export const deleteRecipe = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if recipe exists and is locked
        const existingRecipe = await prisma.recipe.findUnique({
            where: { id }
        });

        if (!existingRecipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        if (existingRecipe.isLocked) {
            return res.status(400).json({ error: 'Cannot delete a locked recipe' });
        }

        // Delete recipe (ingredients will be cascade deleted)
        await prisma.recipe.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete recipe' });
    }
};