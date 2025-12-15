import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSpinner,
  IonList,
  IonItem,
  IonLabel,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  person,
  personCircle,
  personCircleOutline,
  mail,
  calendar,
  time,
  key,
  logOut,
  create,
  camera,
  chevronForward,
  checkmarkCircle,
  closeCircle,
  logIn
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { User } from '../../../core/models';

/**
 * Profile page component
 * Displays user information, booking statistics, and account actions
 * Part of CA Two requirements
 */
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonSpinner,
    IonList,
    IonItem,
    IonLabel
  ]
})
export class ProfilePage implements OnInit, ViewWillEnter {
  currentUser: User | null = null;
  isLoading: boolean = true;
  
  bookingStats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0
  };

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      person,
      personCircle,
      personCircleOutline,
      mail,
      calendar,
      time,
      key,
      logOut,
      create,
      camera,
      chevronForward,
      checkmarkCircle,
      closeCircle,
      logIn
    });
  }

  async ngOnInit() {
    await this.loadProfile();
  }

  /**
   * Reload profile data when page becomes visible
   */
  async ionViewWillEnter() {
    await this.loadProfile();
  }

  /**
   * Load user profile and booking statistics
   */
  private async loadProfile(): Promise<void> {
    try {
      this.isLoading = true;

      // Get current user
      this.currentUser = this.authService.currentUser;

      if (this.currentUser) {
        // Load booking statistics
        await this.loadBookingStats();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      await this.showToast('Failed to load profile', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load booking statistics for current user
   */
  private async loadBookingStats(): Promise<void> {
    try {
      const userId = this.authService.currentUserId;
      if (!userId) return;

      const bookings = await this.bookingService.getByUser(userId);

      this.bookingStats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length
      };
    } catch (error) {
      console.error('Error loading booking stats:', error);
    }
  }

  /**
   * Format date string for display
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Navigate to login page
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Edit profile information
   */
  async editProfile(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Edit Profile',
      inputs: [
        {
          name: 'displayName',
          type: 'text',
          placeholder: 'Full Name',
          value: this.currentUser?.displayName || ''
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: async (data) => {
            if (data.displayName && data.displayName.trim()) {
              await this.updateProfile(data.displayName.trim());
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Update user profile
   */
  private async updateProfile(displayName: string): Promise<void> {
    try {
      await this.authService.updateUserProfile(displayName);
      await this.showToast('Profile updated successfully', 'success');
      await this.loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      await this.showToast('Failed to update profile', 'danger');
    }
  }

  /**
   * Change profile photo
   * TODO: Implement photo upload in future enhancement
   */
  async changeProfilePhoto(): Promise<void> {
    await this.showToast('Photo upload coming soon!', 'primary');
  }

  /**
   * Change password
   */
  async changePassword(): Promise<void> {
    await this.showToast('Password change feature coming soon!', 'primary');
  }

  /**
   * Navigate to bookings page
   */
  viewBookings(): void {
    this.router.navigate(['/tabs/bookings']);
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          role: 'destructive',
          handler: async () => {
            try {
              await this.authService.logout();
              await this.showToast('Logged out successfully', 'success');
              this.router.navigate(['/login']);
            } catch (error) {
              console.error('Logout error:', error);
              await this.showToast('Failed to logout', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Show toast message
   */
  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color
    });
    await toast.present();
  }
}