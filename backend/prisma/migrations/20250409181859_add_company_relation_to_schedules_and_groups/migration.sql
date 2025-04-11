/*
  Warnings:

  - Added the required column `companyId` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `group` ADD COLUMN `companyId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `schedule` ADD COLUMN `companyId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `Group_companyId_idx` ON `Group`(`companyId`);

-- CreateIndex
CREATE INDEX `Schedule_companyId_idx` ON `Schedule`(`companyId`);

-- AddForeignKey
ALTER TABLE `company_contact` ADD CONSTRAINT `company_contact_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cost_center` ADD CONSTRAINT `cost_center_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sector` ADD CONSTRAINT `sector_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Group` ADD CONSTRAINT `Group_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
