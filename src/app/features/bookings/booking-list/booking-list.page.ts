import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  calendar,
  time,
  location,
  home,
  closeCircle,
  documentText,
  search,
  checkmarkCircle,
  alertCircle,
  closeCircleOutline
} from 'ionicons/icons';
import { BookingService } from '../../../core/services/booking.service';
import { PropertyService } from '../../../core/services/property.service';
import { Booking, Property } from '../../../core/models';

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.page.html',
  styleUrls: ['./booking-list.page.scss'],
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
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonLabel
  ]
})
export class BookingListPage implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  properties: Property[] = [];
  isLoading: boolean = true;
  selectedStatus: string = 'all';

  constructor(
    private bookingService: BookingService,
    private propertyService: PropertyService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      calendarOutline,
      calendar,
      time,
      location,
      home,
      closeCircle,
      documentText,
      search,
      checkmarkCircle,
      alertCircle,
      closeCircleOutline
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  // load bookings and properties
  async loadData(): Promise<void> {
    try {
      this.isLoading = true;
      this.bookings = await this.bookingService.getAll();
      this.properties = await this.propertyService.getAll();
      // apply initial filter
      this.filterBookings();
    } catch (error) {
      console.error('Error loading bookings:', error);
      await this.showToast('Failed to load bookings', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  // filter bookings by status
  filterBookings(): void {
    if (this.selectedStatus === 'all') {
      this.filteredBookings = [...this.bookings];
    } else {
      this.filteredBookings = this.bookings.filter(
        booking => booking.status === this.selectedStatus
      );
    }

    // Sort by date (newest first)
    this.filteredBookings.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  onFilterChange(): void {
    this.filterBookings();
  }

  getProperty(propertyId: string): Property | undefined {
    return this.properties.find(p => p.id === propertyId);
  }

  viewProperty(propertyId: string): void {
    this.router.navigate(['/tabs/home/property-detail', propertyId]);
  }

  async cancelBooking(booking: Booking): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Cancel Booking',
      message: 'Are you sure you want to cancel this viewing request?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes, Cancel',
          role: 'destructive',
          handler: async () => {
            await this.performCancellation(booking);
          }
        }
      ]
    });

    await alert.present();
  }

  private async performCancellation(booking: Booking): Promise<void> {
    try {
      await this.bookingService.cancel(booking.id);
      
      booking.status = 'cancelled';
      this.filterBookings();

      await this.showToast('Booking cancelled successfully', 'success');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      await this.showToast('Failed to cancel booking', 'danger');
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending':
        return 'alert-circle';
      case 'confirmed':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'alert-circle';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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