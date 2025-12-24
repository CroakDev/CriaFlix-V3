/*
  Warnings:

  - Added the required column `updatedAt` to the `Playlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Playlist" DROP CONSTRAINT "Playlist_userId_fkey";

-- AlterTable
ALTER TABLE "MovieWatchlist" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "movieId" INTEGER,
ADD COLUMN     "posterPath" TEXT;

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SeriesWatchlist" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "posterPath" TEXT,
ADD COLUMN     "seriesId" INTEGER;

-- CreateTable
CREATE TABLE "PlaylistItem" (
    "id" SERIAL NOT NULL,
    "playlistId" INTEGER NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL,
    "mediaTitle" TEXT NOT NULL,
    "posterPath" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieFavorite" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "movieTitle" TEXT NOT NULL,
    "posterPath" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovieFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeriesFavorite" (
    "id" SERIAL NOT NULL,
    "seriesId" INTEGER NOT NULL,
    "seriesTitle" TEXT NOT NULL,
    "posterPath" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeriesFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieWatchLater" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "movieTitle" TEXT NOT NULL,
    "posterPath" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovieWatchLater_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeriesWatchLater" (
    "id" SERIAL NOT NULL,
    "seriesId" INTEGER NOT NULL,
    "seriesTitle" TEXT NOT NULL,
    "posterPath" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeriesWatchLater_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistItem_playlistId_mediaId_mediaType_key" ON "PlaylistItem"("playlistId", "mediaId", "mediaType");

-- CreateIndex
CREATE UNIQUE INDEX "MovieFavorite_userId_movieId_key" ON "MovieFavorite"("userId", "movieId");

-- CreateIndex
CREATE UNIQUE INDEX "SeriesFavorite_userId_seriesId_key" ON "SeriesFavorite"("userId", "seriesId");

-- CreateIndex
CREATE UNIQUE INDEX "MovieWatchLater_userId_movieId_key" ON "MovieWatchLater"("userId", "movieId");

-- CreateIndex
CREATE UNIQUE INDEX "SeriesWatchLater_userId_seriesId_key" ON "SeriesWatchLater"("userId", "seriesId");

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistItem" ADD CONSTRAINT "PlaylistItem_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieFavorite" ADD CONSTRAINT "MovieFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesFavorite" ADD CONSTRAINT "SeriesFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieWatchLater" ADD CONSTRAINT "MovieWatchLater_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesWatchLater" ADD CONSTRAINT "SeriesWatchLater_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
