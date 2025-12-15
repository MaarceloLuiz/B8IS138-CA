import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonBadge,
  IonText,
  IonSpinner,
  IonChip,
  IonLabel,
  ToastController,
  ActionSheetController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  location,
  bed,
  water,
  home,
  star,
  calendar,
  shareSocial,
  alertCircleOutline,
  map,
  personCircle,
  call,
  mail,
  resize
} from 'ionicons/icons';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models';
import { GoogleMapsModule } from '@angular/google-maps';
import { GoogleMapsLoaderService } from '../../../core/services/google-maps-loader.service';

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.page.html',
  styleUrls: ['./property-detail.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // For Swiper
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonBadge,
    IonText,
    IonSpinner,
    IonChip,
    IonLabel,
    GoogleMapsModule
  ]
})
export class PropertyDetailPage implements OnInit {
  property: Property | undefined;
  isLoading: boolean = true;
  propertyId: string = '';

  // Google Maps properties
  mapLoaded: boolean = false;
  mapCenter: google.maps.LatLngLiteral = { lat: 53.3498, lng: -6.2603 };
  mapZoom: number = 15;
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 18,
    minZoom: 10,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
  };

  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private googleMapsLoader: GoogleMapsLoaderService,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {
    addIcons({
      location,
      bed,
      water,
      home,
      star,
      calendar,
      shareSocial,
      alertCircleOutline,
      map,
      personCircle,
      call,
      mail,
      resize
    });
  }

  // Get property ID from query params
  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.propertyId = params['id'];
      if (this.propertyId) {
        await this.loadProperty();
        
        // Load Google Maps if property has coordinates
        if (this.property?.latitude && this.property?.longitude) {
          await this.loadMap();
        }
      } else {
        this.isLoading = false;
      }
    });
  }

  async loadProperty(): Promise<void> {
    try {
      this.isLoading = true;
      this.property = await this.propertyService.getById(this.propertyId);
      
      if (!this.property) {
        await this.showToast('Property not found', 'danger');
      }
    } catch (error) {
      console.error('Error loading property:', error);
      await this.showToast('Failed to load property details', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load Google Maps API and center on property location
   */
  private async loadMap(): Promise<void> {
    try {
      await this.googleMapsLoader.loadGoogleMaps();
      this.mapLoaded = true;
      
      if (this.property?.latitude && this.property?.longitude) {
        this.mapCenter = {
          lat: this.property.latitude,
          lng: this.property.longitude
        };
      }
    } catch (error) {
      console.error('Error loading map:', error);
      await this.showToast('Failed to load map', 'warning');
    }
  }

  /**
   * Get property marker position for Google Maps
   */
  getPropertyPosition(): google.maps.LatLngLiteral | undefined {
    if (this.property?.latitude && this.property?.longitude) {
      return {
        lat: this.property.latitude,
        lng: this.property.longitude
      };
    }
    return undefined;
  }

  bookViewing(): void {
    if (this.property) {
      this.router.navigate(['/booking-form'], {
        queryParams: { propertyId: this.property.id }
      });
    }
  }

  async shareProperty(): Promise<void> {
    if (!this.property) return;

    const actionSheet = await this.actionSheetController.create({
      header: 'Share Property',
      buttons: [
        {
          text: 'Copy Link',
          icon: 'link',
          handler: () => {
            this.copyPropertyLink();
          }
        },
        {
          text: 'Share via Email',
          icon: 'mail',
          handler: () => {
            this.shareViaEmail();
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  private async copyPropertyLink(): Promise<void> {
    const url = `${window.location.origin}/property-detail?id=${this.propertyId}`;
    
    try {
      await navigator.clipboard.writeText(url);
      await this.showToast('Link copied to clipboard!', 'success');
    } catch (error) {
      console.error('Failed to copy link:', error);
      await this.showToast('Failed to copy link', 'danger');
    }
  }

  private shareViaEmail(): void {
    if (!this.property) return;

    const subject = encodeURIComponent(`Check out this property: ${this.property.title}`);
    const body = encodeURIComponent(
      `I found this property that might interest you:\n\n` +
      `${this.property.title}\n` +
      `Location: ${this.property.location}\n` +
      `Price: €${this.property.price}\n` +
      `Bedrooms: ${this.property.bedrooms}\n` +
      `Bathrooms: ${this.property.bathrooms}\n\n` +
      `View details: ${window.location.origin}/property-detail?id=${this.propertyId}`
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }
}