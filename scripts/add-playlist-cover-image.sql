-- Add coverImage column to Playlist table
ALTER TABLE "Playlist" ADD COLUMN IF NOT EXISTS "coverImage" TEXT;
