import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, orderBy } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { Property } from '../models';

/**
 * Property service - Direct Firestore implementation
 */
@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private collectionName = 'properties';

  constructor(private firestore: Firestore) {}

  async getAll(): Promise<Property[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, orderBy('createdAt', 'desc'));
    const properties$ = collectionData(q, { idField: 'id' }) as Observable<Property[]>;
    return firstValueFrom(properties$);
  }

  async getById(id: string): Promise<Property | undefined> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    const property$ = docData(docRef, { idField: 'id' }) as Observable<Property>;
    try {
      return await firstValueFrom(property$);
    } catch {
      return undefined;
    }
  }

  async create(property: Omit<Property, 'id'>): Promise<string> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const docRef = await addDoc(collectionRef, {
      ...property,
      createdAt: property.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  }

  async update(id: string, property: Partial<Property>): Promise<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    await updateDoc(docRef, {
      ...property,
      updatedAt: new Date().toISOString()
    } as any);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    await deleteDoc(docRef);
  }

  async getByType(type: 'house' | 'apartment' | 'studio'): Promise<Property[]> {
    const allProperties = await this.getAll();
    return allProperties.filter(p => p.propertyType === type);
  }

  async getFeatured(): Promise<Property[]> {
    const allProperties = await this.getAll();
    return allProperties.filter(p => p.isFeatured === true);
  }

  async searchByLocation(location: string): Promise<Property[]> {
    const allProperties = await this.getAll();
    const searchTerm = location.toLowerCase();
    return allProperties.filter(p => 
      p.location.toLowerCase().includes(searchTerm) ||
      p.address.toLowerCase().includes(searchTerm)
    );
  }
}