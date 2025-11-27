
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useToast } from '@/components/providers/toast-provider';
import { TALENT_CATEGORIES } from '@/lib/nejma/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Youtube, Twitter, Send, Facebook, Instagram, Music, Globe, ChevronDown, ChevronUp, Plus, Trash2, Sparkles, Zap } from 'lucide-react';
import { sanitizeUrl } from '@/lib/nejma/youtube';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-user';

const socialIcons: Record<string, React.ElementType> = {
    youtube: Youtube, twitter: Twitter, telegram: Send, facebook: Facebook,
    instagram: Instagram, tiktok: Music, website: Globe,
};

async function getUserByUsername(username: string) {
    if (!username) return null;
    const q = query(collection(db, 'users'), where('username', '==', username));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
}

async function getVideosForArtist(userId: string) {
    if (!userId) return [];
    const q = query(collection(db, 'videos'), where('artistId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}


export function PublicProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const { addToast } = useToast();

    const [user, setUser] = useState<any>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [showExtraLinks, setShowExtraLinks] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isOwnProfile = currentUser && user && currentUser.walletAddress === user.walletAddress;

    const loadProfile = async () => {
        setLoading(true);
        const userData = await getUserByUsername(username);
        if (userData) {
            setUser(userData);
            setFormData({
                ...userData,
                socialLinks: userData.socialLinks || JSON.stringify({}),
                extraLinks: userData.extraLinks || JSON.stringify([]),
                talentSubcategories: userData.talentSubcategories || JSON.stringify([]),
            });
            const userVideos = await getVideosForArtist(userData.userId || userData.id);
            setVideos(userVideos);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadProfile();
    }, [username]);

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

    const handleSave = async () => {
        if (!user || !user.id) { addToast('User profile not found', 'error'); return; }
        
        try {
            const updatedData = { 
                ...formData, 
                bannerPhotoUrl: sanitizeUrl(formData.bannerPhotoUrl), 
                profilePhotoUrl: sanitizeUrl(formData.profilePhotoUrl),
                updatedAt: serverTimestamp()
            };
            delete updatedData.id; 
            
            await updateDoc(doc(db, 'users', user.id), updatedData);
            setUser({ ...user, ...updatedData });
            setEditing(false);
            addToast('Profile updated successfully!', 'success');
            if(formData.username !== username) {
                router.push(`/u/${formData.username}`);
            }
        } catch (error) {
            console.error(error);
            addToast('Failed to update profile', 'error');
        }
    };
    
    const handleDeleteProfile = async () => {
        if (!user || !user.id) return;
        try {
            await deleteDoc(doc(db, 'users', user.id));
            addToast('Profile deleted successfully', 'success');
            router.push('/onboarding');
        } catch (error) {
            addToast('Failed to delete profile', 'error');
        }
    };
    
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><p>Loading profile...</p></div>;
    }
    if (!user) {
        return <div className="min-h-screen flex items-center justify-center"><p>User not found</p></div>;
    }

    const socialLinks = user.socialLinks ? JSON.parse(user.socialLinks) : {};
    const extraLinks = user.extraLinks ? JSON.parse(user.extraLinks) : [];

    const renderSocialLinks = () => (
        <div className="flex flex-wrap gap-2">
            {Object.entries(socialLinks).filter(([,url])=>url).map(([key, url]) => {
                const Icon = socialIcons[key];
                return <a key={key} href={url as string} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground hover:bg-primary/20 transition-colors"><Icon className="w-5 h-5" /></a>;
            })}
            {extraLinks.map((link:any, idx:number) => (
                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs border border-transparent hover:text-foreground hover:bg-primary/20 transition-all">
                    {link.label || link.url}
                </a>
            ))}
        </div>
    );
    
    const renderEditArtistFields = () => (
        <div className="mt-6 border-t border-border pt-6 space-y-6">
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
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-20">
            <Card className="max-w-4xl mx-auto rounded-none sm:rounded-b-2xl border-x-0 border-t-0 sm:border-x sm:border-b">
                <div className="relative w-full aspect-[3/1] bg-gradient-to-r from-primary to-pink-500">
                    {editing ? (
                        <div className="p-4 space-y-2">
                           <Label>Banner Photo URL</Label>
                           <Input value={formData.bannerPhotoUrl || ''} onChange={e=>setFormData({...formData, bannerPhotoUrl: e.target.value})} placeholder="https://..." />
                        </div>
                    ) : user.bannerPhotoUrl && <Image src={user.bannerPhotoUrl} alt="Banner" layout="fill" objectFit="cover" />}
                    
                    {isOwnProfile && !editing && (
                        <div className="absolute top-4 right-4 flex gap-2">
                            <Button onClick={() => setEditing(true)} size="sm">Edit Profile</Button>
                        </div>
                    )}
                     {isOwnProfile && editing && (
                        <div className="absolute top-4 right-4 flex gap-2">
                            <Button onClick={() => setEditing(false)} variant="secondary" size="sm">Cancel</Button>
                            <Button onClick={handleSave} size="sm">Save</Button>
                        </div>
                    )}
                </div>
                <CardContent className="p-4 sm:p-6">
                    <div className="relative">
                        <div className="absolute -top-16 sm:-top-20">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary flex items-center justify-center text-white font-bold border-4 border-card overflow-hidden shadow-lg">
                                {editing ? (
                                    <div className="w-full h-full flex items-center justify-center bg-card">
                                        <Button variant="ghost" size="sm" className="text-xs">Edit Photo</Button>
                                    </div>
                                ) : (user.profilePhotoUrl ? <Image src={user.profilePhotoUrl} alt={user.username} width={128} height={128} className="w-full h-full object-cover" /> : <span className="text-4xl">{user.username?.[0]?.toUpperCase()}</span>)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-10 sm:mt-16">
                        {editing ? <Input value={formData.username || ''} onChange={e=>setFormData({...formData, username: e.target.value})} className="text-2xl font-bold mb-1" /> : <h1 className="text-2xl font-bold">@{user.username}</h1>}
                        
                        <div className="flex flex-wrap gap-2 my-3">
                            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary font-medium text-sm border border-primary/50 capitalize">{user.role}</span>
                            {user.talentCategory && <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium text-sm capitalize">{user.talentCategory}</span>}
                        </div>
                        
                        {editing ? (
                            <>
                                <Textarea value={formData.bio || ''} onChange={e=>setFormData({...formData, bio: e.target.value})} className="text-base mb-4" />
                                <Input value={formData.location || ''} onChange={e=>setFormData({...formData, location: e.target.value})} placeholder="Location" className="text-base" />
                                <div className="mt-4">
                                    <Label>Profile Photo URL</Label>
                                    <Input value={formData.profilePhotoUrl || ''} onChange={e=>setFormData({...formData, profilePhotoUrl: e.target.value})} placeholder="https://..." />
                                </div>
                            </>
                        ) : (
                            <>
                               <p className="text-muted-foreground whitespace-pre-wrap">{user.bio || ''}</p>
                               {user.location && <p className="text-sm text-muted-foreground mt-2">{user.location}</p>}
                            </>
                        )}
                    </div>
                    
                    {editing && user.role === 'artist' ? renderEditArtistFields() : null}
                    {!editing && (Object.keys(socialLinks).length > 0 || extraLinks.length > 0) && <div className="mt-6">{renderSocialLinks()}</div>}

                </CardContent>
            </Card>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
                <h2 className="font-bold text-xl mb-4">Videos</h2>
                {videos.length === 0 ? (
                    <Card className="p-12 bg-card text-center border-dashed">
                        <p className="text-muted-foreground">No videos yet</p>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {videos.map(video => (
                            <Card key={video.id} className="p-4 hover:border-primary transition-all">
                                <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                                    <Sparkles className="w-12 h-12 text-primary" />
                                </div>
                                <p className="font-semibold mb-2 line-clamp-2">{video.description}</p>
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> {video.topCount || 0}</span>
                                    <span>{video.views || 0} views</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {editing && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
                     <Card className="bg-card p-6 border-destructive/50">
                        <h3 className="text-destructive font-bold mb-3">Danger Zone</h3>
                        <p className="text-muted-foreground text-sm mb-4">Deleting your profile is permanent and will remove all your data and videos.</p>
                        <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>Delete Profile</Button>
                    </Card>
                </div>
            )}
            
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDeleteProfile}>Yes, Delete Everything</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
