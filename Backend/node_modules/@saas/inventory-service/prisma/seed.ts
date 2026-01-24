import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // 1. Create Business & Outlet & User (Using valid UUIDs)
    const businessId = '22222222-2222-2222-2222-222222222222';
    const outletId = '33333333-3333-3333-3333-333333333333';
    const userId = '11111111-1111-1111-1111-111111111111';

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Cleanup (Optional: remove if you want to preserve data)
    // await prisma.stockLog.deleteMany();
    // await prisma.rawMaterial.deleteMany();
    // await prisma.unit.deleteMany();
    // await prisma.product.deleteMany();
    // await prisma.user.deleteMany();
    // await prisma.outlet.deleteMany();
    // await prisma.business.deleteMany();

    const business = await prisma.business.upsert({
        where: { id: businessId },
        update: {},
        create: {
            id: businessId,
            name: 'My SaaS Business',
            ownerId: userId,
        },
    });

    const outlet = await prisma.outlet.upsert({
        where: { id: outletId },
        update: {},
        create: {
            id: outletId,
            name: 'Main Outlet',
            businessId: business.id,
            address: '123 Main St',
        },
    });

    const user = await prisma.user.upsert({
        where: { id: userId },
        update: {
            password: hashedPassword // Update password if user exists
        },
        create: {
            id: userId,
            name: 'Alice Owner',
            email: 'owner@example.com',
            password: hashedPassword,
            role: 'OWNER',
            businessId: business.id,
            outletId: outlet.id,
        },
    });

    console.log(`Created User: ${user.name}`);

    // Create Manager User
    const managerId = '11111111-1111-1111-1111-111111111112';
    const manager = await prisma.user.upsert({
        where: { id: managerId },
        update: {
            password: hashedPassword
        },
        create: {
            id: managerId,
            name: 'Bob Manager',
            email: 'manager@example.com',
            password: hashedPassword,
            role: 'MANAGER',
            businessId: business.id,
            outletId: outlet.id,
        },
    });
    console.log(`Created User: ${manager.name}`);

    // 2. Create Units
    const unitsData = [
        { id: '44444444-4444-4444-4444-444444444441', name: 'Kilogram', baseUnit: 'kg', conversionFactor: 1 },
        { id: '44444444-4444-4444-4444-444444444442', name: 'Gram', baseUnit: 'kg', conversionFactor: 0.001 },
        { id: '44444444-4444-4444-4444-444444444443', name: 'Liter', baseUnit: 'L', conversionFactor: 1 },
        { id: '44444444-4444-4444-4444-444444444444', name: 'Milliliter', baseUnit: 'L', conversionFactor: 0.001 },
        { id: '44444444-4444-4444-4444-444444444445', name: 'Piece', baseUnit: 'pc', conversionFactor: 1 },
    ];

    for (const u of unitsData) {
        await prisma.unit.upsert({
            where: { id: u.id },
            update: {},
            create: {
                id: u.id,
                name: u.name,
                baseUnit: u.baseUnit,
                conversionFactor: u.conversionFactor,
            },
        });
    }
    console.log('Seeded Units');

    // 3. Create Raw Materials
    const materialsData = [
        { id: '55555555-5555-5555-5555-555555555551', outletId: outletId, name: 'Flour (Atta)', category: 'Dry', unitId: '44444444-4444-4444-4444-444444444441', minStockLevel: 10, currentStock: 45, costPerUnit: 40, supplierName: 'Metro Cash & Carry' },
        { id: '55555555-5555-5555-5555-555555555552', outletId: outletId, name: 'Milk', category: 'Dairy', unitId: '44444444-4444-4444-4444-444444444443', minStockLevel: 5, currentStock: 12, costPerUnit: 60, supplierName: 'Local Dairy' },
        { id: '55555555-5555-5555-5555-555555555553', outletId: outletId, name: 'Tomatoes', category: 'Fresh', unitId: '44444444-4444-4444-4444-444444444441', minStockLevel: 2, currentStock: 8, costPerUnit: 30, supplierName: 'City Market' },
        { id: '55555555-5555-5555-5555-555555555554', outletId: outletId, name: 'Cheese', category: 'Dairy', unitId: '44444444-4444-4444-4444-444444444441', minStockLevel: 2, currentStock: 5, costPerUnit: 400, supplierName: 'GoCheese' },
    ];

    for (const m of materialsData) {
        await prisma.rawMaterial.upsert({
            where: { id: m.id },
            update: {},
            create: {
                id: m.id,
                outletId: m.outletId,
                name: m.name,
                category: m.category,
                unitId: m.unitId,
                minStockLevel: m.minStockLevel,
                currentStock: m.currentStock,
                costPerUnit: m.costPerUnit,
                supplierName: m.supplierName,
                createdBy: userId,
            },
        });
    }
    console.log('Seeded Raw Materials');

    // 4. Create Products
    const productsData = [
        { id: '66666666-6666-6666-6666-666666666661', outletId: outletId, name: 'Margherita Pizza', sellingPrice: 250 },
        { id: '66666666-6666-6666-6666-666666666662', outletId: outletId, name: 'Cheese Burger', sellingPrice: 150 },
        { id: '66666666-6666-6666-6666-666666666663', outletId: outletId, name: 'White Sauce Pasta', sellingPrice: 200 },
    ];

    for (const p of productsData) {
        await prisma.product.upsert({
            where: { id: p.id },
            update: {},
            create: {
                id: p.id,
                outletId: p.outletId,
                name: p.name,
                sellingPrice: p.sellingPrice,
            },
        });
    }
    console.log('Seeded Products');

    // 5. Create Stock Logs
    const stockLogsData = [
        { id: '77777777-7777-7777-7777-777777777771', outletId: outletId, rawMaterialId: '55555555-5555-5555-5555-555555555551', rawMaterialName: 'Flour (Atta)', changeQuantity: 50, changeType: 'PURCHASE', performedBy: userId, date: new Date(Date.now() - 86400000).toISOString() }
    ];

    for (const log of stockLogsData) {
        await prisma.stockLog.upsert({
            where: { id: log.id },
            update: {},
            create: {
                id: log.id,
                outletId: log.outletId,
                rawMaterialId: log.rawMaterialId,
                changeQuantity: log.changeQuantity,
                changeType: log.changeType as any,
                performedBy: log.performedBy,
                createdAt: log.date,
            },
        });
    }
    console.log('Seeded Stock Logs');

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
