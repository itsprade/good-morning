/*
  Warnings:

  - You are about to drop the column `summaryText` on the `DailySummary` table. All the data in the column will be lost.
  - Added the required column `boldPart` to the `DailySummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lightPart` to the `DailySummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tasksCount` to the `DailySummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailySummary" DROP COLUMN "summaryText",
ADD COLUMN     "boldPart" TEXT NOT NULL,
ADD COLUMN     "lightPart" TEXT NOT NULL,
ADD COLUMN     "tasksCount" INTEGER NOT NULL;
