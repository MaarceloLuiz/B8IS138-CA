/**
 * Property model representing a real estate listing
*/

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  eircode?: string; // optional

  bedrooms: number;
  bathrooms: number;
  areaSqm: number; // area in square meters
  propertyType: 'house' | 'apartment' | 'studio';
  images: string[]; // array of image URLs

  agentName: string;
  agentPhone: string;
  agentEmail: string;

  // map coordinates (CA2 - google maps API)
  latitude?: number;
  longitude?: number;

  createdBy: string; // user ID
  createdAt: string;
  updatedAt?: string;
  isFeatured?: boolean;
}