import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonIcon,
  IonSpinner,
  IonButtons,
  IonBackButton,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAdd, eye, eyeOff } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonText,
    IonIcon,
    IonSpinner,
    IonButtons,
    IonBackButton
  ]
})
export class RegisterPage {
  displayName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ personAdd, eye, eyeOff });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private validateForm(): boolean {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return false;
    }

    // Check email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    if (this.displayName.trim().length < 2) {
      this.errorMessage = 'Please enter your full name';
      return false;
    }

    return true;
  }

  // FIREBASE register
  async onRegister() {
    if (!this.displayName || !this.email || !this.password || !this.confirmPassword) {
      const toast = await this.toastController.create({
        message: 'Please fill in all fields',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    if (this.password !== this.confirmPassword) {
      const toast = await this.toastController.create({
        message: 'Passwords do not match',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    if (this.password.length < 6) {
      const toast = await this.toastController.create({
        message: 'Password must be at least 6 characters',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;

    try {
      await this.authService.register(this.email, this.password, this.displayName);

      const toast = await this.toastController.create({
        message: 'Registration successful! Welcome!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      this.router.navigate(['/tabs/home']);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const toast = await this.toastController.create({
        message: error.message || 'Registration failed. Please try again.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  // handle register form submission
  // async onRegister(): Promise<void> {
  //   this.errorMessage = '';

  //   if (!this.validateForm()) {
  //     await this.showToast(this.errorMessage, 'danger');
  //     return;
  //   }

  //   this.isLoading = true;

  //   try {
  //     // For now, use mock registration
  //     // TODO: Replace with real Firebase auth when config.sh is set up
      
  //     // Simulate registration delay
  //     await new Promise(resolve => setTimeout(resolve, 1000));
      
  //     // Mock successful registration
  //     await this.showToast('Account created successfully!', 'success');
  //     await this.router.navigate(['/tabs/home']);
      
  //     // Uncomment below when Firebase is configured
  //     /*
  //     await this.authService.register(
  //       this.email,
  //       this.password,
  //       this.displayName
  //     );
  //     await this.showToast('Welcome! Your account has been created.', 'success');
  //     await this.router.navigate(['/tabs/home']);
  //     */
  //   } catch (error: any) {
  //     console.error('Registration error:', error);
  //     this.errorMessage = error.message || 'Failed to create account';
  //     await this.showToast(this.errorMessage, 'danger');
  //   } finally {
  //     this.isLoading = false;
  //   }
  // }

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