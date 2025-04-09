/*
  Warnings:

  - You are about to drop the column `courseId` on the `class` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `class` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `class` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `courseenrollment` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `exam` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfWeek` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the `course` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[groupId]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupId` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupId` to the `CourseEnrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupId` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `days` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupId` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `class` DROP FOREIGN KEY `Class_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `course` DROP FOREIGN KEY `Course_teacherId_fkey`;

-- DropForeignKey
ALTER TABLE `courseenrollment` DROP FOREIGN KEY `CourseEnrollment_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `exam` DROP FOREIGN KEY `Exam_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `schedule` DROP FOREIGN KEY `Schedule_classId_fkey`;

-- DropIndex
DROP INDEX `Class_courseId_idx` ON `class`;

-- DropIndex
DROP INDEX `CourseEnrollment_courseId_idx` ON `courseenrollment`;

-- DropIndex
DROP INDEX `Exam_courseId_idx` ON `exam`;

-- DropIndex
DROP INDEX `Schedule_classId_idx` ON `schedule`;

-- AlterTable
ALTER TABLE `class` DROP COLUMN `courseId`,
    DROP COLUMN `description`,
    DROP COLUMN `name`,
    ADD COLUMN `date` DATE NOT NULL,
    ADD COLUMN `endTime` TIME NOT NULL,
    ADD COLUMN `groupId` INTEGER NOT NULL,
    ADD COLUMN `startTime` TIME NOT NULL;

-- AlterTable
ALTER TABLE `courseenrollment` DROP COLUMN `courseId`,
    ADD COLUMN `groupId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `exam` DROP COLUMN `courseId`,
    ADD COLUMN `groupId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `schedule` DROP COLUMN `classId`,
    DROP COLUMN `dayOfWeek`,
    DROP COLUMN `endTime`,
    DROP COLUMN `startTime`,
    ADD COLUMN `days` JSON NOT NULL,
    ADD COLUMN `groupId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `course`;

-- CreateTable
CREATE TABLE `GroupStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GroupStatus_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StudentStatus_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Modality` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Modality_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `teacherId` INTEGER NOT NULL,
    `languageId` INTEGER NOT NULL,
    `moduleId` INTEGER NOT NULL,
    `modalityId` INTEGER NOT NULL,
    `statusId` INTEGER NOT NULL,
    `startDate` DATE NOT NULL,
    `endDate` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Group_teacherId_idx`(`teacherId`),
    INDEX `Group_languageId_idx`(`languageId`),
    INDEX `Group_moduleId_idx`(`moduleId`),
    INDEX `Group_modalityId_idx`(`modalityId`),
    INDEX `Group_statusId_idx`(`statusId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupStudent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `groupId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `statusId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GroupStudent_groupId_idx`(`groupId`),
    INDEX `GroupStudent_studentId_idx`(`studentId`),
    INDEX `GroupStudent_statusId_idx`(`statusId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Class_groupId_idx` ON `Class`(`groupId`);

-- CreateIndex
CREATE INDEX `CourseEnrollment_groupId_idx` ON `CourseEnrollment`(`groupId`);

-- CreateIndex
CREATE INDEX `Exam_groupId_idx` ON `Exam`(`groupId`);

-- CreateIndex
CREATE UNIQUE INDEX `Schedule_groupId_key` ON `Schedule`(`groupId`);

-- CreateIndex
CREATE INDEX `Schedule_groupId_idx` ON `Schedule`(`groupId`);

-- AddForeignKey
ALTER TABLE `Group` ADD CONSTRAINT `Group_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Group` ADD CONSTRAINT `Group_languageId_fkey` FOREIGN KEY (`languageId`) REFERENCES `languages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Group` ADD CONSTRAINT `Group_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `modules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Group` ADD CONSTRAINT `Group_modalityId_fkey` FOREIGN KEY (`modalityId`) REFERENCES `Modality`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Group` ADD CONSTRAINT `Group_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `GroupStatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GroupStudent` ADD CONSTRAINT `GroupStudent_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GroupStudent` ADD CONSTRAINT `GroupStudent_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GroupStudent` ADD CONSTRAINT `GroupStudent_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `StudentStatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Class` ADD CONSTRAINT `Class_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exam` ADD CONSTRAINT `Exam_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseEnrollment` ADD CONSTRAINT `CourseEnrollment_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
