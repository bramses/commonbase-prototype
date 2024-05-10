-- CreateTable
CREATE TABLE "schema" (
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "embedding" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schema_pkey" PRIMARY KEY ("id")
);
