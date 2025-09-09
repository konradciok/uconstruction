-- CreateTable
CREATE TABLE "public"."Product" (
    "id" SERIAL NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "vendor" TEXT,
    "productType" TEXT,
    "status" TEXT,
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "shopifyUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductOption" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Variant" (
    "id" SERIAL NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "title" TEXT,
    "sku" TEXT,
    "priceAmount" DECIMAL(18,6),
    "priceCurrency" TEXT,
    "compareAtPriceAmount" DECIMAL(18,6),
    "compareAtPriceCurrency" TEXT,
    "position" INTEGER,
    "barcode" TEXT,
    "inventoryPolicy" TEXT,
    "inventoryItemId" TEXT,
    "requiresShipping" BOOLEAN,
    "taxable" BOOLEAN,
    "weight" DOUBLE PRECISION,
    "weightUnit" TEXT,
    "shopifyUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductMedia" (
    "id" SERIAL NOT NULL,
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

    CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Collection" (
    "id" SERIAL NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "sortOrder" TEXT,
    "deletedAt" TIMESTAMP(3),
    "shopifyUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductCollection" (
    "productId" INTEGER NOT NULL,
    "collectionId" INTEGER NOT NULL,

    CONSTRAINT "ProductCollection_pkey" PRIMARY KEY ("productId","collectionId")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductTag" (
    "productId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "ProductTag_pkey" PRIMARY KEY ("productId","tagId")
);

-- CreateTable
CREATE TABLE "public"."InventoryLevel" (
    "inventoryItemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "available" INTEGER NOT NULL,

    CONSTRAINT "InventoryLevel_pkey" PRIMARY KEY ("inventoryItemId","locationId")
);

-- CreateTable
CREATE TABLE "public"."SyncState" (
    "id" SERIAL NOT NULL,
    "resourceType" TEXT NOT NULL,
    "lastCursor" TEXT,
    "lastSyncTime" TIMESTAMP(3),

    CONSTRAINT "SyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Metafield" (
    "id" SERIAL NOT NULL,
    "ownerType" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT,
    "value" TEXT,
    "raw" JSONB,

    CONSTRAINT "Metafield_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_shopifyId_key" ON "public"."Product"("shopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_handle_key" ON "public"."Product"("handle");

-- CreateIndex
CREATE INDEX "Product_shopifyUpdatedAt_idx" ON "public"."Product"("shopifyUpdatedAt");

-- CreateIndex
CREATE INDEX "ProductOption_productId_position_idx" ON "public"."ProductOption"("productId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_shopifyId_key" ON "public"."Variant"("shopifyId");

-- CreateIndex
CREATE INDEX "Variant_productId_idx" ON "public"."Variant"("productId");

-- CreateIndex
CREATE INDEX "Variant_sku_idx" ON "public"."Variant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductMedia_shopifyId_key" ON "public"."ProductMedia"("shopifyId");

-- CreateIndex
CREATE INDEX "ProductMedia_productId_position_idx" ON "public"."ProductMedia"("productId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_shopifyId_key" ON "public"."Collection"("shopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_handle_key" ON "public"."Collection"("handle");

-- CreateIndex
CREATE INDEX "ProductCollection_collectionId_idx" ON "public"."ProductCollection"("collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "public"."Tag"("name");

-- CreateIndex
CREATE INDEX "ProductTag_tagId_idx" ON "public"."ProductTag"("tagId");

-- CreateIndex
CREATE INDEX "InventoryLevel_locationId_idx" ON "public"."InventoryLevel"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "SyncState_resourceType_key" ON "public"."SyncState"("resourceType");

-- CreateIndex
CREATE INDEX "Metafield_ownerType_ownerId_idx" ON "public"."Metafield"("ownerType", "ownerId");

-- CreateIndex
CREATE INDEX "Metafield_namespace_key_idx" ON "public"."Metafield"("namespace", "key");

-- AddForeignKey
ALTER TABLE "public"."ProductOption" ADD CONSTRAINT "ProductOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Variant" ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductMedia" ADD CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductCollection" ADD CONSTRAINT "ProductCollection_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductCollection" ADD CONSTRAINT "ProductCollection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductTag" ADD CONSTRAINT "ProductTag_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductTag" ADD CONSTRAINT "ProductTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
