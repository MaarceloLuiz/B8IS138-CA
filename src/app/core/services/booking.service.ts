import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Booking } from '../models';
import { BookingRepository } from '../repositories/booking.repository';
import { InMemoryBookingRepository } from '../repositories/inmemory/inmemory-booking.repository';

/**
 * booking service - business logic
*/
@Injectable({
  providedIn: 'root'
})

export class BookingService {
    private bookingsSubject = new BehaviorSubject<Booking[]>([]);
    public bookings$ = this.bookingsSubject.asObservable();

    constructor(private repository: InMemoryBookingRepository) {}

    // CRUD
    async getAll(): Promise<Booking[]> {
        return this.repository.list();
    }

    async getById(id: string): Promise<Booking | undefined> {
        return this.repository.getById(id);
    }

    async getByUser(userId: string): Promise<Booking[]> {
        const bookings = await this.repository.listByUser(userId);
        this.bookingsSubject.next(bookings);
        return bookings;
    }

    async getByProperty(propertyId: string): Promise<Booking[]> {
        return this.repository.listByProperty(propertyId);
    }

    async create(booking: Booking): Promise<string> {
        const viewingDateTime = new Date(`${booking.viewingDate}T${booking.viewingTime}`); // checking if the date is in the future
        if (viewingDateTime < new Date()) {
            throw new Error('Viewing date and time must be in the future');
        }

        const id = await this.repository.create(booking);

        if (booking.userId) {
            await this.getByUser(booking.userId); // refresh user bookings if id is available
        }

        return id;
    }

    async updateStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<void> {
        await this.repository.update(id, { status });
    }

    async update(id: string, updates: Partial<Booking>): Promise<void> {
        await this.repository.update(id, updates);
    }
     
    async cancel(id: string): Promise<void> {
        await this.updateStatus(id, 'cancelled');
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    // check if the slot is available for visiting
    async isTimeSlotAvailable(propertyId: string, date: string, time: string): Promise<boolean> {
        const bookings = await this.repository.listByProperty(propertyId);
        return !bookings.some(booking => booking.viewingDate === date && booking.viewingTime === time && booking.status !== 'cancelled');
    }
}