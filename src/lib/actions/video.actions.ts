"use server";

import { videos, users } from "@/lib/data";
import type { Video, User, VideoCategory } from "@/lib/types";

// Mock database interactions. In a real app, this would be an actual database.

interface GetVideosFilters {
  status?: 'active' | 'inactive';
  category?: VideoCategory;
  artistId?: string;
}

export async function getVideos(filters: GetVideosFilters): Promise<Video[]> {
  let filteredVideos = videos.filter(v => !v.isBanned && !v.hiddenFromFeed);

  if (filters.status) {
    filteredVideos = filteredVideos.filter(v => v.status === filters.status);
  }
  if (filters.category) {
    filteredVideos = filteredVideos.filter(v => v.category === filters.category);
  }
  if (filters.artistId) {
    filteredVideos = filteredVideos.filter(v => v.artistId === filters.artistId);
  }
  
  return JSON.parse(JSON.stringify(filteredVideos));
}

export async function getVideosForArtist(artistId: string): Promise<Video[]> {
    return getVideos({ artistId, status: 'active' });
}


export async function getArtistsForVideos(videosToMap: Video[], allUsers: User[]): Promise<Record<string, User>> {
    const artistIds = new Set(videosToMap.map(v => v.artistId));
    const artistsMap: Record<string, User> = {};
    allUsers.forEach(user => {
      if (artistIds.has(user.userId)) {
        artistsMap[user.userId] = user;
      }
    });
    return artistsMap;
}


export async function voteOnVideo(videoId: string, isTop: boolean): Promise<Video | null> {
    console.log(`Voting ${isTop ? 'Top' : 'Flop'} on video ${videoId} (mock)`);
    const video = videos.find(v => v.id === videoId);
    if (!video) return null;
    
    // In a real app, you'd update the DB. Here, we just return the modified object.
    const updatedVideo = { ...video };
    if (isTop) {
        updatedVideo.topCount += 1;
    } else {
        updatedVideo.flopCount += 1;
    }
    return updatedVideo;
}

export async function toggleBookmark(userId: string, videoId: string): Promise<{ bookmarked: boolean }> {
    console.log(`Toggling bookmark for user ${userId} on video ${videoId} (mock)`);
    // This would typically involve checking a bookmarks table.
    // For the mock, we'll just toggle based on a random factor.
    const bookmarked = Math.random() > 0.5;
    return { bookmarked };
}

export async function createVideo(videoData: Omit<Video, 'id' | 'videoId' | 'topCount' | 'flopCount' | 'views' | 'bookCount' | 'adoptCount' | 'rankingScore' | 'bookmarks' | 'status' | 'createdAt'>): Promise<Video> {
    console.log("Creating video (mock):", videoData);
    const newVideo: Video = {
        id: `v${videos.length + 1}`,
        videoId: `v${videos.length + 1}`,
        ...videoData,
        topCount: 0,
        flopCount: 0,
        views: 0,
        bookCount: 0,
        adoptCount: 0,
        rankingScore: 0,
        bookmarks: 0,
        status: 'active',
        createdAt: Date.now(),
    };
    return newVideo;
}
