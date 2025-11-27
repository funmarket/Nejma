'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createUser, updateUser, getUserByWallet } from '@/lib/actions/user.actions';
import type { TalentCategory, UserRole } from '@/lib/types';
import { TALENT_CATEGORIES } from '@/lib/constants';

interface CreateProfileFormProps {
  accountType: 'fan' | 'artist' | 'business';
}

export default function CreateProfileForm({ accountType }: CreateProfileFormProps) {
  const { userWallet } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  
  const [isArtist, setIsArtist] = useState(accountType === 'artist');
  const [isBusiness, setIsBusiness] = useState(accountType === 'business');

  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profilePhotoUrl: '',
    bannerPhotoUrl: '',
    talentCategory: '' as TalentCategory,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userWallet) {
      router.push('/onboarding');
    }
  }, [userWallet, router]);

  const handleCreateProfile = async () => {
    setLoading(true);
    if (!userWallet) {
      addToast('Wallet not connected.', 'error');
      setLoading(false);
      return;
    }
    if (!formData.username) {
      addToast('Username is required.', 'error');
      setLoading(false);
      return;
    }
    if (accountType === 'artist' && !formData.talentCategory) {
        addToast('Talent category is required for artists.', 'error');
        setLoading(false);
        return;
    }

    try {
        let role: UserRole = 'fan';
        if (isArtist && isBusiness) role = 'artist'; // Artist with business capabilities
        else if (isArtist) role = 'artist';
        else if (isBusiness) role = 'business';
        else if (accountType === 'fan') role = 'fan';


      const existingUser = await getUserByWallet(userWallet);
      const profileData = {
        username: formData.username,
        bio: formData.bio,
        profilePhotoUrl: formData.profilePhotoUrl,
        bannerPhotoUrl: formData.bannerPhotoUrl,
        role: role,
        talentCategory: isArtist ? formData.talentCategory : '',
      };
      
      let user;
      if(existingUser) {
        user = await updateUser(existingUser.id, profileData);
      } else {
        user = await createUser({ ...profileData, walletAddress: userWallet });
      }

      addToast('Profile created successfully!', 'success');

      if (isArtist) {
        setStep(2);
      } else {
        router.push(`/u/${user?.username}`);
      }

    } catch (error) {
      console.error('Error creating profile:', error);
      addToast('Failed to create profile.', 'error');
    } finally {
        setLoading(false);
    }
  };
  
  if (step === 2) {
    return (
        <div className="min-h-screen bg-black text-white pt-20 pb-20 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full mx-auto text-center bg-gray-900/80 rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Profile Created!</h2>
                <p className="text-white/80 mb-6">
                    You can now upload your first video to get discovered by producers and fans!
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => router.push('/')} variant="secondary" className="flex-1">
                        Browse Feed
                    </Button>
                    <Button onClick={() => router.push('/submit-video')} className="flex-1">
                        Upload Video
                    </Button>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            {accountType === 'fan' ? 'Create Fan Profile' : 'Create Your Profile'}
          </h1>
          <p className="text-white/60">
            {accountType === 'fan' ? 'Become a Fan — It\'s Free!' : accountType === 'artist' ? 'Showcase your talent to the world' : 'Discover and hire amazing talent'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 space-y-6">
            {accountType !== 'fan' && (
                <div className="space-y-3">
                  <Label>Account Type *</Label>
                   <div className="flex items-center space-x-2 p-3 bg-gray-700/50 rounded-lg">
                    <Checkbox id="is-artist" checked={isArtist} onCheckedChange={(checked) => setIsArtist(!!checked)} />
                    <label htmlFor="is-artist" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Artist / Talent
                    </label>
                  </div>
                   <div className="flex items-center space-x-2 p-3 bg-gray-700/50 rounded-lg">
                    <Checkbox id="is-business" checked={isBusiness} onCheckedChange={(checked) => setIsBusiness(!!checked)} />
                    <label htmlFor="is-business" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Business / Producer
                    </label>
                  </div>
                </div>
            )}
            
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder={accountType === 'artist' ? 'Your stage name' : 'Your username'} />
            </div>

            {isArtist && (
                <div>
                    <Label htmlFor="talentCategory">Talent Category *</Label>
                     <Select value={formData.talentCategory} onValueChange={(value: TalentCategory) => setFormData({ ...formData, talentCategory: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your main talent" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TALENT_CATEGORIES).map(([key, cat]) => (
                            <SelectItem key={key} value={key}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="bio">Bio</Label>
              </div>
              <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about yourself..." />
            </div>
            
            <div>
              <Label htmlFor="profilePhoto">Profile Photo URL</Label>
              <Input id="profilePhoto" value={formData.profilePhotoUrl} onChange={(e) => setFormData({ ...formData, profilePhotoUrl: e.target.value })} placeholder="https://..." />
            </div>
            
            <div>
              <Label htmlFor="bannerPhoto">Banner Photo URL</Label>
              <Input id="bannerPhoto" value={formData.bannerPhotoUrl} onChange={(e) => setFormData({ ...formData, bannerPhotoUrl: e.target.value })} placeholder="https://..." />
            </div>
            
             <div className="flex gap-3 pt-4">
                <Button onClick={() => router.back()} variant="secondary" className="flex-1" type="button" disabled={loading}>
                  Back
                </Button>
                <Button onClick={handleCreateProfile} className="flex-1" type="button" disabled={loading}>
                  {loading ? 'Creating...' : (isArtist ? 'Continue' : 'Create Profile')}
                </Button>
              </div>
        </div>
      </div>
    </div>
  );
}
