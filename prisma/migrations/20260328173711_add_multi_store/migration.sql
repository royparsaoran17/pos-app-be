-- Step 1: Create stores table
CREATE TABLE `stores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `address` TEXT NULL,
    `phone` VARCHAR(20) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME NULL,

    UNIQUE INDEX `stores_code_key`(`code`),
    INDEX `stores_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 2: Insert default store
INSERT INTO `stores` (`name`, `code`) VALUES ('Oh My Tongue', 'OMT');

-- Step 3: Add store_id columns as NULLABLE first
ALTER TABLE `users` ADD COLUMN `store_id` INTEGER NULL;
ALTER TABLE `orders` ADD COLUMN `store_id` INTEGER NULL;
ALTER TABLE `shifts` ADD COLUMN `store_id` INTEGER NULL;
ALTER TABLE `stock_entries` ADD COLUMN `store_id` INTEGER NULL;
ALTER TABLE `expenses` ADD COLUMN `store_id` INTEGER NULL;
ALTER TABLE `staff_expenses` ADD COLUMN `store_id` INTEGER NULL;
ALTER TABLE `finance_transactions` ADD COLUMN `store_id` INTEGER NULL;
ALTER TABLE `stock_opname` ADD COLUMN `store_id` INTEGER NULL;
ALTER TABLE `sop_checklists` ADD COLUMN `store_id` INTEGER NULL;
ALTER TABLE `quality_checks` ADD COLUMN `store_id` INTEGER NULL;
ALTER TABLE `staff_attendance` ADD COLUMN `store_id` INTEGER NULL;
ALTER TABLE `stock_packaging` ADD COLUMN `store_id` INTEGER NULL;

-- Step 4: Backfill all existing data with default store (id=1)
UPDATE `users` SET `store_id` = 1 WHERE `role` = 'STAFF';
UPDATE `orders` SET `store_id` = 1;
UPDATE `shifts` SET `store_id` = 1;
UPDATE `stock_entries` SET `store_id` = 1;
UPDATE `expenses` SET `store_id` = 1;
UPDATE `staff_expenses` SET `store_id` = 1;
UPDATE `finance_transactions` SET `store_id` = 1;
UPDATE `stock_opname` SET `store_id` = 1;
UPDATE `sop_checklists` SET `store_id` = 1;
UPDATE `quality_checks` SET `store_id` = 1;
UPDATE `staff_attendance` SET `store_id` = 1;
UPDATE `stock_packaging` SET `store_id` = 1;

-- Step 5: Make store_id NOT NULL on all tables except users (superadmin has null)
ALTER TABLE `orders` MODIFY `store_id` INTEGER NOT NULL;
ALTER TABLE `shifts` MODIFY `store_id` INTEGER NOT NULL;
ALTER TABLE `stock_entries` MODIFY `store_id` INTEGER NOT NULL;
ALTER TABLE `expenses` MODIFY `store_id` INTEGER NOT NULL;
ALTER TABLE `staff_expenses` MODIFY `store_id` INTEGER NOT NULL;
ALTER TABLE `finance_transactions` MODIFY `store_id` INTEGER NOT NULL;
ALTER TABLE `stock_opname` MODIFY `store_id` INTEGER NOT NULL;
ALTER TABLE `sop_checklists` MODIFY `store_id` INTEGER NOT NULL;
ALTER TABLE `quality_checks` MODIFY `store_id` INTEGER NOT NULL;
ALTER TABLE `staff_attendance` MODIFY `store_id` INTEGER NOT NULL;
ALTER TABLE `stock_packaging` MODIFY `store_id` INTEGER NOT NULL;

-- Step 6: DateTime precision fixes
ALTER TABLE `bumbu` MODIFY `deleted_at` DATETIME NULL;
ALTER TABLE `expense_categories` MODIFY `deleted_at` DATETIME NULL;
ALTER TABLE `expenses` MODIFY `deleted_at` DATETIME NULL;
ALTER TABLE `finance_transactions` MODIFY `deleted_at` DATETIME NULL;
ALTER TABLE `members` MODIFY `deleted_at` DATETIME NULL;
ALTER TABLE `menu_sizes` MODIFY `deleted_at` DATETIME NULL;
ALTER TABLE `orders` MODIFY `deleted_at` DATETIME NULL;
ALTER TABLE `promos` MODIFY `start_date` DATETIME NULL, MODIFY `end_date` DATETIME NULL, MODIFY `deleted_at` DATETIME NULL;
ALTER TABLE `sop_checklist_items` MODIFY `checked_at` DATETIME NULL;
ALTER TABLE `staff_expenses` MODIFY `deleted_at` DATETIME NULL;
ALTER TABLE `stock_entries` MODIFY `deleted_at` DATETIME NULL;
ALTER TABLE `suppliers` MODIFY `deleted_at` DATETIME NULL;
ALTER TABLE `toppings` MODIFY `deleted_at` DATETIME NULL;
ALTER TABLE `users` MODIFY `deleted_at` DATETIME NULL;

-- Step 7: Create indexes
CREATE INDEX `expenses_store_id_idx` ON `expenses`(`store_id`);
CREATE INDEX `finance_transactions_store_id_idx` ON `finance_transactions`(`store_id`);
CREATE INDEX `orders_store_id_idx` ON `orders`(`store_id`);
CREATE INDEX `quality_checks_store_id_idx` ON `quality_checks`(`store_id`);
CREATE INDEX `shifts_store_id_idx` ON `shifts`(`store_id`);
CREATE INDEX `sop_checklists_store_id_idx` ON `sop_checklists`(`store_id`);
CREATE INDEX `staff_attendance_store_id_idx` ON `staff_attendance`(`store_id`);
CREATE INDEX `staff_expenses_store_id_idx` ON `staff_expenses`(`store_id`);
CREATE INDEX `stock_entries_store_id_idx` ON `stock_entries`(`store_id`);
CREATE INDEX `stock_opname_store_id_idx` ON `stock_opname`(`store_id`);
CREATE INDEX `stock_packaging_store_id_idx` ON `stock_packaging`(`store_id`);
CREATE INDEX `users_store_id_idx` ON `users`(`store_id`);

-- Step 8: Add foreign keys
ALTER TABLE `users` ADD CONSTRAINT `users_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `orders` ADD CONSTRAINT `orders_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `stock_entries` ADD CONSTRAINT `stock_entries_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `sop_checklists` ADD CONSTRAINT `sop_checklists_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `quality_checks` ADD CONSTRAINT `quality_checks_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `stock_opname` ADD CONSTRAINT `stock_opname_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `staff_expenses` ADD CONSTRAINT `staff_expenses_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `staff_attendance` ADD CONSTRAINT `staff_attendance_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `shifts` ADD CONSTRAINT `shifts_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `stock_packaging` ADD CONSTRAINT `stock_packaging_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `finance_transactions` ADD CONSTRAINT `finance_transactions_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
