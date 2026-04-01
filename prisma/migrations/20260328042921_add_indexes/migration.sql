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

-- CreateIndex
CREATE INDEX `bumbu_deleted_at_idx` ON `bumbu`(`deleted_at`);

-- CreateIndex
CREATE INDEX `expenses_expense_date_idx` ON `expenses`(`expense_date`);

-- CreateIndex
CREATE INDEX `expenses_deleted_at_idx` ON `expenses`(`deleted_at`);

-- CreateIndex
CREATE INDEX `finance_transactions_transaction_date_idx` ON `finance_transactions`(`transaction_date`);

-- CreateIndex
CREATE INDEX `finance_transactions_type_idx` ON `finance_transactions`(`type`);

-- CreateIndex
CREATE INDEX `finance_transactions_wallet_idx` ON `finance_transactions`(`wallet`);

-- CreateIndex
CREATE INDEX `finance_transactions_deleted_at_idx` ON `finance_transactions`(`deleted_at`);

-- CreateIndex
CREATE INDEX `members_deleted_at_idx` ON `members`(`deleted_at`);

-- CreateIndex
CREATE INDEX `menu_sizes_deleted_at_idx` ON `menu_sizes`(`deleted_at`);

-- CreateIndex
CREATE INDEX `orders_created_at_idx` ON `orders`(`created_at`);

-- CreateIndex
CREATE INDEX `orders_payment_method_idx` ON `orders`(`payment_method`);

-- CreateIndex
CREATE INDEX `orders_deleted_at_idx` ON `orders`(`deleted_at`);

-- CreateIndex
CREATE INDEX `promos_deleted_at_idx` ON `promos`(`deleted_at`);

-- CreateIndex
CREATE INDEX `staff_expenses_expense_date_idx` ON `staff_expenses`(`expense_date`);

-- CreateIndex
CREATE INDEX `staff_expenses_deleted_at_idx` ON `staff_expenses`(`deleted_at`);

-- CreateIndex
CREATE INDEX `stock_entries_entry_date_idx` ON `stock_entries`(`entry_date`);

-- CreateIndex
CREATE INDEX `stock_entries_deleted_at_idx` ON `stock_entries`(`deleted_at`);

-- CreateIndex
CREATE INDEX `suppliers_deleted_at_idx` ON `suppliers`(`deleted_at`);

-- CreateIndex
CREATE INDEX `toppings_deleted_at_idx` ON `toppings`(`deleted_at`);

-- RenameIndex
ALTER TABLE `order_items` RENAME INDEX `order_items_order_id_fkey` TO `order_items_order_id_idx`;

-- RenameIndex
ALTER TABLE `orders` RENAME INDEX `orders_member_id_fkey` TO `orders_member_id_idx`;

-- RenameIndex
ALTER TABLE `orders` RENAME INDEX `orders_staff_id_fkey` TO `orders_staff_id_idx`;

-- RenameIndex
ALTER TABLE `staff_expenses` RENAME INDEX `staff_expenses_staff_id_fkey` TO `staff_expenses_staff_id_idx`;
