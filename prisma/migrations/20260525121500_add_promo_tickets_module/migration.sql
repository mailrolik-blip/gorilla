-- CreateEnum
CREATE TYPE "PromoTicketStatus" AS ENUM ('NEW', 'OPENED', 'WIN', 'LOSE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PromoSymbol" AS ENUM ('STICK', 'HELMET', 'PUCK', 'GOAL', 'TRIP', 'DISCOUNT', 'NO_WIN');

-- CreateTable
CREATE TABLE "PromoPrize" (
    "id" SERIAL NOT NULL,
    "symbol" "PromoSymbol" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoPrize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoTicket" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "campaignLabel" TEXT,
    "status" "PromoTicketStatus" NOT NULL DEFAULT 'NEW',
    "sealedSymbols" "PromoSymbol"[] NOT NULL,
    "symbols" "PromoSymbol"[] NOT NULL DEFAULT ARRAY[]::"PromoSymbol"[],
    "prizeId" INTEGER,
    "openedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoPrize_symbol_key" ON "PromoPrize"("symbol");

-- CreateIndex
CREATE INDEX "PromoPrize_isActive_idx" ON "PromoPrize"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PromoTicket_code_key" ON "PromoTicket"("code");

-- CreateIndex
CREATE INDEX "PromoTicket_userId_idx" ON "PromoTicket"("userId");

-- CreateIndex
CREATE INDEX "PromoTicket_status_idx" ON "PromoTicket"("status");

-- CreateIndex
CREATE INDEX "PromoTicket_expiresAt_idx" ON "PromoTicket"("expiresAt");

-- CreateIndex
CREATE INDEX "PromoTicket_prizeId_idx" ON "PromoTicket"("prizeId");

-- AddForeignKey
ALTER TABLE "PromoTicket" ADD CONSTRAINT "PromoTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoTicket" ADD CONSTRAINT "PromoTicket_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "PromoPrize"("id") ON DELETE SET NULL ON UPDATE CASCADE;
