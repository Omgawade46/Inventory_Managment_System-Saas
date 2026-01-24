import { Router } from 'express';
import { createRecipe, getRecipes, getRecipeById, updateRecipe, deleteRecipe } from '../controllers/recipe.controller';

const router = Router();

router.post('/recipes', createRecipe);
router.get('/recipes', getRecipes);
router.get('/recipes/:id', getRecipeById);
router.put('/recipes/:id', updateRecipe);
router.delete('/recipes/:id', deleteRecipe);

// Helper route to get recipes by product easily? 
// Actually getRecipes already supports ?productId=... query param as per controller
// But we can add a specific route if perferred style:
// router.get('/products/:productId/recipes', ...) 

export { router as recipeRouter };
