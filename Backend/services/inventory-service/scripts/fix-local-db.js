
const { Client } = require('pg');

const localUrl = 'postgresql://postgres:1993@localhost:5432/inventory_saas';

const createEnums = `
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderStatus') THEN
        CREATE TYPE "OrderStatus" AS ENUM ('RECEIVED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ItemStatus') THEN
        CREATE TYPE "ItemStatus" AS ENUM ('RECEIVED', 'PREPARING', 'READY', 'SERVED');
    END IF;
    -- Role update
    ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CHEF';
    ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STAFF';
END$$;
`;

const createTables = `
-- Create missing tables if they don't exist
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
`;

const createIndexesAndConstraints = `
-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "chef_category_assignments_user_id_kitchen_category_id_key" ON "chef_category_assignments"("user_id", "kitchen_category_id");

-- Constraints (these might fail if they exist, ignoring errors via DO block or just try/catch in node)
-- We will run typical ADD CONSTRAINT checking existence first to be safe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chef_category_assignments_user_id_fkey') THEN
        ALTER TABLE "chef_category_assignments" ADD CONSTRAINT "chef_category_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chef_category_assignments_kitchen_category_id_fkey') THEN
        ALTER TABLE "chef_category_assignments" ADD CONSTRAINT "chef_category_assignments_kitchen_category_id_fkey" FOREIGN KEY ("kitchen_category_id") REFERENCES "kitchen_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_outlet_id_fkey') THEN
        ALTER TABLE "orders" ADD CONSTRAINT "orders_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_order_id_fkey') THEN
        ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_product_id_fkey') THEN
        ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_kitchen_category_id_fkey') THEN
        ALTER TABLE "order_items" ADD CONSTRAINT "order_items_kitchen_category_id_fkey" FOREIGN KEY ("kitchen_category_id") REFERENCES "kitchen_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'kitchen_activity_logs_order_item_id_fkey') THEN
        ALTER TABLE "kitchen_activity_logs" ADD CONSTRAINT "kitchen_activity_logs_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'kitchen_activity_logs_performed_by_fkey') THEN
        ALTER TABLE "kitchen_activity_logs" ADD CONSTRAINT "kitchen_activity_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
`;

async function main() {
    console.log('🔧 REPAIRING LOCAL DATABASE...');
    const client = new Client({ connectionString: localUrl });
    try {
        await client.connect();

        console.log('Creating Enums...');
        await client.query(createEnums);

        console.log('Creating Tables...');
        await client.query(createTables);

        console.log('Adding Constraints...');
        await client.query(createIndexesAndConstraints);

        console.log('✅ REPAIR COMPLETE. Missing tables created.');
    } catch (err) {
        console.error('❌ REPAIR FAILED:', err);
    } finally {
        await client.end();
    }
}

main();
