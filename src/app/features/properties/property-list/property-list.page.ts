import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonText,
  IonSpinner,
  IonChip,
  IonLabel,
  IonSearchbar,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  ToastController,
  ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  home,
  location,
  bed,
  water,
  calendar,
  star,
  search,
  homeOutline,
  addCircle
} from 'ionicons/icons';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../core/models';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-property-list',
  templateUrl: './property-list.page.html',
  styleUrls: ['./property-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonBadge,
    IonText,
    IonSpinner,
    IonChip,
    IonLabel,
    IonSearchbar,
    IonButtons,
    IonRefresher,
    IonRefresherContent
  ]
})
export class PropertyListPage implements OnInit, OnDestroy, ViewWillEnter {
  properties: Property[] = [];
  filteredProperties: Property[] = [];

  isLoading: boolean = true;
  showSearch: boolean = false;

  searchTerm: string = '';
  selectedType: string = 'all';

  private navigationSubscription?: Subscription;

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({
      home,
      location,
      bed,
      water,
      calendar,
      star,
      search,
      homeOutline,
      addCircle
    });
  }

  async ngOnInit() {
    await this.loadProperties();
    
    // Subscribe to navigation events to reload when returning to this page
    this.navigationSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(async (event: any) => {
        if (event.url.includes('/tabs/home')) {
          console.log('Navigation detected - reloading properties');
          await this.loadProperties();
        }
      });
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  /**
   * Ionic lifecycle hook - called every time the page is about to enter
   */
  async ionViewWillEnter() {
    console.log('ionViewWillEnter - reloading properties');
    await this.loadProperties();
  }

  async loadProperties(): Promise<void> {
    try {
      this.isLoading = true;
      this.properties = await this.propertyService.getAll();
      this.filteredProperties = [...this.properties];
      
      // Reapply filters if any are active
      if (this.searchTerm || this.selectedType !== 'all') {
        this.applyFilters();
      }
      
      console.log(`Loaded ${this.properties.length} properties`);
    } catch (error) {
      console.error('Error loading properties:', error);
      await this.showToast('Failed to load properties', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchTerm = '';
      this.applyFilters();
    }
  }

  onSearch(): void {
    this.applyFilters();
  }

  filterByType(type: string): void {
    this.selectedType = type;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.properties];

    // Filter by type
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(p => p.propertyType === this.selectedType);
    }

    // Filter by search term (location or address)
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.location.toLowerCase().includes(searchLower) ||
        p.address.toLowerCase().includes(searchLower) ||
        p.title.toLowerCase().includes(searchLower)
      );
    }

    this.filteredProperties = filtered;
  }

  viewPropertyDetail(propertyId: string): void {
    this.router.navigate(['/property-detail'], {
      queryParams: { id: propertyId }
    });
  }

  bookViewing(propertyId: string, event: Event): void {
    event.stopPropagation();
    
    this.router.navigate(['/booking-form'], {
      queryParams: { propertyId }
    });
  }

  async handleRefresh(event: any): Promise<void> {
    await this.loadProperties();
    event.target.complete();
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