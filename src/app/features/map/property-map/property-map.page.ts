import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bed, water, resize, arrowForward, close } from 'ionicons/icons';
import { PropertyService } from '../../../core/services/property.service';
import { GoogleMapsLoaderService } from '../../../core/services/google-maps-loader.service';
import { Property } from '../../../core/models';

/**
 * Map page component
 * Displays properties on Google Maps with interactive markers
 * Part of CA Two requirements
 */
@Component({
  selector: 'app-map',
  templateUrl: './property-map.page.html',
  styleUrls: ['./property-map.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GoogleMapsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon
  ]
})
export class PropertyMapPage implements OnInit {
  properties: Property[] = [];
  selectedProperty: Property | null = null;
  isLoading: boolean = true;
  mapLoaded: boolean = false;

  // Map configuration
  mapCenter: google.maps.LatLngLiteral = { lat: 53.3498, lng: -6.2603 }; // Default to Dublin
  mapZoom: number = 12;
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 18,
    minZoom: 8,
    streetViewControl: false,
    fullscreenControl: true,
    mapTypeControl: false,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP
  };

  constructor(
    private propertyService: PropertyService,
    private googleMapsLoader: GoogleMapsLoaderService,
    private router: Router
  ) {
    addIcons({ bed, water, resize, arrowForward, close });
  }

  async ngOnInit() {
    await this.initializeMap();
  }

  private async initializeMap(): Promise<void> {
    try {
      this.isLoading = true;

      // Load Google Maps API
      await this.googleMapsLoader.loadGoogleMaps();
      this.mapLoaded = true;

      // Load properties
      await this.loadProperties();
    } catch (error) {
      console.error('Error initializing map:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Load all properties with coordinates
  private async loadProperties(): Promise<void> {
    try {
      const allProperties = await this.propertyService.getAll();
      this.properties = allProperties.filter(p => p.latitude !== undefined && p.longitude !== undefined);
      console.log('Loaded properties with coordinates:', this.properties.length);

      if (this.properties.length > 0 && this.properties[0].latitude && this.properties[0].longitude) {
        this.mapCenter = {
          lat: this.properties[0].latitude,
          lng: this.properties[0].longitude
        };
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  }

  // Get marker position for a property
  getMarkerPosition(property: Property): google.maps.LatLngLiteral {
    return {
      lat: property.latitude!,
      lng: property.longitude!
    };
  }

  // Handle marker click event
  onMarkerClick(property: Property): void {
    this.selectedProperty = property;
    
    // Center map on selected property
    if (property.latitude && property.longitude) {
      this.mapCenter = {
        lat: property.latitude,
        lng: property.longitude
      };
      this.mapZoom = 15;
    }
  }

  // Close property info card
  closePropertyCard(): void {
    this.selectedProperty = null;
    this.mapZoom = 12;
  }

  viewPropertyDetails(propertyId: string): void {
    this.router.navigate(['/property', propertyId]);
  }
}