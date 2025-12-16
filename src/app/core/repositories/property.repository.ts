import { Property } from '../models';

/**
 * Property repository interface
 * Defines contract for property data operations
 */
export interface PropertyRepository {
  list(): Promise<Property[]>;
  getById(id: string): Promise<Property | undefined>;
  create(property: Property): Promise<string>;
  update(id: string, property: Partial<Property>): Promise<void>;
  delete(id: string): Promise<void>;
}