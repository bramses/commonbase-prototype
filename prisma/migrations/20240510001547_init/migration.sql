/*
  Warnings:

  - You are about to alter the column `embedding` on the `schema` table. The data in that column could be lost. The data in that column will be cast from `JsonB` to `Unsupported("vector(1536)")`.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "schema"
ALTER COLUMN "embedding"
TYPE vector(1536)
USING (embedding::text::vector(1536));
