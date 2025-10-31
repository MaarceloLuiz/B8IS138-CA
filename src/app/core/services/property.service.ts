import { Injectable } from '@angular/core';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { Property } from '../models';
import { PropertyRepository } from '../repositories/property.repository';
import { InMemoryPropertyRepository } from '../repositories/inmemory/inmemory-property.repository';

/**
 * property service - business logic
 * user repository pattern for data access
*/
@Injectable({
  providedIn: 'root'
})  

export class PropertyService {
    private propertiesSubject = new BehaviorSubject<Property[]>([]);
    public properties$ = this.propertiesSubject.asObservable();

    constructor(private repository: InMemoryPropertyRepository) {
        this.loadProperties();
    }

    private async loadProperties(): Promise<void> {
        try {
            const properties = await this.repository.list();
            this.propertiesSubject.next(properties);
        } catch (error) {
            console.error('Failed to load properties', error);
            this.propertiesSubject.next([]);
        }
    }

    // CRUD and filters
    async getAll(): Promise<Property[]> {
        return this.repository.list();
    }

    async getById(id: string): Promise<Property | undefined> {
        return this.repository.getById(id);
    }

    async getFeatured(): Promise<Property[]> {
        const properties = await this.repository.list();
        return properties.filter(p => p.isFeatured);
    }

    async search(criteria: {
        minPrice?: number;
        maxPrice?: number;
        bedrooms?: number;
        propertyType?: string;
        location?: string;
    }): Promise<Property[]> {
        let properties = await this.repository.list();

        if (criteria.minPrice) {
            properties = properties.filter(p => p.price >= criteria.minPrice!);
        }
        if (criteria.maxPrice) {
            properties = properties.filter(p => p.price <= criteria.maxPrice!);
        }
        if (criteria.bedrooms) {
            properties = properties.filter(p => p.bedrooms === criteria.bedrooms!);
        }
        if (criteria.propertyType) {
            properties = properties.filter(p => p.propertyType === criteria.propertyType);
        }
        if (criteria.location) {
            const searchTerm = criteria.location.toLowerCase();
            properties = properties.filter(p => p.location.toLowerCase().includes(searchTerm) || p.address.toLowerCase().includes(searchTerm));
        }

        return properties;
    }

    // CA2 - admins can create new property
    async create(property: Property): Promise<string> {
        const id = await this.repository.create(property);
        await this.loadProperties(); // refresh list after its done
        return id;
    }

    async update(id: string, updates: Partial<Property>): Promise<void> {
        await this.repository.update(id, updates);
        await this.loadProperties();
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
        await this.loadProperties();
    }

    async refresh(): Promise<void> {
        await this.loadProperties();
    }
}