/*
  Warnings:

  - You are about to alter the column `deleted_at` on the `bumbu` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `members` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `menu_sizes` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `start_date` on the `promos` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `end_date` on the `promos` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `promos` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `toppings` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `bumbu` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `members` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `menu_sizes` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `orders` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `promos` MODIFY `start_date` DATETIME NULL,
    MODIFY `end_date` DATETIME NULL,
    MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `toppings` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `deleted_at` DATETIME NULL;

-- CreateTable
CREATE TABLE `stock_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_type` ENUM('TOPPING', 'BUMBU', 'OTHER') NOT NULL,
    `item_name` VARCHAR(100) NOT NULL,
    `topping_id` INTEGER NULL,
    `bumbu_id` INTEGER NULL,
    `quantity` DOUBLE NOT NULL,
    `unit` VARCHAR(30) NOT NULL,
    `purchase_price` INTEGER NOT NULL,
    `total_cost` INTEGER NOT NULL,
    `supplier` VARCHAR(100) NULL,
    `notes` TEXT NULL,
    `entry_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expense_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME NULL,

    UNIQUE INDEX `expense_categories_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
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
CREATE TABLE `sop_tasks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` ENUM('OPENING', 'OPERATIONAL', 'CLOSING') NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `description` VARCHAR(500) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sop_checklists` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staff_id` INTEGER NOT NULL,
    `shift_date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `sop_checklists_staff_id_shift_date_key`(`staff_id`, `shift_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sop_checklist_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `checklist_id` INTEGER NOT NULL,
    `task_id` INTEGER NOT NULL,
    `is_checked` BOOLEAN NOT NULL DEFAULT false,
    `checked_at` DATETIME NULL,
    `notes` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quality_checks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staff_id` INTEGER NOT NULL,
    `check_date` DATE NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quality_check_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quality_check_id` INTEGER NOT NULL,
    `topping_id` INTEGER NOT NULL,
    `status` ENUM('GOOD', 'WARNING', 'BAD') NOT NULL DEFAULT 'GOOD',
    `notes` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stock_entries` ADD CONSTRAINT `stock_entries_topping_id_fkey` FOREIGN KEY (`topping_id`) REFERENCES `toppings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_entries` ADD CONSTRAINT `stock_entries_bumbu_id_fkey` FOREIGN KEY (`bumbu_id`) REFERENCES `bumbu`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sop_checklists` ADD CONSTRAINT `sop_checklists_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sop_checklist_items` ADD CONSTRAINT `sop_checklist_items_checklist_id_fkey` FOREIGN KEY (`checklist_id`) REFERENCES `sop_checklists`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sop_checklist_items` ADD CONSTRAINT `sop_checklist_items_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `sop_tasks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quality_checks` ADD CONSTRAINT `quality_checks_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quality_check_items` ADD CONSTRAINT `quality_check_items_quality_check_id_fkey` FOREIGN KEY (`quality_check_id`) REFERENCES `quality_checks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quality_check_items` ADD CONSTRAINT `quality_check_items_topping_id_fkey` FOREIGN KEY (`topping_id`) REFERENCES `toppings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
