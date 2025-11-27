'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TALENT_CATEGORIES, MARKETPLACE_SUBCATEGORIES } from '@/lib/constants';
import { createMarketplaceItem } from '@/lib/actions/marketplace.actions';

export default function ListItemForm() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [category, setCategory] = useState<string>('');
    const [subcategory, setSubcategory] = useState<string>('');
    const currentSubcategories = category ? MARKETPLACE_SUBCATEGORIES[category as keyof typeof MARKETPLACE_SUBCATEGORIES] || [] : [];


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentUser) {
            addToast('You must be logged in.', 'error');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const itemData = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string),
            category: formData.get('category') as string,
            subcategory: formData.get('subcategory') as string,
            imageUrl: formData.get('imageUrl') as string,
            sellerId: currentUser.userId,
        };

        if (isNaN(itemData.price) || itemData.price <= 0) {
            addToast('Please enter a valid price.', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            await createMarketplaceItem(itemData);
            addToast('Your item has been listed.', 'success');
            router.push('/marketplace');
        } catch (error) {
            console.error('Error listing item:', error);
            addToast('Could not list your item.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentUser) {
         return (
            <div className="min-h-screen flex items-center justify-center text-center p-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Please Log In</h2>
                    <p className="text-gray-400 mb-6">You need to be logged in to list an item.</p>
                    <Button onClick={() => router.push('/onboarding')}>Login / Sign Up</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                        List an Item
                    </h1>
                    <p className="text-muted-foreground mt-2">Share your creations, gear, and more with the community.</p>
                </div>

                <div className="bg-muted/50 rounded-xl border border-border p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="name">Item Name *</Label>
                            <Input id="name" name="name" required placeholder="e.g., Vintage Electric Guitar" />
                        </div>

                        <div>
                            <Label htmlFor="price">Price (USD) *</Label>
                            <Input id="price" name="price" type="number" step="0.01" required placeholder="e.g., 750.00" />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Select name="category" required onValueChange={setCategory}>
                                    <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(TALENT_CATEGORIES).map(cat => (
                                            <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <Label htmlFor="subcategory">Subcategory *</Label>
                                <Select name="subcategory" required value={subcategory} onValueChange={setSubcategory} disabled={!category}>
                                    <SelectTrigger id="subcategory"><SelectValue placeholder="Select a subcategory" /></SelectTrigger>
                                    <SelectContent>
                                        {currentSubcategories.map(sub => (
                                            <SelectItem key={sub} value={sub} className="capitalize">{sub}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" placeholder="Tell everyone about your item..." />
                        </div>

                        <div>
                            <Label htmlFor="imageUrl">Image URL *</Label>
                            <Input id="imageUrl" name="imageUrl" required placeholder="https://picsum.photos/..." />
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                             <Button onClick={() => router.back()} variant="secondary" className="flex-1" type="button" disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isSubmitting}>
                                {isSubmitting ? 'Listing Item...' : 'List Item'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
