
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Setting up Chef Test Data ---');

        // 1. Get Outlet (First one)
        const outlet = await prisma.outlet.findFirst();
        if (!outlet) {
            console.error('No outlet found. Please run basic seed first.');
            return;
        }
        console.log(`Using Outlet: ${outlet.name} (${outlet.id})`);

        // 2. Create Kitchen Category
        let category = await prisma.kitchenCategory.findFirst({
            where: { name: 'Test Station' }
        });

        if (!category) {
            category = await prisma.kitchenCategory.create({
                data: {
                    name: 'Test Station',
                    outletId: outlet.id
                }
            });
            console.log('Created Category: Test Station');
        } else {
            console.log('Found Category: Test Station');
        }

        // 3. Create Chef User
        const chefEmail = 'chef@example.com';
        let chef = await prisma.user.findUnique({
            where: { email: chefEmail }
        });

        if (!chef) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            chef = await prisma.user.create({
                data: {
                    name: 'Gordon Ramsay',
                    email: chefEmail,
                    password: hashedPassword,
                    role: Role.CHEF,
                    outletId: outlet.id,
                    businessId: outlet.businessId
                }
            });
            console.log('Created Chef: chef@example.com / password123');
        } else {
            console.log('Found Chef: chef@example.com');
            // Ensure role is CHEF
            if (chef.role !== Role.CHEF) {
                await prisma.user.update({
                    where: { id: chef.id },
                    data: { role: Role.CHEF }
                });
                console.log('Updated user role to CHEF');
            }
        }

        // 4. Assign Chef to Category
        const existingAssignment = await prisma.chefCategoryAssignment.findFirst({
            where: {
                userId: chef.id,
                kitchenCategoryId: category.id
            }
        });

        if (!existingAssignment) {
            await prisma.chefCategoryAssignment.create({
                data: {
                    userId: chef.id,
                    kitchenCategoryId: category.id
                }
            });
            console.log('Assigned Chef to Test Station');
        } else {
            console.log('Chef already assigned to Test Station');
        }

        console.log('--- Setup Complete ---');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
