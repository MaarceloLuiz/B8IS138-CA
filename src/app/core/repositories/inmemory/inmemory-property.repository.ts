import { Injectable } from '@angular/core';
import { PropertyRepository } from '../property.repository';
import { Property } from '../../models';

/**
 * In-memory (local) implementation of PropertyRepository
 * uses mock data from JSON file for CA One
 * will be replaced with Firestore implementation in CA Two
 */

@Injectable({
  providedIn: 'root'
})
export class InMemoryPropertyRepository extends PropertyRepository {
  private properties: Property[] = [];

  constructor() {
    super();
    this.loadMockData();
  }

  // load mock properties from JSON file
  private async loadMockData(): Promise<void> {
    try {
      const response = await fetch('assets/mock/properties.json');
      this.properties = await response.json();
    } catch (error) {
      console.error('Error loading mock properties:', error);
      this.properties = [];
    }
  }

  async list(): Promise<Property[]> {
    // make sure data is loaded
    if (this.properties.length === 0) {
      await this.loadMockData();
    }
    return [...this.properties];
  }

  async getById(id: string): Promise<Property | undefined> {
    if (this.properties.length === 0) {
      await this.loadMockData();
    }
    return this.properties.find(p => p.id === id);
  }

  async create(property: Property): Promise<string> {
    // create simple ID for now
    property.id = Date.now().toString();
    property.createdAt = new Date().toISOString();
    this.properties.push(property);
    return property.id;
  }

  async update(id: string, updates: Partial<Property>): Promise<void> {
    const index = this.properties.findIndex(p => p.id === id);
    if (index !== -1) {
      this.properties[index] = {
        ...this.properties[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
  }

  async delete(id: string): Promise<void> {
    this.properties = this.properties.filter(p => p.id !== id);
  }
}