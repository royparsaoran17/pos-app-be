/*
  Warnings:

  - You are about to alter the column `deleted_at` on the `bumbu` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `expense_categories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `expenses` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `members` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `menu_sizes` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `start_date` on the `promos` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `end_date` on the `promos` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `promos` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `checked_at` on the `sop_checklist_items` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `stock_entries` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `toppings` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `bumbu` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `expense_categories` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `expenses` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `members` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `menu_sizes` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `queue_number` INTEGER NOT NULL DEFAULT 0,
    MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `promos` MODIFY `start_date` DATETIME NULL,
    MODIFY `end_date` DATETIME NULL,
    MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `sop_checklist_items` MODIFY `checked_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `stock_entries` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `toppings` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `deleted_at` DATETIME NULL;

-- CreateTable
CREATE TABLE `stock_opname` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staff_id` INTEGER NOT NULL,
    `opname_date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `stock_opname_staff_id_opname_date_key`(`staff_id`, `opname_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_opname_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opname_id` INTEGER NOT NULL,
    `topping_id` INTEGER NOT NULL,
    `weight_kg` DOUBLE NOT NULL,
    `notes` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff_expenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staff_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `amount` INTEGER NOT NULL,
    `expense_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff_attendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staff_id` INTEGER NOT NULL,
    `login_date` DATE NOT NULL,
    `login_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip_address` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `staff_attendance_staff_id_login_date_key`(`staff_id`, `login_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shifts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staff_id` INTEGER NOT NULL,
    `shift_date` DATE NOT NULL,
    `open_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `close_time` DATETIME(3) NULL,
    `opening_cash` INTEGER NOT NULL DEFAULT 0,
    `closing_cash` INTEGER NULL,
    `expected_cash` INTEGER NULL,
    `cash_difference` INTEGER NULL,
    `total_orders` INTEGER NOT NULL DEFAULT 0,
    `total_revenue` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `address` TEXT NULL,
    `email` VARCHAR(100) NULL,
    `contact_person` VARCHAR(100) NULL,
    `notes` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tables` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `table_number` VARCHAR(20) NOT NULL,
    `capacity` INTEGER NOT NULL DEFAULT 4,
    `status` ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING') NOT NULL DEFAULT 'AVAILABLE',
    `notes` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME NULL,

    UNIQUE INDEX `tables_table_number_key`(`table_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stock_opname` ADD CONSTRAINT `stock_opname_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_opname_items` ADD CONSTRAINT `stock_opname_items_opname_id_fkey` FOREIGN KEY (`opname_id`) REFERENCES `stock_opname`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_opname_items` ADD CONSTRAINT `stock_opname_items_topping_id_fkey` FOREIGN KEY (`topping_id`) REFERENCES `toppings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_expenses` ADD CONSTRAINT `staff_expenses_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_expenses` ADD CONSTRAINT `staff_expenses_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_attendance` ADD CONSTRAINT `staff_attendance_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shifts` ADD CONSTRAINT `shifts_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
