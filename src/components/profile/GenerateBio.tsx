'use client';

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateBio } from '@/ai';
import type { GenerateBioInput } from '@/ai/flows/generate-bio.types';

interface GenerateBioProps {
  onBioGenerated: (bio: string) => void;
  currentValues: {
    role: string;
    skills: string;
    interests: string;
  };
}

export default function GenerateBio({ onBioGenerated, currentValues }: GenerateBioProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState(currentValues.skills);
  const [interests, setInterests] = useState(currentValues.interests);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateBio({
        role: currentValues.role,
        skills,
        interests,
      });
      if (result) {
        onBioGenerated(result);
        setIsOpen(false);
        toast({ title: 'Bio generated successfully!' });
      } else {
        throw new Error('Bio generation failed.');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Could not generate bio. Please check your API key.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-primary hover:text-primary"
      >
        <Wand2 className="mr-2 h-4 w-4" />
        Generate with AI
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Bio with AI</DialogTitle>
            <DialogDescription>
              Provide some details, and we'll craft a bio for you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="skills">Skills or Talents</label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., Singer, Guitarist, Comedian"
              />
            </div>
            <div>
              <label htmlFor="interests">Interests or Style</label>
              <Input
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g., Lo-fi beats, Abstract art, Improv comedy"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
