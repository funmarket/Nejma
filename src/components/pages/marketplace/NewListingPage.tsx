"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/toast-provider';
import { MARKETPLACE_SUBCATEGORIES } from '@/lib/nejma/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/use-user';

export function NewListingPage() {
  const { user } = useUser();
  const router = useRouter();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'music', subcategory: '',
    price: '', currency: 'SOL', condition: 'new', location: '',
    images: ['']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { addToast('Please connect wallet first', 'error'); return; }
    if (!formData.title || !formData.price || !formData.subcategory) {
      addToast('Please fill in all required fields', 'error'); return;
    }
    setLoading(true);
    try {
      const imageUrls = formData.images.filter(img => img.trim() !== '');
      await addDoc(collection(db, 'marketplace_products'), {
        sellerWallet: user.walletAddress,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        price: parseFloat(formData.price),
        currency: formData.currency,
        condition: formData.condition,
        location: formData.location,
        images: JSON.stringify(imageUrls),
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        stock: 1,
      });
      addToast('Product listed successfully!', 'success');
      router.push('/marketplace');
    } catch (error) {
      addToast('Failed to create listing', 'error');
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
        <h1 className="text-3xl font-bold text-foreground mb-6">List New Item</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="e.g., Fender Stratocaster Guitar" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={val => setFormData({...formData, category: val, subcategory: ''})}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="acting">Acting</SelectItem>
                  <SelectItem value="creator">Creator/Art</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory *</Label>
              <Select value={formData.subcategory} onValueChange={val => setFormData({...formData, subcategory: val})} required>
                <SelectTrigger><SelectValue placeholder="Select Subcategory" /></SelectTrigger>
                <SelectContent>
                  {MARKETPLACE_SUBCATEGORIES[formData.category]?.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="price">Price *</Label><Input id="price" type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required placeholder="0.00" /></div>
            <div className="space-y-2"><Label htmlFor="currency">Currency *</Label><Select value={formData.currency} onValueChange={val => setFormData({...formData, currency: val})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="SOL">SOL</SelectItem><SelectItem value="USDT">USDT</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label htmlFor="condition">Condition *</Label><Select value={formData.condition} onValueChange={val => setFormData({...formData, condition: val})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="used">Used</SelectItem><SelectItem value="vintage">Vintage</SelectItem><SelectItem value="digital">Digital</SelectItem><SelectItem value="service">Service</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="description">Description *</Label><Textarea id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required rows={5} placeholder="Describe your item..." /></div>
          <div className="space-y-2"><Label htmlFor="location">Location (optional)</Label><Input id="location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="City, Country" /></div>
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
          <div className="flex gap-4 pt-4">
            <Button type="button" onClick={() => router.back()} variant="outline" className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Listing...' : 'List Item'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
