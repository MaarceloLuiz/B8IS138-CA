import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { environment } from '../../../../environments/environment';
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
  ActionSheetController,
  AlertController,
  ViewWillEnter
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
  resize,
  trash,
  create
} from 'ionicons/icons';
import { PropertyService } from '../../../core/services/property.service';
import { AuthService } from '../../../core/services/auth.service';
import { Property } from '../../../core/models';
import { GoogleMapsModule } from '@angular/google-maps';
import { GoogleMapsLoaderService } from '../../../core/services/google-maps-loader.service';

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.page.html',
  styleUrls: ['./property-detail.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
export class PropertyDetailPage implements OnInit, ViewWillEnter {
  property: Property | undefined;
  isLoading: boolean = true;
  propertyId: string = '';
  isOwner: boolean = false;

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
    private authService: AuthService,
    private googleMapsLoader: GoogleMapsLoaderService,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController
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
      resize,
      trash,
      create
    });
  }

  async ngOnInit() {
    const propertyId = this.route.snapshot.queryParamMap.get('id');
    
    if (propertyId) {
      this.propertyId = propertyId;
      await this.loadPropertyData();
    }
  }

  /**
   * Ionic lifecycle hook - reload property when returning to page
   */
  async ionViewWillEnter() {
    console.log('ionViewWillEnter - reloading property details');
    if (this.propertyId) {
      await this.loadPropertyData();
    }
  }

  /**
   * Load property and map data
   */
  private async loadPropertyData(): Promise<void> {
    await this.loadProperty(this.propertyId);
    
    if (this.property) {
      if (this.property.latitude && this.property.longitude) {
        await this.loadMap();
      } else {
        await this.geocodeAndLoadMap();
      }
    }
  }

  /**
   * Geocode the property address and load the map
   */
  private async geocodeAndLoadMap(): Promise<void> {
    if (!this.property) return;

    try {
      const address = this.property.eircode || this.property.address;
      
      if (!address) {
        console.log('No address or eircode available for geocoding');
        return;
      }

      const apiKey = environment.googleMapsApiKey;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        
        this.property.latitude = location.lat;
        this.property.longitude = location.lng;
        
        await this.loadMap();
        
        console.log('Map loaded with geocoded coordinates:', location);
      } else {
        console.log('Could not geocode address:', data.status);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }

  /**
   * Load property details from Firestore
   */
  async loadProperty(propertyId: string): Promise<void> {
    try {
      this.isLoading = true;
      this.property = await this.propertyService.getById(propertyId);
      
      if (!this.property) {
        await this.showToast('Property not found', 'danger');
        this.router.navigate(['/tabs/home']);
      } else {
        // Check if current user is the owner
        const currentUser = this.authService.currentUser;
        this.isOwner = currentUser ? this.property.createdBy === currentUser.uid : false;
        console.log('Property loaded:', this.property.title);
      }
    } catch (error) {
      console.error('Error loading property:', error);
      await this.showToast('Failed to load property details', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

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

  /**
   * Edit the property (navigate to edit form)
   */
  editProperty(): void {
    this.router.navigate(['/property-create'], {
      queryParams: { id: this.propertyId, mode: 'edit' }
    });
  }

  /**
   * Delete the property with confirmation
   */
  async deleteProperty(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Property',
      message: 'Are you sure you want to delete this property? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await this.propertyService.delete(this.propertyId);
              await this.showToast('Property deleted successfully', 'success');
              this.router.navigate(['/tabs/home']);
            } catch (error) {
              console.error('Error deleting property:', error);
              await this.showToast('Failed to delete property', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
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