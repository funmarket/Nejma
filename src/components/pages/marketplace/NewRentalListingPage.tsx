"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/toast-provider';
import { RENTAL_SUBCATEGORIES } from '@/lib/nejma/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/use-user';

export function NewRentalListingPage() {
  const { user } = useUser();
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'music', subCategory: '',
    pricePerDay: '', location: '', availability: '', images: ['']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { addToast('Please connect wallet first', 'error'); return; }
    if (!formData.title || !formData.pricePerDay || !formData.subCategory) {
      addToast('Please fill in all required fields', 'error'); return;
    }
    setLoading(true);
    try {
      const imageUrls = formData.images.filter(img => img.trim() !== '');
      await addDoc(collection(db, 'rentals'), {
        ownerId: user.walletAddress,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subCategory: formData.subCategory,
        pricePerDay: parseFloat(formData.pricePerDay),
        location: formData.location,
        availability: formData.availability,
        images: JSON.stringify(imageUrls),
        status: 'active',
        createdAt: serverTimestamp()
      });
      addToast('Rental listed successfully!', 'success');
      router.push('/marketplace/rental');
    } catch (error) {
      addToast('Failed to create rental listing', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    if (formData.images.length < 5) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    }
  };

  const removeImageField = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  return (
    <div className="min-h-screen pt-6 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">List Rental Item</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2"><Label htmlFor="title">Item Title *</Label><Input id="title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="e.g., Professional Camera Kit" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Category *</Label><Select value={formData.category} onValueChange={val => setFormData({...formData, category: val, subCategory: ''})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{Object.keys(RENTAL_SUBCATEGORIES).map(cat => <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Subcategory *</Label><Select value={formData.subCategory} onValueChange={val => setFormData({...formData, subCategory: val})} required><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{RENTAL_SUBCATEGORIES[formData.category as keyof typeof RENTAL_SUBCATEGORIES]?.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label htmlFor="price">Price Per Day (SOL) *</Label><Input id="price" type="number" step="0.01" value={formData.pricePerDay} onChange={e => setFormData({ ...formData, pricePerDay: e.target.value })} required placeholder="0.00" /></div>
          <div className="space-y-2"><Label htmlFor="description">Description *</Label><Textarea id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required rows={5} placeholder="Describe the rental item..." /></div>
          <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="City, Country" /></div>
          <div className="space-y-2"><Label htmlFor="availability">Availability</Label><Input id="availability" value={formData.availability} onChange={e => setFormData({ ...formData, availability: e.target.value })} placeholder="e.g., Weekdays only" /></div>
          <div className="space-y-2">
            <Label>Image URLs</Label>
            {formData.images.map((img, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input type="url" value={img} onChange={e => handleImageChange(idx, e.target.value)} placeholder="https://example.com/image.jpg" />
                {formData.images.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeImageField(idx)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
              </div>
            ))}
            {formData.images.length < 5 && <Button type="button" variant="outline" onClick={addImageField} className="mt-2 text-sm"><Plus className="w-4 h-4 mr-2"/> Add another image</Button>}
          </div>
          <div className="flex gap-4 pt-4"><Button type="button" onClick={() => router.back()} variant="outline" className="flex-1">Cancel</Button><Button type="submit" disabled={loading} className="flex-1">{loading ? 'Listing...' : 'List Rental'}</Button></div>
        </form>
      </div>
    </div>
  );
}
