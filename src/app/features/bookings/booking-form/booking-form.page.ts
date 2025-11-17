import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonSpinner,
  IonCheckbox,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  person,
  calendar,
  location,
  alertCircleOutline,
  informationCircle
} from 'ionicons/icons';
import { PropertyService } from '../../../core/services/property.service';
import { BookingService } from '../../../core/services/booking.service';
import { Property, Booking } from '../../../core/models';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.page.html',
  styleUrls: ['./booking-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonSpinner,
    IonCheckbox,
    IonDatetime,
    IonDatetimeButton,
    IonModal
  ]
})
export class BookingFormPage implements OnInit {
  property: Property | undefined;
  isLoading: boolean = true;
  propertyId: string = '';
  agreedToTerms: boolean = false;

  emailError: string = '';
  phoneError: string = '';

  minDate: string = '';
  maxDate: string = '';

  bookingData = {
    viewingDate: new Date().toISOString(),
    viewingTime: '',
    name: '',
    email: '',
    phone: '',
    notes: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private bookingService: BookingService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    // Register icons
    addIcons({
      person,
      calendar,
      location,
      alertCircleOutline,
      informationCircle
    });

    // Set date constraints (today to 3 months from now)
    const today = new Date();
    this.minDate = today.toISOString();
    
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    this.maxDate = maxDate.toISOString();
  }

  async ngOnInit() {
    // Get property ID from query params
    this.route.queryParams.subscribe(async params => {
      this.propertyId = params['propertyId'];
      if (this.propertyId) {
        await this.loadProperty();
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
   * Handle date change
   */
  onDateChange(): void {
    console.log('Selected date:', this.bookingData.viewingDate);
  }

  /**
   * Validate email format
   */
  validateEmail(): void {
    const email = this.bookingData.email.trim();
    if (!email) {
      this.emailError = '';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.emailError = 'Please enter a valid email address';
    } else {
      this.emailError = '';
    }
  }

  /**
   * Handle phone input - only allow numbers and common phone characters
   */
  onPhoneInput(event: any): void {
    const input = event.target.value;
    // Allow only numbers, spaces, +, -, (, )
    const cleaned = input.replace(/[^0-9+\-() ]/g, '');
    this.bookingData.phone = cleaned;
  }

  validatePhone(): void {
    const phone = this.bookingData.phone.trim();
    if (!phone) {
      this.phoneError = '';
      return;
    }

    // remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (digitsOnly.length < 7) {
      this.phoneError = 'Phone number is too short';
    } else if (digitsOnly.length > 15) {
      this.phoneError = 'Phone number is too long';
    } else {
      this.phoneError = '';
    }
  }

  isFormValid(): boolean {
    const hasValidEmail = this.bookingData.email.trim() && !this.emailError;
    const hasValidPhone = this.bookingData.phone.trim() && !this.phoneError;

    return !!(
      this.bookingData.viewingDate &&
      this.bookingData.viewingTime &&
      this.bookingData.name.trim() &&
      hasValidEmail &&
      hasValidPhone &&
      this.agreedToTerms
    );
  }

  async submitBooking(): Promise<void> {
    if (!this.isFormValid()) {
      await this.showToast('Please fill in all required fields', 'warning');
      return;
    }

    if (!this.property) {
      await this.showToast('Property information is missing', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirm Booking',
      message: `Book a viewing for ${this.property.title} on ${this.formatDate(this.bookingData.viewingDate)} at ${this.formatTime(this.bookingData.viewingTime)}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: async () => {
            await this.createBooking();
          }
        }
      ]
    });

    await alert.present();
  }

  private async createBooking(): Promise<void> {
    try {
      if (!this.property) return;

      // booking object
      const booking: Omit<Booking, 'id'> = {
        propertyId: this.property.id,
        userId: 'current-user-id', // TODO: Replace with actual user ID from auth
        viewingDate: this.bookingData.viewingDate,
        viewingTime: this.bookingData.viewingTime,
        status: 'pending',
        name: this.bookingData.name,
        email: this.bookingData.email,
        phone: this.bookingData.phone,
        notes: this.bookingData.notes,
        createdAt: new Date().toISOString()
      };

      const savedBooking = await this.bookingService.create(booking);

      await this.showToast('Booking request submitted successfully!', 'success');

      this.router.navigate(['/tabs/bookings']);
    } catch (error) {
      console.error('Error creating booking:', error);
      await this.showToast('Failed to submit booking request', 'danger');
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
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