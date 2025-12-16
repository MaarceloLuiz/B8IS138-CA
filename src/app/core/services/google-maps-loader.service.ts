import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Service to dynamically load Google Maps API
 * Prevents exposing API key in index.html
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private scriptLoaded = false;
  private scriptLoadingPromise: Promise<void> | null = null;

  constructor() {}

  loadGoogleMaps(): Promise<void> {
    // If already loaded, return immediately
    if (this.scriptLoaded) {
      return Promise.resolve();
    }

    // If currently loading, return the existing promise
    if (this.scriptLoadingPromise) {
      return this.scriptLoadingPromise;
    }

    // Create new loading promise
    this.scriptLoadingPromise = new Promise<void>((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (typeof google !== 'undefined' && google.maps) {
        this.scriptLoaded = true;
        resolve();
        return;
      }

      // Create script element with API key
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}`;
      script.async = true;
      script.defer = true;

      // Handle successful load
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };

      // Handle load error
      script.onerror = () => {
        this.scriptLoadingPromise = null;
        reject(new Error('Failed to load Google Maps API'));
      };

      // Append script to document
      document.head.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  isLoaded(): boolean {
    return this.scriptLoaded;
  }
}