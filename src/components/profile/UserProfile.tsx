'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/providers/toast-provider';
import type { User, Video } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Youtube, Twitter, Send, Facebook, Instagram, Music, Globe, Sparkles } from 'lucide-react';
import { updateUser } from '@/lib/actions/user.actions';

interface UserProfileProps {
  profileUser: User;
  videos: Video[];
}

export default function UserProfile({ profileUser, videos }: UserProfileProps) {
  const { userWallet } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  
  const [user, setUser] = useState(profileUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>(profileUser);

  const isOwnProfile = userWallet === user.walletAddress;

  const handleSave = async () => {
    try {
        await updateUser(user.id, formData);
        setUser(prev => ({...prev, ...formData}));
        setIsEditing(false);
        addToast("Profile updated successfully.", "success");
        if(formData.username && formData.username !== user.username) {
            router.push(`/u/${formData.username}`);
        }
    } catch (error) {
        addToast("Failed to update profile.", "error");
    }
  };

  const socialIcons: { [key: string]: JSX.Element } = {
    youtube: <Youtube className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />,
    telegram: <Send className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />,
    instagram: <Instagram className="w-4 h-4" />,
    tiktok: <Music className="w-4 h-4" />,
    website: <Globe className="w-4 h-4" />,
  };
  
  const renderSocialLinks = () => (
    <div className="flex flex-wrap gap-2">
      {user.socialLinks && Object.entries(user.socialLinks).map(([key, value]) => value && (
        <a key={key} href={value as string} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs border border-border hover:bg-primary/20 transition-colors">
          {socialIcons[key]} {key.charAt(0).toUpperCase() + key.slice(1)}
        </a>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="bg-muted border-b">
        <div className="relative w-full pt-[33.33%]">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-500">
            {user.bannerPhotoUrl && (
                <Image
                src={user.bannerPhotoUrl}
                alt={`${user.username}'s banner`}
                fill
                className="object-cover"
                data-ai-hint="banner abstract"
                />
            )}
            </div>
            {isOwnProfile && (
                <div className="absolute top-2 right-2">
                    {isEditing ? (
                         <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleSave}>Save</Button>
                         </div>
                    ) : (
                        <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                </div>
            )}
        </div>
        <div className="px-4 pb-4">
            <div className="relative mt-[-4rem] sm:mt-[-5rem]">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-primary flex items-center justify-center text-white font-bold border-4 border-background overflow-hidden text-5xl">
                    {user.profilePhotoUrl ? (
                         <Image
                            src={user.profilePhotoUrl}
                            alt={user.username}
                            width={160}
                            height={160}
                            className="w-full h-full object-cover"
                            data-ai-hint="person avatar"
                         />
                    ) : (
                        user.username[0].toUpperCase()
                    )}
                </div>
            </div>

            <div className="mt-4">
                {isEditing ? (
                    <Input className="text-3xl font-bold" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                ) : (
                    <h1 className="text-3xl font-bold">@{user.username}</h1>
                )}
                
                <div className="flex flex-wrap gap-2 my-3">
                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary-foreground font-medium border border-primary/50 text-sm capitalize">{user.role}</span>
                    {user.talentCategory && <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-medium border border-border text-sm capitalize">{user.talentCategory}</span>}
                    {user.location && <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-medium border border-border text-sm">📍 {user.location}</span>}
                </div>

                {isEditing ? (
                     <div className='space-y-2'>
                        <div className="flex justify-between items-center">
                            <Label>Bio</Label>
                        </div>
                        <Textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows={4} />
                    </div>
                ) : (
                    user.bio && <p className="text-muted-foreground whitespace-pre-wrap">{user.bio}</p>
                )}
            </div>
            
            {!isEditing && user.socialLinks && <div className="mt-4">{renderSocialLinks()}</div>}
        </div>
      </div>

      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">Videos</h2>
        {videos.length > 0 ? (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(video => (
                    <div key={video.id} className="bg-muted rounded-xl border p-4 hover:border-primary/50 transition-all">
                        <div className="aspect-video bg-black rounded-lg mb-3 flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-primary" />
                        </div>
                        <p className="text-foreground font-bold mb-2 line-clamp-2">{video.description}</p>
                    </div>
                ))}
             </div>
        ) : (
            <div className="text-center py-12 bg-muted rounded-xl border">
                <p className="text-muted-foreground">No videos yet.</p>
                {isOwnProfile && <Button className="mt-4" onClick={() => router.push('/submit-video')}>Upload First Video</Button>}
            </div>
        )}
      </div>
    </div>
  );
}
