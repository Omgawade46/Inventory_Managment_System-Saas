import { prisma } from '../src/infrastructure/db';

async function main() {
    try {
        console.log('Verifying setup...');

        // 1. Create Unit
        const unitName = `TestUnit_${Date.now()}`;
        console.log(`Creating unit: ${unitName}`);
        const unit = await prisma.unit.create({
            data: {
                name: unitName,
                baseUnit: 'g',
                conversionFactor: 1
            }
        });
        console.log('Unit created:', unit);

        // 2. Create Raw Material
        const materialName = `TestMaterial_${Date.now()}`;
        console.log(`Creating material: ${materialName}`);
        const material = await prisma.rawMaterial.create({
            data: {
                name: materialName,
                unitId: unit.id,
                costPerUnit: 100,
                minStockLevel: 10
            }
        });
        console.log('Raw Material created:', material);

        // 3. Verify they exist
        const fetchedMaterial = await prisma.rawMaterial.findUnique({
            where: { id: material.id },
            include: { unit: true }
        });

        if (fetchedMaterial && fetchedMaterial.unit) {
            console.log('Verification SUCCESS: Raw material and linked unit found.');
        } else {
            console.error('Verification FAILED: Could not fetch created data.');
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
