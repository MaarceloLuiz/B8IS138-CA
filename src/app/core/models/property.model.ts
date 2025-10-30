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
}