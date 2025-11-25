
export type UserRole = 'fan' | 'artist' | 'business' | 'regular';
export type TalentCategory = 'music' | 'acting' | 'creator' | '';
export type TalentSubcategory = string;

export interface SocialLinks {
  youtube?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  telegram?: string;
  website?: string;
}

export interface ExtraLink {
  label: string;
  url: string;
}

export interface User {
  id: string;
  userId: string;
  walletAddress: string;
  username: string;
  role: UserRole;
  bio?: string;
  profilePhotoUrl?: string;
  bannerPhotoUrl?: string;
  location?: string;
  skills?: string;
  tags?: string;
  talentCategory?: TalentCategory;
  talentSubcategories?: TalentSubcategory[];
  socialLinks?: SocialLinks;
  extraLinks?: ExtraLink[];
  rankingScore: number;
  createdAt: number;
  updatedAt: number;
  isDeleted?: boolean;
  isBanned?: boolean;
  isSuspended?: boolean;
}

export type VideoCategory = 'music' | 'acting' | 'dance' | 'comedy' | 'creator';

export interface Video {
  id: string;
  videoId: string;
  artistId: string; // User ID of the artist
  videoUrl: string;
  rawVideoInput: string;
  description: string;
  category: VideoCategory;
  topCount: number;
  flopCount: number;
  views: number;
  bookCount: number;
  adoptCount: number;
  rankingScore: number;
  bookmarks: number;
  status: 'active' | 'inactive';
  createdAt: number;
  isBanned?: boolean;
  hiddenFromFeed?: boolean;
}

export interface Bookmark {
  id: string;
  userId: string;
  videoId: string;
}

export interface Tip {
  id: string;
  fromWallet: string;
  toWallet: string;
  amount: number;
  videoId: string;
  createdAt: number;
}

export interface GossipPost {
  id: string;
  authorWallet: string;
  content: string;
  imageUrl?: string;
  category: string;
  createdAt: number;
  commentsCount: number;
}

export interface GossipComment {
    id: string;
    postId: string;
    authorWallet: string;
    content: string;
    createdAt: number;
}

export interface GossipRating {
    id: string;
    postId: string;
    raterWallet: string;
    score: number;
}

export interface GossipServiceAd {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    contactInfo?: string;
    workLinks?: string;
}

export interface GossipUserFollows {
    id: string;
    followerWallet: string;
    followingWallet: string;
}
