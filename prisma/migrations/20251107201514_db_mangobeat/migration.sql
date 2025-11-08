-- CreateEnum
CREATE TYPE "TrackStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('AUDIO_GENERATION', 'IMAGE_GENERATION', 'TREND_ANALYSIS', 'TIKTOK_UPLOAD');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "genre" TEXT,
    "tags" TEXT[],
    "duration" INTEGER,
    "status" "TrackStatus" NOT NULL DEFAULT 'PROCESSING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "userId" TEXT,
    "trackId" TEXT,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trends" (
    "id" TEXT NOT NULL,
    "hashtag" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" BIGINT NOT NULL DEFAULT 0,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trends_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "trends_hashtag_key" ON "trends"("hashtag");

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
