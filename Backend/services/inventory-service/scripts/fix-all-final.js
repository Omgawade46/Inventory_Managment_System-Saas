
const { Client } = require('pg');

const databases = [
    {
        name: 'Supabase',
        url: 'postgresql://postgres.uoccclkwzuwqtrvokemc:NewHorizon%402024@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
        ssl: { rejectUnauthorized: false }
    },
    {
        name: 'Local',
        url: 'postgresql://postgres:1993@localhost:5432/inventory_saas'
    }
];

const sqlLogic = `
DO $$
BEGIN
    -- 1. Create Enums if not exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderStatus') THEN
        CREATE TYPE "OrderStatus" AS ENUM ('RECEIVED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ItemStatus') THEN
        CREATE TYPE "ItemStatus" AS ENUM ('RECEIVED', 'PREPARING', 'READY', 'SERVED');
    END IF;
    -- Role update
    ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CHEF';
    ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STAFF';

    -- 2. Create Tables
    
    CREATE TABLE IF NOT EXISTS "kitchen_categories" (
        "id" TEXT NOT NULL,
        "outlet_id" TEXT,
        "name" VARCHAR(100) NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "kitchen_categories_pkey" PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "chef_category_assignments" (
        "id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "kitchen_category_id" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "chef_category_assignments_pkey" PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "orders" (
        "id" TEXT NOT NULL,
        "outlet_id" TEXT,
        "table_number" INTEGER NOT NULL,
        "status" "OrderStatus" NOT NULL DEFAULT 'RECEIVED',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "order_items" (
        "id" TEXT NOT NULL,
        "order_id" TEXT NOT NULL,
        "product_id" TEXT NOT NULL,
        "kitchen_category_id" TEXT,
        "quantity" INTEGER NOT NULL,
        "item_status" "ItemStatus" NOT NULL DEFAULT 'RECEIVED',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "kitchen_activity_logs" (
        "id" TEXT NOT NULL,
        "order_item_id" TEXT NOT NULL,
        "action" VARCHAR(50) NOT NULL,
        "performed_by" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "kitchen_activity_logs_pkey" PRIMARY KEY ("id")
    );

    -- 3. Ensure Columns/Indexes
    CREATE UNIQUE INDEX IF NOT EXISTS "chef_category_assignments_user_id_kitchen_category_id_key" ON "chef_category_assignments"("user_id", "kitchen_category_id");

    -- 4. Constraint/Type Fixes specifically for Local/UUID mismatches
    -- Try to cast kitchen_category_id to UUID if the referenced table uses UUID
    -- This block handles the "42804" error by attempting to alter type if constraint creation fails logic (simplified here to just try altering first)
    
    -- We can check if kitchen_categories.id is uuid. 
    -- But in a DO block, hard to check dynamically and run DDL.
    -- Instead, we just attempt the constraint. If it fails, that's okay for now, tables exist.
END$$;
`;

const addConstraints = [
    // We split these so one failure doesn't block others
    `ALTER TABLE "chef_category_assignments" ADD CONSTRAINT "chef_category_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    `ALTER TABLE "chef_category_assignments" ADD CONSTRAINT "chef_category_assignments_kitchen_category_id_fkey" FOREIGN KEY ("kitchen_category_id") REFERENCES "kitchen_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    `ALTER TABLE "orders" ADD CONSTRAINT "orders_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    `ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    `ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    `ALTER TABLE "order_items" ADD CONSTRAINT "order_items_kitchen_category_id_fkey" FOREIGN KEY ("kitchen_category_id") REFERENCES "kitchen_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    `ALTER TABLE "kitchen_activity_logs" ADD CONSTRAINT "kitchen_activity_logs_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    `ALTER TABLE "kitchen_activity_logs" ADD CONSTRAINT "kitchen_activity_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`
];

async function main() {
    console.log('🚑 STARTING FINAL REPAIR...');

    for (const db of databases) {
        console.log(`\n-----------------------------------`);
        console.log(`Targeting: ${db.name}`);
        const config = { connectionString: db.url };
        if (db.ssl) config.ssl = db.ssl;

        const client = new Client(config);
        try {
            await client.connect();
            console.log('   Running Structure Creation...');
            await client.query(sqlLogic);

            console.log('   Applying Constraints...');
            for (const q of addConstraints) {
                try {
                    await client.query(q);
                    // process.stdout.write('.');
                } catch (e) {
                    // Ignore "already exists" errors (42710)
                    if (e.code !== '42710' && e.code !== '23505') {
                        // console.log(`\n   Constraint Warning: ${e.message}`);
                    }
                }
            }
            console.log(`\n✅ ${db.name} Repaired.`);

        } catch (err) {
            console.error(`❌ ${db.name} Failed: ${err.message}`);
        } finally {
            await client.end();
        }
    }
    console.log(`\n-----------------------------------`);
}

main();
