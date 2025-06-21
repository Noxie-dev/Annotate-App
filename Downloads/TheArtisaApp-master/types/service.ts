/**
 * Service interface representing a service offered by an artisan
 */
export interface Service {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  category: ServiceCategory;
  tags: string[];
  artisan: Artisan;
}

/**
 * Service category enum
 */
export enum ServiceCategory {
  PLUMBING = 'Plumbing',
  ELECTRICAL = 'Electrical',
  CARPENTRY = 'Carpentry',
  PAINTING = 'Painting',
  CLEANING = 'Cleaning',
  GARDENING = 'Gardening',
  MOVING = 'Moving',
  OTHER = 'Other',
}

/**
 * Artisan interface representing a service provider
 */
export interface Artisan {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
}
