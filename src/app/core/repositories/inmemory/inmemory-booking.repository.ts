import { Injectable } from '@angular/core';
import { BookingRepository } from '../booking.repository';
import { Booking } from '../../models';

/**
 * In-memory (local) implementation of BookingRepository
 * stores bookings in memory for CA One
 * it's gonna be replaced by Firestore implementation in CA Two
 */

@Injectable({
  providedIn: 'root'
})
export class InMemoryBookingRepository extends BookingRepository {
  private bookings: Booking[] = [];

  async list(): Promise<Booking[]> {
    return [...this.bookings];
  }

  async getById(id: string): Promise<Booking | undefined> {
    return this.bookings.find(b => b.id === id);
  }

  async listByUser(userId: string): Promise<Booking[]> {
    return this.bookings.filter(b => b.userId === userId);
  }

  async listByProperty(propertyId: string): Promise<Booking[]> {
    return this.bookings.filter(b => b.propertyId === propertyId);
  }

  async create(booking: Booking): Promise<string> {
    booking.id = Date.now().toString();
    booking.createdAt = new Date().toISOString();
    booking.status = 'pending';
    this.bookings.push(booking);
    return booking.id;
  }

  async update(id: string, updates: Partial<Booking>): Promise<void> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.bookings[index] = {
        ...this.bookings[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
  }

  async delete(id: string): Promise<void> {
    this.bookings = this.bookings.filter(b => b.id !== id);
  }
}