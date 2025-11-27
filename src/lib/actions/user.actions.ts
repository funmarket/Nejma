
'use server';

import { users } from "@/lib/data";
import type { User } from "@/lib/types";

// Mock database interactions. In a real app, this would be an actual database.

export async function getUserByWallet(walletAddress: string): Promise<User | null> {
  const user = users.find(u => u.walletAddress === walletAddress && !u.isDeleted);
  return user ? JSON.parse(JSON.stringify(user)) : null;
}

export async function getUserById(userId: string): Promise<User | null> {
  const user = users.find(u => u.userId === userId && !u.isDeleted);
  return user ? JSON.parse(JSON.stringify(user)) : null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && !u.isDeleted);
  return user ? JSON.parse(JSON.stringify(user)) : null;
}

export async function getActiveUsers(): Promise<User[]> {
  return JSON.parse(JSON.stringify(users.filter(u => !u.isDeleted && !u.isBanned && !u.isSuspended)));
}

export async function checkOrCreateUser(walletAddress: string): Promise<User> {
  console.log("Checking for user with wallet:", walletAddress);
  let user = await getUserByWallet(walletAddress);
  if (!user) {
    console.log(`Creating new user for wallet: ${walletAddress}`);
    const userId = `user_${Date.now()}`;
    const newUser: User = {
      id: userId,
      userId: userId,
      walletAddress: walletAddress,
      username: `user_${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`,
      bio: '',
      role: 'regular',
      rankingScore: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    users.push(newUser); // Add to our mock DB
    return JSON.parse(JSON.stringify(newUser));
  }
  console.log("User found:", user.username);
  return JSON.parse(JSON.stringify(user));
}


export async function createUser(profileData: Partial<User> & { walletAddress: string }): Promise<User> {
  console.log("Creating user (mock):", profileData);
  const newId = `user-${Date.now()}`;
  const newUser: User = {
    id: newId,
    userId: newId,
    username: 'NewUser',
    rankingScore: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...profileData,
    role: profileData.role || 'fan', // ensure role is set
  };
  users.push(newUser);
  return JSON.parse(JSON.stringify(newUser));
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  console.log(`Updating user ${userId} (mock):`, updates);
  const userIndex = users.findIndex(u => u.userId === userId);
  if (userIndex === -1) return null;
  
  users[userIndex] = { ...users[userIndex], ...updates, updatedAt: Date.now() };
  return JSON.parse(JSON.stringify(users[userIndex]));
}

export async function deleteUser(userId: string): Promise<{ success: boolean }> {
    console.log(`Deleting user ${userId} (mock)`);
    const userIndex = users.findIndex(u => u.userId === userId);
    if(userIndex > -1) {
        users.splice(userIndex, 1);
        return { success: true };
    }
    return { success: false };
}
