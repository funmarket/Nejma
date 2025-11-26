
'use server';

import { users, videos as mockVideos, gossipPosts, gossipComments, gossipRatings, gossipFollows, serviceAds } from '@/lib/data';
import type { GossipPost, GossipComment, GossipRating, GossipUserFollows, GossipServiceAd, User } from '@/lib/types';
import { getUserByWallet, getUserById } from './user.actions';

// MOCK API for Gossip

export async function listPosts(): Promise<GossipPost[]> {
  console.log("Fetching all gossip posts (mock)");
  // Ensure commentsCount is accurate
  gossipPosts.forEach(post => {
    post.commentsCount = gossipComments.filter(c => c.postId === post.id).length;
  });
  return JSON.parse(JSON.stringify(gossipPosts.sort((a, b) => b.createdAt - a.createdAt)));
}

export async function createPost(postData: Omit<GossipPost, 'id' | 'commentsCount' | 'createdAt'>): Promise<GossipPost> {
  console.log("Creating gossip post (mock)", postData);
  const newPost: GossipPost = {
    id: `gpost${Date.now()}`,
    ...postData,
    authorWallet: 'deprecated', // This field is no longer primary for auth
    commentsCount: 0,
    createdAt: Date.now(),
  };
  gossipPosts.unshift(newPost);
  return JSON.parse(JSON.stringify(newPost));
}

export async function updatePost(postId: string, updates: Partial<GossipPost>): Promise<GossipPost | null> {
    const postIndex = gossipPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return null;
    gossipPosts[postIndex] = { ...gossipPosts[postIndex], ...updates };
    return JSON.parse(JSON.stringify(gossipPosts[postIndex]));
}


export async function listComments(postId: string): Promise<GossipComment[]> {
    console.log(`Fetching comments for post ${postId} (mock)`);
    return JSON.parse(JSON.stringify(gossipComments.filter(c => c.postId === postId).sort((a,b) => a.createdAt - b.createdAt)));
}

export async function createComment(commentData: Omit<GossipComment, 'id' | 'createdAt'>): Promise<GossipComment> {
    console.log("Creating comment (mock)", commentData);
    const newComment: GossipComment = {
        id: `gcomment${Date.now()}`,
        ...commentData,
        authorWallet: 'deprecated',
        createdAt: Date.now(),
    };
    gossipComments.push(newComment);

    const post = gossipPosts.find(p => p.id === commentData.postId);
    if(post) {
        post.commentsCount = (post.commentsCount || 0) + 1;
    }

    return JSON.parse(JSON.stringify(newComment));
}

export async function deleteComment(commentId: string): Promise<{ success: boolean }> {
    console.log(`Deleting comment ${commentId} (mock)`);
    const index = gossipComments.findIndex(c => c.id === commentId);
    if (index > -1) {
        const post = gossipPosts.find(p => p.id === gossipComments[index].postId);
        if(post) {
            post.commentsCount = Math.max(0, (post.commentsCount || 0) - 1);
        }
        gossipComments.splice(index, 1);
        return { success: true };
    }
    return { success: false };
}


export async function ratePost(postId: string, raterId: string, score: number): Promise<GossipRating> {
    console.log(`Rating post ${postId} by ${raterId} with score ${score} (mock)`);
    let existingRating = gossipRatings.find(r => r.postId === postId && r.raterId === raterId);
    if (existingRating) {
        existingRating.score = score;
        return JSON.parse(JSON.stringify(existingRating));
    } else {
        const newRating: GossipRating = {
            id: `grating${Date.now()}`,
            postId,
            raterId,
            score,
            raterWallet: 'deprecated'
        };
        gossipRatings.push(newRating);
        return JSON.parse(JSON.stringify(newRating));
    }
}

export async function getRatings(postId: string): Promise<GossipRating[]> {
    console.log(`Fetching ratings for post ${postId} (mock)`);
    return JSON.parse(JSON.stringify(gossipRatings.filter(r => r.postId === postId)));
}

export async function listServiceAds(): Promise<GossipServiceAd[]> {
    console.log("Fetching service ads (mock)");
    return JSON.parse(JSON.stringify(serviceAds));
}

export async function getUserFollows(followerId: string): Promise<GossipUserFollows[]> {
    console.log(`Fetching follows for user ${followerId} (mock)`);
    return JSON.parse(JSON.stringify(gossipFollows.filter(f => f.followerId === followerId)));
}

export async function followUser(followerId: string, followingId: string): Promise<GossipUserFollows> {
    console.log(`${followerId} is following ${followingId} (mock)`);
    const existingFollow = gossipFollows.find(f => f.followerId === followerId && f.followingId === followingId);
    if (existingFollow) return JSON.parse(JSON.stringify(existingFollow));
    
    const newFollow: GossipUserFollows = {
        id: `follow${Date.now()}`,
        followerId,
        followingId,
        followerWallet: 'deprecated',
        followingWallet: 'deprecated',
    };
    gossipFollows.push(newFollow);
    return JSON.parse(JSON.stringify(newFollow));
}

export async function unfollowUser(followerId: string, followingId: string): Promise<{ success: boolean }> {
    console.log(`${followerId} is unfollowing ${followingId} (mock)`);
    const index = gossipFollows.findIndex(f => f.followerId === followerId && f.followingId === followingId);
    if (index > -1) {
        gossipFollows.splice(index, 1);
        return { success: true };
    }
    return { success: false };
}

export async function getGossipAuthors(items: { authorId?: string, authorWallet?: string }[]): Promise<Record<string, User>> {
  const authorIds = [...new Set(items.map(p => p.authorId).filter(Boolean))];
  const authorsMap: Record<string, User> = {};

  for (const id of authorIds) {
    if (id && !authorsMap[id]) {
      // In a real app, you'd have a single function like `getUser`
      // For this mock, we have to try both id and wallet
      const user = await getUserById(id)
      if (user) {
        authorsMap[id] = user;
      }
    }
  }

  // Legacy support for wallet-based authors during transition
  const authorWallets = [...new Set(items.map(p => p.authorWallet).filter(Boolean))];
  for (const wallet of authorWallets) {
     if (wallet && !Object.values(authorsMap).find(u => u.walletAddress === wallet)) {
       const user = await getUserByWallet(wallet);
       if (user) {
         authorsMap[user.userId] = user;
       }
     }
  }
  
  return authorsMap;
}
