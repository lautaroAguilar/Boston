/*
  Warnings:

  - You are about to drop the column `active` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `groupstatus` ADD COLUMN `isDefault` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `students` DROP COLUMN `active`;

-- AlterTable
ALTER TABLE `studentstatus` ADD COLUMN `isDefault` BOOLEAN NOT NULL DEFAULT false;
