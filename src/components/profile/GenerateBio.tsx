'use client';

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { generateProfileBio, type GenerateProfileBioInput } from '@/ai/flows/generate-profile-bio';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface GenerateBioProps {
  onBioGenerated: (bio: string) => void;
  currentValues?: Partial<GenerateProfileBioInput>;
}

export default function GenerateBio({ onBioGenerated, currentValues }: GenerateBioProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<GenerateProfileBioInput>({
    role: currentValues?.role || 'artist',
    skills: currentValues?.skills || '',
    interests: currentValues?.interests || '',
    style: currentValues?.style || 'professional',
  });
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateProfileBio(formData);
      onBioGenerated(result.bio);
      toast({ title: 'Bio Generated!', description: 'Your new bio has been added to the form.' });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to generate bio:', error);
      toast({ title: 'Error', description: 'Could not generate bio. Please try again.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (field: keyof GenerateProfileBioInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <Wand2 className="mr-2 h-4 w-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Bio with AI</DialogTitle>
          <DialogDescription>
            Provide some details and let AI create a compelling bio for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Role</Label>
            <Input id="role" value={formData.role} onChange={(e) => handleChange('role', e.target.value)} className="col-span-3" placeholder="e.g., artist, musician" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="skills" className="text-right">Skills</Label>
            <Input id="skills" value={formData.skills} onChange={(e) => handleChange('skills', e.target.value)} className="col-span-3" placeholder="e.g., singing, guitar, painting" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="interests" className="text-right">Interests</Label>
            <Input id="interests" value={formData.interests} onChange={(e) => handleChange('interests', e.target.value)} className="col-span-3" placeholder="e.g., sci-fi, hiking, jazz" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="style" className="text-right">Style</Label>
            <Select value={formData.style} onValueChange={(value) => handleChange('style', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="humorous">Humorous</SelectItem>
                <SelectItem value="inspirational">Inspirational</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleGenerate} disabled={isGenerating} type="button">
            {isGenerating ? 'Generating...' : 'Generate Bio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
