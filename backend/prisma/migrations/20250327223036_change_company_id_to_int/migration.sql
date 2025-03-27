/*
  Warnings:

  - The primary key for the `company` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `company` table. The data in that column could be lost. The data in that column will be cast from `Binary(16)` to `Int`.
  - You are about to alter the column `company_id` on the `company_contact` table. The data in that column could be lost. The data in that column will be cast from `Binary(16)` to `Int`.
  - You are about to alter the column `company_id` on the `cost_center` table. The data in that column could be lost. The data in that column will be cast from `Binary(16)` to `Int`.
  - You are about to alter the column `company_id` on the `sector` table. The data in that column could be lost. The data in that column will be cast from `Binary(16)` to `Int`.
  - You are about to alter the column `company_id` on the `students` table. The data in that column could be lost. The data in that column will be cast from `Binary(16)` to `Int`.

*/
-- AlterTable
ALTER TABLE `company` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `company_contact` MODIFY `company_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `cost_center` MODIFY `company_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `sector` MODIFY `company_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `students` MODIFY `company_id` INTEGER NOT NULL;
