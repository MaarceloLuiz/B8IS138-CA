import { Injectable } from '@angular/core';
import { BookingRepository } from '../booking.repository';
import { Booking } from '../../models';

/**
 * uses LOCALSTORAGE for persistence during development
 * will be replaced with Firestore in CA Two
 */
@Injectable({
  providedIn: 'root'
})
export class InMemoryBookingRepository implements BookingRepository {
  private readonly STORAGE_KEY = 'app_bookings';
  private bookings: Booking[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.bookings = JSON.parse(stored);
        console.log('Loaded bookings from localStorage:', this.bookings.length);
      } else {
        this.bookings = [];
      }
    } catch (error) {
      console.error('Error loading bookings from localStorage:', error);
      this.bookings = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.bookings));
      console.log('Saved bookings to localStorage:', this.bookings.length);
    } catch (error) {
      console.error('Error saving bookings to localStorage:', error);
    }
  }

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
    // Add the new booking
    this.bookings.push(booking);
    
    // Save to localStorage
    this.saveToStorage();
    
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
      
      this.saveToStorage();
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.bookings.splice(index, 1);
      
      this.saveToStorage();
    }
  }
}