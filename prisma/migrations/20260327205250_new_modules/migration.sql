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
  - You are about to alter the column `deleted_at` on the `staff_expenses` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `stock_entries` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `suppliers` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `tables` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
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
ALTER TABLE `menu_sizes` ADD COLUMN `hpp` INTEGER NOT NULL DEFAULT 0,
    MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `orders` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `promos` MODIFY `start_date` DATETIME NULL,
    MODIFY `end_date` DATETIME NULL,
    MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `sop_checklist_items` MODIFY `checked_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `staff_expenses` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `stock_entries` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `suppliers` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `tables` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `toppings` ADD COLUMN `gram_per_portion` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `deleted_at` DATETIME NULL;

-- CreateTable
CREATE TABLE `stock_packaging` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staff_id` INTEGER NOT NULL,
    `menu_size_key` VARCHAR(50) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `packaging_date` DATE NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stock_packaging` ADD CONSTRAINT `stock_packaging_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
