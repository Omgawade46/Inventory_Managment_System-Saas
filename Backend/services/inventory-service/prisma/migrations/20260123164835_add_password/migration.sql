-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'MANAGER');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('PURCHASE', 'SALE', 'WASTAGE', 'CORRECTION');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('LOW_STOCK');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED');

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outlets" (
    "id" TEXT NOT NULL,
    "business_id" TEXT,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outlets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "business_id" TEXT,
    "outlet_id" TEXT,
    "name" VARCHAR(150),
    "email" VARCHAR(150),
    "password" VARCHAR(255) NOT NULL,
    "role" "Role",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "can_edit_material" BOOLEAN NOT NULL DEFAULT false,
    "can_edit_cost" BOOLEAN NOT NULL DEFAULT false,
    "can_adjust_stock" BOOLEAN NOT NULL DEFAULT false,
    "can_edit_recipe" BOOLEAN NOT NULL DEFAULT false,
    "can_view_cost" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "base_unit" VARCHAR(50),
    "conversion_factor" DECIMAL(10,4),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_materials" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT,
    "name" VARCHAR(150) NOT NULL,
    "category" VARCHAR(100),
    "unit_id" TEXT,
    "cost_per_unit" DECIMAL(10,2),
    "min_stock_level" DECIMAL(10,2),
    "current_stock" DECIMAL(10,2) DEFAULT 0,
    "supplier_name" VARCHAR(150),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raw_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT,
    "name" VARCHAR(150) NOT NULL,
    "selling_price" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" TEXT NOT NULL,
    "product_id" TEXT,
    "version" INTEGER DEFAULT 1,
    "is_locked" BOOLEAN DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_ingredients" (
    "id" TEXT NOT NULL,
    "recipe_id" TEXT,
    "raw_material_id" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_id" TEXT,
    "yield_loss_percent" DECIMAL(5,2) DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_logs" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT,
    "raw_material_id" TEXT,
    "change_quantity" DECIMAL(10,2) NOT NULL,
    "unit_id" TEXT,
    "change_type" "ChangeType",
    "reason" TEXT,
    "reference_id" UUID,
    "performed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_alerts" (
    "id" TEXT NOT NULL,
    "raw_material_id" TEXT,
    "alert_type" "AlertType",
    "current_value" DECIMAL(10,2),
    "threshold" DECIMAL(10,2),
    "status" "AlertStatus",
    "acknowledged_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "outlets" ADD CONSTRAINT "outlets_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_materials" ADD CONSTRAINT "raw_materials_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_materials" ADD CONSTRAINT "raw_materials_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_materials" ADD CONSTRAINT "raw_materials_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_raw_material_id_fkey" FOREIGN KEY ("raw_material_id") REFERENCES "raw_materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_logs" ADD CONSTRAINT "stock_logs_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_logs" ADD CONSTRAINT "stock_logs_raw_material_id_fkey" FOREIGN KEY ("raw_material_id") REFERENCES "raw_materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_logs" ADD CONSTRAINT "stock_logs_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_logs" ADD CONSTRAINT "stock_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_alerts" ADD CONSTRAINT "inventory_alerts_raw_material_id_fkey" FOREIGN KEY ("raw_material_id") REFERENCES "raw_materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_alerts" ADD CONSTRAINT "inventory_alerts_acknowledged_by_fkey" FOREIGN KEY ("acknowledged_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
