import { Booking } from '../models';

/**
 * Booking repository interface
 * can swap between in-memory and Firestore (CA2 db) implementations
*/

export abstract class BookingRepository {
  abstract list(): Promise<Booking[]>;
  abstract getById(id: string): Promise<Booking | undefined>;
  abstract listByUser(userId: string): Promise<Booking[]>; 
  abstract listByProperty(propertyId: string): Promise<Booking[]>;
  abstract create(booking: Booking): Promise<string>;
  abstract update(id: string, booking: Partial<Booking>): Promise<void>;
  abstract delete(id: string): Promise<void>;
}