import { Artisan, Service, ServiceCategory } from '@/types/service';

/**
 * Mock artisans data
 */
export const artisans: Artisan[] = [
  {
    id: 'art1',
    name: 'John Doe',
    avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    rating: 4.8,
    reviewCount: 127,
    verified: true,
  },
  {
    id: 'art2',
    name: 'Jane Smith',
    avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
    rating: 4.9,
    reviewCount: 84,
    verified: true,
  },
  {
    id: 'art3',
    name: 'Robert Johnson',
    avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
    rating: 4.7,
    reviewCount: 56,
    verified: false,
  },
  {
    id: 'art4',
    name: 'Emily Davis',
    avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
    rating: 4.6,
    reviewCount: 42,
    verified: true,
  },
];

/**
 * Mock services data
 */
export const services: Service[] = [
  {
    id: 'serv1',
    title: 'Professional Plumbing Services',
    description: 'Expert plumbing services for residential and commercial properties. Available 24/7 for emergencies.',
    imageUrl: 'https://images.unsplash.com/photo-1606093310360-f0e937951ede',
    price: 75,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 127,
    category: ServiceCategory.PLUMBING,
    tags: ['emergency', 'residential', 'commercial'],
    artisan: artisans[0],
  },
  {
    id: 'serv2',
    title: 'Electrical Installation & Repair',
    description: 'Licensed electrician providing installation and repair services for all electrical systems.',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e',
    price: 90,
    currency: 'USD',
    rating: 4.9,
    reviewCount: 84,
    category: ServiceCategory.ELECTRICAL,
    tags: ['installation', 'repair', 'emergency'],
    artisan: artisans[1],
  },
  {
    id: 'serv3',
    title: 'Custom Carpentry Solutions',
    description: 'Skilled carpenter offering custom furniture building, repairs, and installations.',
    imageUrl: 'https://images.unsplash.com/photo-1601564921647-b446262bbc6c',
    price: 65,
    currency: 'USD',
    rating: 4.7,
    reviewCount: 56,
    category: ServiceCategory.CARPENTRY,
    tags: ['custom', 'furniture', 'repair'],
    artisan: artisans[2],
  },
  {
    id: 'serv4',
    title: 'Professional Painting Services',
    description: 'Interior and exterior painting services with attention to detail and quality finishes.',
    imageUrl: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09',
    price: 50,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 42,
    category: ServiceCategory.PAINTING,
    tags: ['interior', 'exterior', 'residential'],
    artisan: artisans[3],
  },
  {
    id: 'serv5',
    title: 'Deep Cleaning Services',
    description: 'Thorough cleaning services for homes and offices using eco-friendly products.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
    price: 45,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 93,
    category: ServiceCategory.CLEANING,
    tags: ['deep clean', 'eco-friendly', 'residential'],
    artisan: artisans[0],
  },
  {
    id: 'serv6',
    title: 'Landscape Gardening',
    description: 'Professional garden design, maintenance, and landscaping services.',
    imageUrl: 'https://images.unsplash.com/photo-1599685315640-4cbebf7f077a',
    price: 60,
    currency: 'USD',
    rating: 4.9,
    reviewCount: 71,
    category: ServiceCategory.GARDENING,
    tags: ['landscaping', 'maintenance', 'design'],
    artisan: artisans[1],
  },
];

/**
 * Get featured services (top 3 by rating)
 */
export const getFeaturedServices = (): Service[] => {
  return [...services]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
};

/**
 * Get services by category
 */
export const getServicesByCategory = (category: ServiceCategory): Service[] => {
  return services.filter(service => service.category === category);
};

/**
 * Get all service categories with count
 */
export const getServiceCategories = (): { category: ServiceCategory; count: number }[] => {
  const categories = Object.values(ServiceCategory);
  return categories.map(category => ({
    category,
    count: services.filter(service => service.category === category).length,
  }));
};
