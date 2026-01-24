import { prisma } from '../src/infrastructure/db';

async function main() {
    try {
        console.log('Verifying Phase 2 (Products & Recipes)...');

        // 1. Get a Unit (create if not exists)
        let unit = await prisma.unit.findFirst();
        if (!unit) {
            unit = await prisma.unit.create({ data: { name: 'Gram', baseUnit: 'g', conversionFactor: 1 } });
        }

        // 2. Get a Raw Material (create if not exists)
        let material = await prisma.rawMaterial.findFirst();
        if (!material) {
            material = await prisma.rawMaterial.create({
                data: { name: 'Flour', unitId: unit.id, costPerUnit: 0.05, minStockLevel: 1000 }
            });
        }
        console.log('Using Raw Material:', material.name);

        // 3. Create Product
        const productName = `Pizza_${Date.now()}`;
        console.log(`Creating Product: ${productName}`);
        const product = await prisma.product.create({
            data: {
                name: productName,
                sellingPrice: 12.99
            }
        });
        console.log('Product Created:', product.id);

        // 4. Create Recipe
        console.log('Creating Recipe...');
        const recipe = await prisma.recipe.create({
            data: {
                productId: product.id,
                version: 1,
                ingredients: {
                    create: [
                        { rawMaterialId: material.id, quantity: 200, unitId: unit.id }
                    ]
                }
            },
            include: { ingredients: true }
        });

        if (recipe && recipe.ingredients.length > 0) {
            console.log('Verification SUCCESS: Recipe created with ingredients.');
            console.log(JSON.stringify(recipe, null, 2));
        } else {
            console.error('Verification FAILED: Recipe not created correctly.');
            process.exit(1);
        }

    } catch (e) {
        console.error('Verification Error:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
