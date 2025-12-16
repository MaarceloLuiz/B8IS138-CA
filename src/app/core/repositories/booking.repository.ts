import { Booking } from '../models';

/**
 * Booking repository interface
 * Defines contract for booking data operations
 */
export interface BookingRepository {
  list(): Promise<Booking[]>;
  getById(id: string): Promise<Booking | undefined>;
  listByUser(userId: string): Promise<Booking[]>;
  listByProperty(propertyId: string): Promise<Booking[]>;
  create(booking: Booking): Promise<string>;
  update(id: string, booking: Partial<Booking>): Promise<void>;
  delete(id: string): Promise<void>;
}