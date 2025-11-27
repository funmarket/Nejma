
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDevapp } from '@/components/providers/devapp-provider';
import { useToast } from '@/components/providers/toast-provider';
import { WalletConnectPrompt } from '@/components/nejma/wallet-connect-prompt';
import { sanitizeUrl } from '@/lib/nejma/youtube';
import { TALENT_CATEGORIES } from '@/lib/nejma/constants';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Youtube, Twitter, Send, Facebook, Instagram, Music, Globe, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const socialIcons: Record<string, React.ElementType> = {
    youtube: Youtube,
    twitter: Twitter,
    telegram: Send,
    facebook: Facebook,
    instagram: Instagram,
    tiktok: Music,
    website: Globe
};

export function OnboardProfilePage() {
    const { user, loadingUser } = useDevapp();
    const router = useRouter();
    const params = useParams();
    const { addToast } = useToast();
    
    const type = Array.isArray(params.type) ? params.type[0] : params.type;

    const [step, setStep] = useState(1);
    const [isArtistChecked, setIsArtistChecked] = useState(false);
    const [isBusinessChecked, setIsBusinessChecked] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        profilePhotoUrl: '',
        bannerPhotoUrl: '',
        location: '',
        socialLinks: JSON.stringify({}),
        extraLinks: JSON.stringify([]),
        talentCategory: '',
        talentSubcategories: JSON.stringify([]),
    });
    const [showExtraLinks, setShowExtraLinks] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // We can't get user's display name or photo from Solana wallet
        // This remains empty, users have to fill it.
    }, [user, loadingUser]);
    
    useEffect(() => {
        if (type === 'artist') setIsArtistChecked(true);
        if (type === 'business') setIsBusinessChecked(true);
    }, [type]);

    const parsedSocialLinks = useMemo(() => {
        try { return JSON.parse(formData.socialLinks || '{}'); } catch { return {}; }
    }, [formData.socialLinks]);
    
    const parsedExtraLinks = useMemo(() => {
        try { return JSON.parse(formData.extraLinks || '[]'); } catch { return []; }
    }, [formData.extraLinks]);

    const handleSocialLinkChange = (platform: string, value: string) => {
        setFormData(prev => ({...prev, socialLinks: JSON.stringify({...parsedSocialLinks, [platform]: value})}));
    };

    const handleExtraLinkChange = (index: number, field: 'label' | 'url', value: string) => {
        const newLinks = [...parsedExtraLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFormData(prev => ({ ...prev, extraLinks: JSON.stringify(newLinks) }));
    };

    const addExtraLink = () => {
        if (parsedExtraLinks.length >= 5) return;
        setFormData(prev => ({ ...prev, extraLinks: JSON.stringify([...parsedExtraLinks, { label: '', url: '' }]) }));
    };
    
    const removeExtraLink = (index: number) => {
        const newLinks = parsedExtraLinks.filter((_: any, i: number) => i !== index);
        setFormData(prev => ({ ...prev, extraLinks: JSON.stringify(newLinks) }));
    };

    const handleCreateProfile = async () => {
        if (!user) return;
        if (!formData.username) { addToast('Username is required.', 'error'); return; }

        let role = 'fan';
        if (isArtistChecked && isBusinessChecked) role = 'artist';
        else if (isArtistChecked) role = 'artist';
        else if (isBusinessChecked) role = 'business';

        if (role === 'artist' && !formData.talentCategory) {
            addToast('Please select your talent category.', 'error');
            return;
        }
        
        setIsSaving(true);
        try {
            const profileData: any = {
                walletAddress: user.uid,
                username: formData.username || '',
                bio: formData.bio || '',
                location: formData.location || '',
                profilePhotoUrl: sanitizeUrl(formData.profilePhotoUrl) || '',
                bannerPhotoUrl: sanitizeUrl(formData.bannerPhotoUrl) || '',
                socialLinks: formData.socialLinks,
                extraLinks: formData.extraLinks,
                role,
                talentCategory: role === 'artist' ? formData.talentCategory : null,
                talentSubcategories: role === 'artist' ? formData.talentSubcategories : JSON.stringify([]),
                rankingScore: 0,
                escrowBalance: 0,
                updatedAt: serverTimestamp()
            };

            const usersCollection = collection(db, 'users');
            const q = query(usersCollection, where('walletAddress', '==', user.uid));
            const existingUsers = await getDocs(q);

            if (existingUsers.empty) {
                profileData.createdAt = serverTimestamp();
                const newUserRef = await addDoc(usersCollection, profileData);
                await updateDoc(doc(db, 'users', newUserRef.id), { userId: newUserRef.id });
            } else {
                const userDocRef = existingUsers.docs[0].ref;
                await updateDoc(userDocRef, profileData);
            }
            
            addToast('Profile created successfully!', 'success');
            if (role === 'artist') {
                setStep(2);
            } else {
                router.push(`/u/${formData.username}`);
            }

        } catch (error) {
            console.error('Error creating profile:', error);
            addToast('Failed to create profile.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loadingUser) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>
    if (!user) return <WalletConnectPrompt accountType={type || 'fan'} onBack={() => router.push('/onboarding')} />;

    const renderAccountTypeSelection = () => (
        <div className="mb-6 space-y-3">
            <Label>Account Type *</Label>
            <div className="space-y-2">
                <label className="flex items-center gap-3 bg-muted/50 rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors">
                    <Checkbox checked={isArtistChecked} onCheckedChange={(checked) => setIsArtistChecked(Boolean(checked))} id="artist-check" />
                    <div>
                        <Label htmlFor="artist-check" className="font-semibold text-foreground cursor-pointer">Artist / Talent</Label>
                        <p className="text-xs text-muted-foreground">Showcase your talent and get discovered</p>
                    </div>
                </label>
                <label className="flex items-center gap-3 bg-muted/50 rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors">
                    <Checkbox checked={isBusinessChecked} onCheckedChange={(checked) => setIsBusinessChecked(Boolean(checked))} id="business-check" />
                    <div>
                        <Label htmlFor="business-check" className="font-semibold text-foreground cursor-pointer">Business / Producer</Label>
                        <p className="text-xs text-muted-foreground">Discover and hire talent</p>
                    </div>
                </label>
            </div>
            {isArtistChecked && isBusinessChecked && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-2">
                    <p className="text-xs text-primary">✓ You selected both roles. Your account will be set as <strong>Artist</strong> with business capabilities.</p>
                </div>
            )}
        </div>
    );

    const renderArtistFields = () => (
        <>
            <div className="space-y-4 mb-4">
                <div>
                    <Label>Talent Category *</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                        {Object.entries(TALENT_CATEGORIES).map(([key, cat]) => (
                            <Button key={key} type="button" onClick={() => setFormData({...formData, talentCategory: key, talentSubcategories: JSON.stringify([])})} variant={formData.talentCategory === key ? 'default' : 'secondary'} className="h-auto py-2 text-xs sm:text-sm whitespace-normal">
                                {cat.label}
                            </Button>
                        ))}
                    </div>
                </div>
                {formData.talentCategory && TALENT_CATEGORIES[formData.talentCategory as keyof typeof TALENT_CATEGORIES] && (
                    <div>
                        <Label>Subcategories (Select one or more)</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {TALENT_CATEGORIES[formData.talentCategory as keyof typeof TALENT_CATEGORIES].subcategories.map(sub => {
                            const currentSubs = JSON.parse(formData.talentSubcategories);
                            const isSelected = currentSubs.includes(sub.value);
                            return (
                                <Button key={sub.value} type="button" onClick={() => {
                                    const newSubs = isSelected ? currentSubs.filter((s:string) => s !== sub.value) : [...currentSubs, sub.value];
                                    setFormData({...formData, talentSubcategories: JSON.stringify(newSubs)});
                                }} variant={isSelected ? 'default' : 'secondary'} className="h-auto py-2 text-xs sm:text-sm whitespace-normal">
                                    {sub.label}
                                </Button>
                            );
                        })}
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-border pt-6 mt-6">
                <h3 className="text-lg font-bold mb-3">Social & External Links</h3>
                <div className="space-y-4">
                    {Object.entries(socialIcons).map(([key, Icon]) => (
                        <div key={key}>
                            <Label className="block text-sm text-muted-foreground mb-2 flex items-center gap-2"><Icon className="w-4 h-4" /> {key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                            <Input type="url" value={parsedSocialLinks[key] || ''} onChange={e => handleSocialLinkChange(key, e.target.value)} placeholder={`https://...`} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-border pt-6 mt-6">
                <Button type="button" onClick={() => setShowExtraLinks(!showExtraLinks)} variant="link" className="p-0 h-auto flex items-center gap-2 text-primary hover:text-primary/80 mb-3">
                    {showExtraLinks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span>Additional Links (Optional, Max 5)</span>
                </Button>
                {showExtraLinks && <div className="space-y-3">
                    {parsedExtraLinks.map((link: any, index: number) => (
                        <div key={index} className="flex gap-2 items-center">
                            <Input type="text" value={link.label || ''} onChange={e => handleExtraLinkChange(index, 'label', e.target.value)} placeholder="Label" className="w-1/3" />
                            <Input type="url" value={link.url || ''} onChange={e => handleExtraLinkChange(index, 'url', e.target.value)} placeholder="https://..." className="flex-1" />
                            <Button type="button" onClick={() => removeExtraLink(index)} variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    ))}
                    {parsedExtraLinks.length < 5 && (
                        <Button type="button" onClick={addExtraLink} variant="outline" className="w-full"><Plus className="w-4 h-4 mr-2" /> Add Link</Button>
                    )}
                </div>}
            </div>
        </>
    );

    const titleMap: Record<string, string> = {
        fan: 'Create Fan Profile',
        artist: 'Create Artist Profile',
        business: 'Create Business Account',
    };
    
    return (
        <div className="min-h-screen bg-background text-foreground pt-12 sm:pt-20 pb-20">
            <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 via-primary to-blue-500 bg-clip-text text-transparent">
                        {titleMap[type] || 'Create Your Profile'}
                    </h1>
                    <p className="text-muted-foreground">{type === 'artist' ? 'Showcase your talent to the world' : 'Join the NEJMA community'}</p>
                </div>

                <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border">
                    {step === 1 ? (
                        <div className="space-y-6">
                            {type !== 'fan' && renderAccountTypeSelection()}
                            <div className="space-y-4">
                                <Label htmlFor="username">Username *</Label>
                                <Input id="username" value={formData.username || ''} onChange={e => setFormData({ ...formData, username: e.target.value })} placeholder={type === 'artist' ? 'Your stage name' : 'Your username'} />
                            
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea id="bio" value={formData.bio || ''} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={4} placeholder="Tell us about yourself..." />
                                
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="City, Country" />

                                <Label htmlFor="profilePhoto">Profile Photo URL</Label>
                                <Input id="profilePhoto" value={formData.profilePhotoUrl || ''} onChange={e => setFormData({ ...formData, profilePhotoUrl: e.target.value })} placeholder="https://..." />
                                {formData.profilePhotoUrl && <Image src={formData.profilePhotoUrl} alt="Profile preview" width={80} height={80} className="w-20 h-20 rounded-full object-cover mt-2" />}

                                <Label htmlFor="bannerPhoto">Banner Photo URL</Label>
                                <Input id="bannerPhoto" value={formData.bannerPhotoUrl || ''} onChange={e => setFormData({ ...formData, bannerPhotoUrl: e.target.value })} placeholder="https://..." />
                                {formData.bannerPhotoUrl && <Image src={formData.bannerPhotoUrl} alt="Banner preview" width={400} height={150} className="w-full h-32 object-cover rounded-lg mt-2" />}
                            </div>
                            
                            {isArtistChecked && renderArtistFields()}
                            
                            <div className="flex gap-3 pt-4">
                                <Button onClick={() => router.push('/onboarding')} variant="outline" className="flex-1">Back</Button>
                                <Button onClick={handleCreateProfile} disabled={isSaving} className="flex-1">{isSaving ? "Saving..." : "Continue"}</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 text-center">
                            <h2 className="text-2xl font-bold">Profile Created!</h2>
                            <p className="text-muted-foreground mb-6">You can now upload your first video to get discovered by producers and fans!</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button onClick={() => router.push('/')} variant="secondary" className="flex-1">Browse Feed</Button>
                                <Button onClick={() => router.push('/submit-video')} className="flex-1">Upload Video</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

