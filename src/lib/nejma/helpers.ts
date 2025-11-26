import type { devbaseClient } from '@/lib/devbase';

export const devbaseHelpers = {
  async checkExistingProfile(client: typeof devbaseClient, walletAddress: string) {
    if (!walletAddress || !client) return null;
    try {
      const users = await client.listEntities('users', { walletAddress });
      return users[0] || null;
    } catch (error) {
      console.error('Error checking existing profile:', error);
      return null;
    }
  },

  async getUserByWallet(client: typeof devbaseClient, walletAddress: string) {
    if (!walletAddress || !client) return null;
    try {
      const users = await client.listEntities('users', { walletAddress });
      return users[0] || null;
    } catch (error) {
      console.error('Error getting user by wallet:', error);
      return null;
    }
  },

  async getUserByUsername(client: typeof devbaseClient, username: string) {
    if (!username || !client) return null;
    try {
      const users = await client.listEntities('users', { username });
      return users[0] || null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  },
  
  async createVideo(client: typeof devbaseClient, videoData: any) {
    try {
      const created = await client.createEntity('videos', {
        ...videoData,
        status: 'active',
        createdAt: Date.now(),
        topCount: 0,
        flopCount: 0,
        views: 0,
        rankingScore: 0,
        bookCount: 0,
        adoptCount: 0,
      });
      await client.updateEntity('videos', created.id, { videoId: created.id });
      return created;
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  },
  
  async getVideosForArtist(client: typeof devbaseClient, artistId: string) {
    try {
      return await client.listEntities('videos', { artistId });
    } catch (error) {
      console.error('Error getting videos for artist:', error);
      return [];
    }
  },
};
