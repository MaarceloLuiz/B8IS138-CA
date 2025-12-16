import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { Booking } from '../models';

/**
 * Booking service - Direct Firestore implementation
 */
@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private collectionName = 'bookings';

  constructor(private firestore: Firestore) {}

  async getAll(): Promise<Booking[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, orderBy('createdAt', 'desc'));
    const bookings$ = collectionData(q, { idField: 'id' }) as Observable<Booking[]>;
    return firstValueFrom(bookings$);
  }

  async getById(id: string): Promise<Booking | undefined> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    const booking$ = docData(docRef, { idField: 'id' }) as Observable<Booking>;
    try {
      return await firstValueFrom(booking$);
    } catch {
      return undefined;
    }
  }

  async getByUser(userId: string): Promise<Booking[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const bookings$ = collectionData(q, { idField: 'id' }) as Observable<Booking[]>;
    return firstValueFrom(bookings$);
  }

  async getByPropertyId(propertyId: string): Promise<Booking[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, where('propertyId', '==', propertyId), orderBy('createdAt', 'desc'));
    const bookings$ = collectionData(q, { idField: 'id' }) as Observable<Booking[]>;
    return firstValueFrom(bookings$);
  }

  async create(booking: Omit<Booking, 'id'>): Promise<string> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const docRef = await addDoc(collectionRef, {
      ...booking,
      createdAt: booking.createdAt || new Date().toISOString()
    });
    return docRef.id;
  }

  async update(id: string, booking: Partial<Booking>): Promise<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    await updateDoc(docRef, {
      ...booking,
      updatedAt: new Date().toISOString()
    } as any);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    await deleteDoc(docRef);
  }

  async getByStatus(status: 'pending' | 'confirmed' | 'cancelled'): Promise<Booking[]> {
    const allBookings = await this.getAll();
    return allBookings.filter(b => b.status === status);
  }

  async cancel(id: string): Promise<void> {
    return this.update(id, { status: 'cancelled' });
  }

  async confirm(id: string): Promise<void> {
    return this.update(id, { status: 'confirmed' });
  }
}