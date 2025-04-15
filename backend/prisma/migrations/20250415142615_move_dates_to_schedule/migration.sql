/*
  Warnings:

  - You are about to drop the column `endDate` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `group` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `group` DROP COLUMN `endDate`,
    DROP COLUMN `startDate`;

-- AlterTable
ALTER TABLE `schedule` ADD COLUMN `endDate` DATE NOT NULL,
    ADD COLUMN `startDate` DATE NOT NULL;
