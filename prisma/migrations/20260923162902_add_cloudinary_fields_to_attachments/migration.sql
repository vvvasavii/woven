/*
  Warnings:

  - Added the required column `cloudinaryPublicId` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cloudinaryResourceType` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "cloudinaryPublicId" TEXT NOT NULL,
ADD COLUMN     "cloudinaryResourceType" TEXT NOT NULL;
