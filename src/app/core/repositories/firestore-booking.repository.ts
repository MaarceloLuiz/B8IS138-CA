import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  CollectionReference,
  DocumentData
} from '@angular/fire/firestore';
import { BookingRepository } from './booking.repository';
import { Booking } from '../models';

/**
 * Firestore implementation of BookingRepository
 * Handles all booking data operations with Firebase Firestore
 * Part of CA Two requirements
 */
@Injectable({
  providedIn: 'root'
})
export class FirestoreBookingRepository implements BookingRepository {
  private readonly collectionName = 'bookings';
  private bookingsCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.bookingsCollection = collection(this.firestore, this.collectionName);
  }

  /**
   * Get all bookings from Firestore
   */
  async list(): Promise<Booking[]> {
    try {
      const q = query(this.bookingsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.mapDocToBooking(doc.id, doc.data()));
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw error;
    }
  }

  /**
   * Get booking by ID from Firestore
   */
  async getById(id: string): Promise<Booking | undefined> {
    try {
      const docRef = doc(this.firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return this.mapDocToBooking(docSnap.id, docSnap.data());
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting booking by ID:', error);
      throw error;
    }
  }

  /**
   * Get bookings by user ID from Firestore
   */
  async listByUser(userId: string): Promise<Booking[]> {
    try {
      const q = query(
        this.bookingsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.mapDocToBooking(doc.id, doc.data()));
    } catch (error) {
      console.error('Error getting bookings by user ID:', error);
      throw error;
    }
  }

  /**
   * Get bookings by property ID from Firestore
   */
  async listByProperty(propertyId: string): Promise<Booking[]> {
    try {
      const q = query(
        this.bookingsCollection,
        where('propertyId', '==', propertyId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.mapDocToBooking(doc.id, doc.data()));
    } catch (error) {
      console.error('Error getting bookings by property ID:', error);
      throw error;
    }
  }

  /**
   * Create new booking in Firestore
   */
  async create(booking: Booking): Promise<string> {
    try {
      const bookingData = {
        ...booking,
        createdAt: booking.createdAt || new Date().toISOString()
      };

      // Remove id from the data to be saved
      delete (bookingData as any).id;

      const docRef = await addDoc(this.bookingsCollection, bookingData);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Update existing booking in Firestore
   */
  async update(id: string, booking: Partial<Booking>): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.collectionName, id);
      const updateData = {
        ...booking,
        updatedAt: new Date().toISOString()
      };
      
      // Remove id from update data if present
      delete (updateData as any).id;
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  /**
   * Delete booking from Firestore
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }

  /**
   * Map Firestore document to Booking model
   */
  private mapDocToBooking(id: string, data: DocumentData): Booking {
    return {
      id,
      propertyId: data['propertyId'],
      userId: data['userId'],
      name: data['name'],
      email: data['email'],
      phone: data['phone'],
      viewingDate: data['viewingDate'],
      viewingTime: data['viewingTime'],
      notes: data['notes'],
      status: data['status'],
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt']
    };
  }
}