-- AlterTable
ALTER TABLE "users" ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "profile_image" TEXT;

-- CreateTable
CREATE TABLE "activation_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "used_by" TEXT,
    "used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activation_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activation_codes_code_key" ON "activation_codes"("code");

-- CreateIndex
CREATE INDEX "activation_codes_code_idx" ON "activation_codes"("code");

-- CreateIndex
CREATE INDEX "activation_codes_is_used_idx" ON "activation_codes"("is_used");
