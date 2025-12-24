-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "country" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isSetupComplete" BOOLEAN NOT NULL DEFAULT false,
    "isVip" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieWatchlist" (
    "id" SERIAL NOT NULL,
    "movieTitle" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "MovieWatchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeriesWatchlist" (
    "id" SERIAL NOT NULL,
    "seriesTitle" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "SeriesWatchlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieWatchlist" ADD CONSTRAINT "MovieWatchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesWatchlist" ADD CONSTRAINT "SeriesWatchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
