-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopifyId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "vendor" TEXT,
    "productType" TEXT,
    "status" TEXT,
    "publishedAt" DATETIME,
    "deletedAt" DATETIME,
    "shopifyUpdatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductOption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "ProductOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopifyId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "title" TEXT,
    "sku" TEXT,
    "priceAmount" DECIMAL,
    "priceCurrency" TEXT,
    "compareAtPriceAmount" DECIMAL,
    "compareAtPriceCurrency" TEXT,
    "position" INTEGER,
    "barcode" TEXT,
    "inventoryPolicy" TEXT,
    "inventoryItemId" TEXT,
    "requiresShipping" BOOLEAN,
    "taxable" BOOLEAN,
    "weight" REAL,
    "weightUnit" TEXT,
    "shopifyUpdatedAt" DATETIME,
    CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductMedia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopifyId" TEXT,
    "productId" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "previewImage" JSONB,
    "altText" TEXT,
    "position" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "checksum" TEXT,
    CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopifyId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "sortOrder" TEXT,
    "deletedAt" DATETIME,
    "shopifyUpdatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductCollection" (
    "productId" INTEGER NOT NULL,
    "collectionId" INTEGER NOT NULL,

    PRIMARY KEY ("productId", "collectionId"),
    CONSTRAINT "ProductCollection_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductCollection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ProductTag" (
    "productId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    PRIMARY KEY ("productId", "tagId"),
    CONSTRAINT "ProductTag_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryLevel" (
    "inventoryItemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "available" INTEGER NOT NULL,

    PRIMARY KEY ("inventoryItemId", "locationId")
);

-- CreateTable
CREATE TABLE "SyncState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "resourceType" TEXT NOT NULL,
    "lastCursor" TEXT,
    "lastSyncTime" DATETIME
);

-- CreateTable
CREATE TABLE "Metafield" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerType" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT,
    "value" TEXT,
    "raw" JSONB
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_shopifyId_key" ON "Product"("shopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_handle_key" ON "Product"("handle");

-- CreateIndex
CREATE INDEX "Product_shopifyUpdatedAt_idx" ON "Product"("shopifyUpdatedAt");

-- CreateIndex
CREATE INDEX "ProductOption_productId_position_idx" ON "ProductOption"("productId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_shopifyId_key" ON "Variant"("shopifyId");

-- CreateIndex
CREATE INDEX "Variant_productId_idx" ON "Variant"("productId");

-- CreateIndex
CREATE INDEX "Variant_sku_idx" ON "Variant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductMedia_shopifyId_key" ON "ProductMedia"("shopifyId");

-- CreateIndex
CREATE INDEX "ProductMedia_productId_position_idx" ON "ProductMedia"("productId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_shopifyId_key" ON "Collection"("shopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_handle_key" ON "Collection"("handle");

-- CreateIndex
CREATE INDEX "ProductCollection_collectionId_idx" ON "ProductCollection"("collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "ProductTag_tagId_idx" ON "ProductTag"("tagId");

-- CreateIndex
CREATE INDEX "InventoryLevel_locationId_idx" ON "InventoryLevel"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "SyncState_resourceType_key" ON "SyncState"("resourceType");

-- CreateIndex
CREATE INDEX "Metafield_ownerType_ownerId_idx" ON "Metafield"("ownerType", "ownerId");

-- CreateIndex
CREATE INDEX "Metafield_namespace_key_idx" ON "Metafield"("namespace", "key");
