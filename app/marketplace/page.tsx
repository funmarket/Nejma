import MarketplaceClient from '@/components/marketplace/MarketplaceClient';
import { TALENT_CATEGORIES, MARKETPLACE_SUBCATEGORIES } from '@/lib/constants';

// This is mock data. In a real application, you would fetch this from a database.
const mockItems = [
  {
    id: '1',
    name: 'Vintage Electric Guitar',
    price: 750,
    category: 'music',
    subcategory: 'Instruments',
    imageUrl: 'https://picsum.photos/seed/guitar/400/300',
    imageHint: 'electric guitar',
    seller: 'RockNRoll',
    sellerAvatar: 'https://picsum.photos/seed/seller1/40/40'
  },
  {
    id: '2',
    name: 'Hamlet Script (Signed)',
    price: 200,
    category: 'acting',
    subcategory: 'Scripts',
    imageUrl: 'https://picsum.photos/seed/script/400/300',
    imageHint: 'theatre script',
    seller: 'DramaQueen',
    sellerAvatar: 'https://picsum.photos/seed/seller2/40/40'
  },
  {
    id: '3',
    name: 'Abstract Canvas Painting',
    price: 450,
    category: 'creator',
    subcategory: 'Painting',
    imageUrl: 'https://picsum.photos/seed/painting/400/300',
    imageHint: 'abstract painting',
    seller: 'Artisan',
    sellerAvatar: 'https://picsum.photos/seed/seller3/40/40'
  },
  {
    id: '4',
    name: 'Professional DJ Turntable',
    price: 1200,
    category: 'music',
    subcategory: 'DJ Gear',
    imageUrl: 'https://picsum.photos/seed/turntable/400/300',
    imageHint: 'dj turntable',
    seller: 'DJSpin',
    sellerAvatar: 'https://picsum.photos/seed/seller4/40/40'
  },
  {
    id: '5',
    name: 'Handmade Leather Journal',
    price: 60,
    category: 'creator',
    subcategory: 'Handmade',
    imageUrl: 'https://picsum.photos/seed/journal/400/300',
    imageHint: 'leather journal',
    seller: 'CraftyCorner',
    sellerAvatar: 'https://picsum.photos/seed/seller5/40/40'
  },
  {
    id: '6',
    name: 'Limited Edition Vinyl Record',
    price: 95,
    category: 'music',
    subcategory: 'Vinyl',
    imageUrl: 'https://picsum.photos/seed/vinyl/400/300',
    imageHint: 'vinyl record',
    seller: 'VinylVibes',
    sellerAvatar: 'https://picsum.photos/seed/seller6/40/40'
  },
];

export default function MarketplacePage() {
  const categories = Object.keys(TALENT_CATEGORIES);
  const subcategories = MARKETPLACE_SUBCATEGORIES;
  
  return <MarketplaceClient items={mockItems} categories={categories} subcategories={subcategories} />;
}
