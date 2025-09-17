-- CreateTable
CREATE TABLE "Rate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Rate_kind_code_idx" ON "Rate"("kind", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Rate_kind_code_key" ON "Rate"("kind", "code");
