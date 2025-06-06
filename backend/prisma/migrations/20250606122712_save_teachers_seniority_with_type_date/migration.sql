/*
  Warnings:

  - The `fictitiousSeniority` column on the `teacher` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `bostonSeniority` column on the `teacher` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE `teacher` DROP COLUMN `fictitiousSeniority`,
    ADD COLUMN `fictitiousSeniority` DATETIME(3) NULL,
    DROP COLUMN `bostonSeniority`,
    ADD COLUMN `bostonSeniority` DATETIME(3) NULL;
