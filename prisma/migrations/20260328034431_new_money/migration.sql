/*
  Warnings:

  - You are about to alter the column `deleted_at` on the `bumbu` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `expense_categories` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `expenses` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deleted_at` on the `finance_transactions` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
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
ALTER TABLE `finance_transactions` MODIFY `deleted_at` DATETIME NULL;

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
ALTER TABLE `sop_checklist_items` MODIFY `checked_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `staff_expenses` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `stock_entries` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `suppliers` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `toppings` MODIFY `deleted_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `deleted_at` DATETIME NULL;
