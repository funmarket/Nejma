
'use server';

import { users, videos as mockVideos, gossipPosts as mockGossipPosts, gossipComments as mockGossipComments, gossipRatings as mockGossipRatings, gossipFollows as mockGossipFollows, serviceAds as mockServiceAds } from '@/lib/data';
import type { GossipPost, GossipComment, GossipRating, GossipUserFollows, GossipServiceAd } from '@/lib/types';
import { getUserByWallet } from './user.actions';

// MOCK API for Gossip

export async function listPosts(): Promise<GossipPost[]> {
  console.log("Fetching all gossip posts (mock)");
  return JSON.parse(JSON.stringify(mockGossipPosts.sort((a, b) => b.createdAt - a.createdAt)));
}

export async function createPost(postData: Omit<GossipPost, 'id' | 'commentsCount' | 'createdAt'>): Promise<GossipPost> {
  console.log("Creating gossip post (mock)", postData);
  const newPost: GossipPost = {
    id: `gpost${Date.now()}`,
    ...postData,
    commentsCount: 0,
    createdAt: Date.now(),
  };
  mockGossipPosts.unshift(newPost);
  return newPost;
}

export async function updatePost(postId: string, updates: Partial<GossipPost>): Promise<GossipPost | null> {
    const postIndex = mockGossipPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return null;
    mockGossipPosts[postIndex] = { ...mockGossipPosts[postIndex], ...updates };
    return mockGossipPosts[postIndex];
}


export async function listComments(postId: string): Promise<GossipComment[]> {
    console.log(`Fetching comments for post ${postId} (mock)`);
    return JSON.parse(JSON.stringify(mockGossipComments.filter(c => c.postId === postId).sort((a,b) => a.createdAt - b.createdAt)));
}

export async function createComment(commentData: Omit<GossipComment, 'id' | 'createdAt'>): Promise<GossipComment> {
    console.log("Creating comment (mock)", commentData);
    const newComment: GossipComment = {
        id: `gcomment${Date.now()}`,
        ...commentData,
        createdAt: Date.now(),
    };
    mockGossipComments.push(newComment);

    const post = mockGossipPosts.find(p => p.id === commentData.postId);
    if(post) {
        post.commentsCount = (post.commentsCount || 0) + 1;
    }

    return newComment;
}

export async function deleteComment(commentId: string): Promise<{ success: boolean }> {
    console.log(`Deleting comment ${commentId} (mock)`);
    const index = mockGossipComments.findIndex(c => c.id === commentId);
    if (index > -1) {
        const post = mockGossipPosts.find(p => p.id === mockGossipComments[index].postId);
        if(post) {
            post.commentsCount = Math.max(0, (post.commentsCount || 0) - 1);
        }
        mockGossipComments.splice(index, 1);
        return { success: true };
    }
    return { success: false };
}


export async function ratePost(postId: string, raterWallet: string, score: number): Promise<GossipRating> {
    console.log(`Rating post ${postId} by ${raterWallet} with score ${score} (mock)`);
    let existingRating = mockGossipRatings.find(r => r.postId === postId && r.raterWallet === raterWallet);
    if (existingRating) {
        existingRating.score = score;
        return existingRating;
    } else {
        const newRating: GossipRating = {
            id: `grating${Date.now()}`,
            postId,
            raterWallet,
            score,
        };
        mockGossipRatings.push(newRating);
        return newRating;
    }
}

export async function getRatings(postId: string): Promise<GossipRating[]> {
    console.log(`Fetching ratings for post ${postId} (mock)`);
    return JSON.parse(JSON.stringify(mockGossipRatings.filter(r => r.postId === postId)));
}

export async function listServiceAds(): Promise<GossipServiceAd[]> {
    console.log("Fetching service ads (mock)");
    return JSON.parse(JSON.stringify(mockServiceAds));
}

export async function getUserFollows(followerWallet: string): Promise<GossipUserFollows[]> {
    console.log(`Fetching follows for user ${followerWallet} (mock)`);
    return JSON.parse(JSON.stringify(mockGossipFollows.filter(f => f.followerWallet === followerWallet)));
}

export async function followUser(followerWallet: string, followingWallet: string): Promise<GossipUserFollows> {
    console.log(`${followerWallet} is following ${followingWallet} (mock)`);
    const newFollow: GossipUserFollows = {
        id: `follow${Date.now()}`,
        followerWallet,
        followingWallet,
    };
    mockGossipFollows.push(newFollow);
    return newFollow;
}

export async function unfollowUser(followerWallet: string, followingWallet: string): Promise<{ success: boolean }> {
    console.log(`${followerWallet} is unfollowing ${followingWallet} (mock)`);
    const index = mockGossipFollows.findIndex(f => f.followerWallet === followerWallet && f.followingWallet === followingWallet);
    if (index > -1) {
        mockGossipFollows.splice(index, 1);
        return { success: true };
    }
    return { success: false };
}

export async function getGossipAuthors(posts: GossipPost[]): Promise<Record<string, any>> {
  const authorWallets = [...new Set(posts.map(p => p.authorWallet))];
  const authorPromises = authorWallets.map(wallet => getUserByWallet(wallet));
  const authors = await Promise.all(authorPromises);
  
  const authorsMap: Record<string, any> = {};
  authors.forEach(author => {
    if (author) {
      authorsMap[author.walletAddress] = author;
    }
  });
  return authorsMap;
}
