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
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, eye, eyeOff } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
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
  ]
})
export class LoginPage {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ home, eye, eyeOff });
  } 
  
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // FIREBASE login
  async onLogin() {
    if (!this.email || !this.password) {
      const toast = await this.toastController.create({
        message: 'Please enter email and password',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;

    try {
      await this.authService.login(this.email, this.password);

      const toast = await this.toastController.create({
        message: 'Login successful!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      this.router.navigate(['/tabs/home']);
    } catch (error: any) {
      console.error('Login error:', error);
      
      const toast = await this.toastController.create({
        message: error.message || 'Login failed. Please try again.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  // async onLogin(): Promise<void> {
  //   this.errorMessage = '';
  //   this.isLoading = true;

  //   try {
  //     // mock authentication
  //     // TODO: Replace with real Firebase auth when config.sh is set up
  //     if (this.email === 'demo@realestate.ie' && this.password === 'demo123') {
  //       await this.showToast('Login successful!', 'success');
  //       await this.router.navigate(['/tabs']);
  //     } else {
  //       // Try real Firebase auth (will work once Firebase is configured)
  //       await this.authService.login(this.email, this.password);
  //       await this.showToast('Welcome back!', 'success');
  //       await this.router.navigate(['/tabs']);
  //     }
  //   } catch (error: any) {
  //     console.error('Login error:', error);
  //     this.errorMessage = error.message || 'Invalid email or password';
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