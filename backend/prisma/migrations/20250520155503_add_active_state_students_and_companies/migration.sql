-- AlterTable
ALTER TABLE `company` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `students` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true;
