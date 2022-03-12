/*
  Warnings:

  - The primary key for the `Url` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Url` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Url" DROP CONSTRAINT "Url_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Url_pkey" PRIMARY KEY ("slug");
