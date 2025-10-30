import { Property } from '../models';

/**
 * Property repository interface
 * can change between in-memory and Firestore (CA2) implementations
*/

export abstract class PropertyRepository {
  abstract list(): Promise<Property[]>;
  abstract getById(id: string): Promise<Property | undefined>;
  abstract create(property: Property): Promise<string>;
  abstract update(id: string, property: Partial<Property>): Promise<void>;
  abstract delete(id: string): Promise<void>;
}