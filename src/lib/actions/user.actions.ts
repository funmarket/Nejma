"use server";

import { users } from "@/lib/data";
import type { User } from "@/lib/types";

// Mock database interactions. In a real app, this would be an actual database.

export async function getUserByWallet(walletAddress: string): Promise<User | null> {
  const user = users.find(u => u.walletAddress === walletAddress && !u.isDeleted);
  return user ? { ...user } : null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && !u.isDeleted);
  return user ? { ...user } : null;
}

export async function getActiveUsers(): Promise<User[]> {
  return users.filter(u => !u.isDeleted && !u.isBanned && !u.isSuspended);
}

export async function checkOrCreateUser(walletAddress: string): Promise<User> {
  let user = await getUserByWallet(walletAddress);
  if (!user) {
    console.log(`Creating new user profile for wallet: ${walletAddress}`);
    const newUser: User = {
      id: (users.length + 1).toString(),
      userId: (users.length + 1).toString(),
      walletAddress: walletAddress,
      username: `User_${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`,
      bio: '',
      role: 'regular',
      rankingScore: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    // In a real app, you would save this to the database.
    // Here we just log it. The mock data is static.
    console.log("New user created (mock):", newUser);
    return newUser;
  }
  return user;
}


export async function createUser(profileData: Partial<User> & { walletAddress: string }): Promise<User> {
  console.log("Creating user (mock):", profileData);
  const newUser: User = {
    id: (users.length + 1).toString(),
    userId: (users.length + 1).toString(),
    username: 'NewUser',
    rankingScore: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...profileData,
    role: profileData.role || 'fan', // ensure role is set
  };
  return newUser;
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  console.log(`Updating user ${userId} (mock):`, updates);
  const userIndex = users.findIndex(u => u.userId === userId);
  if (userIndex === -1) return null;
  
  // This would update the database in a real app.
  // Here, we just return what the updated user would look like.
  const updatedUser = { ...users[userIndex], ...updates, updatedAt: Date.now() };
  return updatedUser;
}

export async function deleteUser(userId: string): Promise<{ success: boolean }> {
    console.log(`Deleting user ${userId} (mock)`);
    return { success: true };
}
