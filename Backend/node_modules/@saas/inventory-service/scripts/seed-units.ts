import { prisma } from '../src/infrastructure/db';

async function main() {
    console.log('Seeding standard units...');

    const units = [
        { name: 'kg', baseUnit: 'g', conversionFactor: 1000 },
        { name: 'g', baseUnit: 'g', conversionFactor: 1 },
        { name: 'L', baseUnit: 'ml', conversionFactor: 1000 },
        { name: 'ml', baseUnit: 'ml', conversionFactor: 1 },
        { name: 'unit', baseUnit: 'unit', conversionFactor: 1 },
        { name: 'pcs', baseUnit: 'unit', conversionFactor: 1 },
    ];

    for (const unit of units) {
        try {
            const existing = await prisma.unit.findFirst({ where: { name: unit.name } });
            if (!existing) {
                await prisma.unit.create({ data: unit });
                console.log(`Created unit: ${unit.name}`);
            } else {
                console.log(`Unit already exists: ${unit.name}`);
            }
        } catch (e) {
            console.error(`Error creating ${unit.name}:`, e);
        }
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
