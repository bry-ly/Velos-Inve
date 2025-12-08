-- CreateTable
CREATE TABLE "inventory_filter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_filter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_filter_userId_isDefault_idx" ON "inventory_filter"("userId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_filter_userId_name_key" ON "inventory_filter"("userId", "name");

-- AddForeignKey
ALTER TABLE "inventory_filter" ADD CONSTRAINT "inventory_filter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
