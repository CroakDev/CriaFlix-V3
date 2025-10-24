'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import TmdbApi from '@/lib/TmdbApi'

// Definindo a interface MediaItem, caso ela não esteja disponível globalmente
interface MediaItem {
    id: number;
    title?: string;
    name?: string;
    poster_path: string;
    release_date?: string;
    overview?: string;
    media_type?: string;
    first_air_date?: string;
}

// Adicionando props para movieId e mediaType
interface RecommendedProps {
    movieId: number;
    mediaType: string;
}

export default function Recommended({ movieId, mediaType }: RecommendedProps) {
    const [recommendedVideos, setRecommendedVideos] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendedVideos = async () => {
            try {
                const recommended = await TmdbApi.getSimilarVideos(movieId, mediaType); 
                setRecommendedVideos(recommended.slice(0, 9) || []); 
                setLoading(false);
            } catch (error) {
                console.error("Error fetching recommended videos:", error);
                setLoading(false);
            }
        };

        fetchRecommendedVideos();
    }, [mediaType, movieId]);

    return (
        <div className="lg:col-span-1">
            <h3 className="text-xl font-semibold mb-4">Recommended Videos</h3>

            {loading ? (
                <div>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                        <>
                            <Skeleton key={index} className="w-1/2 h-24 mb-4" />
                            <Skeleton key={index} className="w-1/1 h-2 mb-4" />
                            <Skeleton key={index} className="w-1/2 h-2 mb-4" />
                        </>
                    ))}
                </div>
            ) : (
                recommendedVideos.map((video) => (

                    <Link href={`/media/${video.id}?mediaType=${mediaType ?? 'movie'}`} key={video.id} className="block group">
                        <div className="flex space-x-2 mb-4 cursor-pointer hover:bg-secondary rounded-lg transition-colors">
                            <div className="flex-shrink-0 w-40 h-24 bg-gray-200 rounded-lg overflow-hidden">
                                <Image

                                    src={video.poster_path ? `https://image.tmdb.org/t/p/w500${video.poster_path}` : 'https://iseb3.com.br/assets/camaleon_cms/image-not-found-4a963b95bf081c3ea02923dceaeb3f8085e1a654fc54840aac61a57a60903fef.png'}
                                    alt={"a"}
                                    className="w-full h-full object-cover"
                                    width={160}
                                    height={96}
                                />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">{video.title || video.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    {video.overview
                                        ? (video.overview.length > 50
                                            ? `${video.overview.slice(0, 50)}...`
                                            : video.overview)
                                        : "No overview available"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {(video.release_date || video.first_air_date)?.substring(0, 4)} - {mediaType}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))
            )}
        </div>
    );
}
