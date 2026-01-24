import { prisma } from '../src/infrastructure/db';

async function main() {
    try {
        console.log('Applying triggers...');

        // 1. Create Function
        await prisma.$executeRawUnsafe(`
            CREATE OR REPLACE FUNCTION update_timestamp()
            RETURNS TRIGGER AS $$
            BEGIN
               NEW.updated_at = NOW();
               RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);
        console.log('Function update_timestamp created.');

        // 2. Create Trigger for Business
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS update_business_timestamp ON businesses;`);
        await prisma.$executeRawUnsafe(`CREATE TRIGGER update_business_timestamp BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_timestamp();`);
        console.log('Trigger for businesses created.');

        // 3. Create Trigger for RawMaterial
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS update_raw_materials_timestamp ON raw_materials;`);
        await prisma.$executeRawUnsafe(`CREATE TRIGGER update_raw_materials_timestamp BEFORE UPDATE ON raw_materials FOR EACH ROW EXECUTE FUNCTION update_timestamp();`);
        console.log('Trigger for raw_materials created.');

        console.log('All triggers applied successfully.');
    } catch (e) {
        console.error('Error applying triggers:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
