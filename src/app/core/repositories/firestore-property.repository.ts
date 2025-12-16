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
  orderBy,
  CollectionReference,
  DocumentData
} from '@angular/fire/firestore';
import { PropertyRepository } from './property.repository';
import { Property } from '../models';

/**
 * Firestore implementation of PropertyRepository
 * Handles all property data operations with Firebase Firestore
 * Part of CA Two requirements
 */
@Injectable({
  providedIn: 'root'
})
export class FirestorePropertyRepository implements PropertyRepository {
  private readonly collectionName = 'properties';
  private propertiesCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.propertiesCollection = collection(this.firestore, this.collectionName);
  }

  /**
   * Get all properties from Firestore
   */
  async list(): Promise<Property[]> {
    try {
      const q = query(this.propertiesCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.mapDocToProperty(doc.id, doc.data()));
    } catch (error) {
      console.error('Error getting properties:', error);
      throw error;
    }
  }

  /**
   * Get property by ID from Firestore
   */
  async getById(id: string): Promise<Property | undefined> {
    try {
      const docRef = doc(this.firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return this.mapDocToProperty(docSnap.id, docSnap.data());
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting property by ID:', error);
      throw error;
    }
  }

  /**
   * Create new property in Firestore
   */
  async create(property: Property): Promise<string> {
    try {
      const propertyData = {
        ...property,
        createdAt: property.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Remove id from the data to be saved
      delete (propertyData as any).id;

      const docRef = await addDoc(this.propertiesCollection, propertyData);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  /**
   * Update existing property in Firestore
   */
  async update(id: string, property: Partial<Property>): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.collectionName, id);
      const updateData = {
        ...property,
        updatedAt: new Date().toISOString()
      };
      
      // Remove id from update data if present
      delete (updateData as any).id;
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  /**
   * Delete property from Firestore
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  /**
   * Map Firestore document to Property model
   */
  private mapDocToProperty(id: string, data: DocumentData): Property {
    return {
      id,
      title: data['title'],
      description: data['description'],
      price: data['price'],
      location: data['location'],
      address: data['address'],
      eircode: data['eircode'],
      bedrooms: data['bedrooms'],
      bathrooms: data['bathrooms'],
      areaSqm: data['areaSqm'],
      propertyType: data['propertyType'],
      images: data['images'] || [],
      agentName: data['agentName'],
      agentPhone: data['agentPhone'],
      agentEmail: data['agentEmail'],
      latitude: data['latitude'],
      longitude: data['longitude'],
      createdBy: data['createdBy'],
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt'],
      isFeatured: data['isFeatured'] || false
    };
  }
}