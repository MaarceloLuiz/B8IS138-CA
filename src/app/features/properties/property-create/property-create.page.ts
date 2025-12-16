import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonCheckbox,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  informationCircle,
  home,
  location,
  pricetag,
  image,
  navigate,
  arrowBack
} from 'ionicons/icons';
import { PropertyService } from '../../../core/services/property.service';
import { AuthService } from '../../../core/services/auth.service';
import { Property } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-property-create',
  templateUrl: './property-create.page.html',
  styleUrls: ['./property-create.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonCheckbox
  ]
})
export class PropertyCreatePage implements OnInit {
  propertyForm!: FormGroup;
  isSubmitting: boolean = false;
  isGeocoding: boolean = false;
  
  // Edit mode properties
  isEditMode: boolean = false;
  propertyId: string | null = null;
  existingProperty: Property | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      checkmarkCircle,
      informationCircle,
      home,
      location,
      pricetag,
      image,
      navigate,
      arrowBack
    });
  }

  async ngOnInit() {
    this.initializeForm();
    
    // Check if we're in edit mode
    this.propertyId = this.route.snapshot.queryParamMap.get('id');
    const mode = this.route.snapshot.queryParamMap.get('mode');
    
    if (this.propertyId && mode === 'edit') {
      this.isEditMode = true;
      await this.loadPropertyForEdit(this.propertyId);
    }
  }

  /**
   * Initialize the property creation form with validation
   */
  private initializeForm(): void {
    this.propertyForm = this.fb.group({
      // Basic Information
      title: ['', [Validators.required, Validators.minLength(5)]],
      propertyType: ['apartment', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      
      // Pricing & Details
      price: ['', [Validators.required, Validators.min(1)]],
      bedrooms: ['', [Validators.required, Validators.min(0)]],
      bathrooms: ['', [Validators.required, Validators.min(0)]],
      areaSqm: ['', [Validators.required, Validators.min(1)]],
      
      // Location
      location: ['', Validators.required],
      address: ['', Validators.required],
      eircode: [''],
      latitude: [''],
      longitude: [''],
      
      // Images
      image1: ['', Validators.required],
      image2: [''],
      image3: [''],
      image4: [''],
      
      // Agent Information
      agentName: ['', Validators.required],
      agentPhone: ['', Validators.required],
      agentEmail: ['', [Validators.required, Validators.email]],
      
      // Additional
      isFeatured: [false]
    });
  }

  /**
   * Load existing property data for editing
   */
  private async loadPropertyForEdit(propertyId: string): Promise<void> {
    try {
      // FIX 1: Handle undefined return type
      const property = await this.propertyService.getById(propertyId);
      this.existingProperty = property || null;
      
      if (!this.existingProperty) {
        await this.showToast('Property not found', 'danger');
        this.router.navigate(['/tabs/properties']);
        return;
      }

      // Check if current user is the owner
      const currentUser = this.authService.currentUser;
      if (!currentUser || this.existingProperty.createdBy !== currentUser.uid) {
        await this.showToast('You do not have permission to edit this property', 'danger');
        this.router.navigate(['/tabs/properties']);
        return;
      }

      // Pre-fill the form with existing data
      this.propertyForm.patchValue({
        title: this.existingProperty.title,
        propertyType: this.existingProperty.propertyType,
        description: this.existingProperty.description,
        price: this.existingProperty.price,
        bedrooms: this.existingProperty.bedrooms,
        bathrooms: this.existingProperty.bathrooms,
        areaSqm: this.existingProperty.areaSqm,
        location: this.existingProperty.location,
        address: this.existingProperty.address,
        eircode: this.existingProperty.eircode || '',
        latitude: this.existingProperty.latitude || '',
        longitude: this.existingProperty.longitude || '',
        image1: this.existingProperty.images[0] || '',
        image2: this.existingProperty.images[1] || '',
        image3: this.existingProperty.images[2] || '',
        image4: this.existingProperty.images[3] || '',
        agentName: this.existingProperty.agentName,
        agentPhone: this.existingProperty.agentPhone,
        agentEmail: this.existingProperty.agentEmail,
        isFeatured: this.existingProperty.isFeatured || false
      });

    } catch (error) {
      console.error('Error loading property for edit:', error);
      await this.showToast('Failed to load property data', 'danger');
      this.router.navigate(['/tabs/properties']);
    }
  }

  /**
   * Auto-geocode address to latitude/longitude using Google Geocoding API
   */
  async autoGeocode(): Promise<void> {
    const address = this.propertyForm.get('address')?.value;
    const eircode = this.propertyForm.get('eircode')?.value;

    if (!address && !eircode) {
      await this.showToast('Please enter an address or Eircode first', 'warning');
      return;
    }

    try {
      this.isGeocoding = true;

      const searchQuery = eircode || address;
      const apiKey = environment.googleMapsApiKey;

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
      
      const response: any = await firstValueFrom(this.http.get(url));

      if (response.status === 'OK' && response.results.length > 0) {
        const location = response.results[0].geometry.location;
        
        this.propertyForm.patchValue({
          latitude: location.lat.toFixed(6),
          longitude: location.lng.toFixed(6)
        });

        await this.showToast('Coordinates found successfully!', 'success');
      } else {
        await this.showToast('Could not find coordinates for this address', 'warning');
      }

    } catch (error) {
      console.error('Geocoding error:', error);
      await this.showToast('Failed to find coordinates. You can enter them manually.', 'danger');
    } finally {
      this.isGeocoding = false;
    }
  }

  /**
   * Go back to properties list
   */
  goBack(): void {
    if (this.isEditMode && this.propertyId) {
      // If editing, go back to the property detail page
      this.router.navigate(['/property-detail'], {
        queryParams: { id: this.propertyId }
      });
    } else {
      // If creating, go back to the home/properties list
      this.router.navigate(['/tabs/home']);
    }
  }

  /**
   * Submit the property creation/update form
   */
  async submitProperty(): Promise<void> {
    if (!this.propertyForm.valid) {
      await this.showToast('Please fill in all required fields correctly', 'warning');
      this.markFormGroupTouched(this.propertyForm);
      return;
    }

    // Check if user is logged in
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      await this.showToast('You must be logged in to create a property', 'danger');
      this.router.navigate(['/login']);
      return;
    }

    // FIX 2: Only check ownership if we are in EDIT mode
    if (this.isEditMode) {
      if (!this.existingProperty || this.existingProperty.createdBy !== currentUser.uid) {
        await this.showToast('You do not have permission to edit this property', 'danger');
        this.router.navigate(['/tabs/properties']);
        return;
      }
    }

    // Confirm before creating/updating
    const alert = await this.alertController.create({
      header: this.isEditMode ? 'Update Property' : 'Create Property',
      message: this.isEditMode 
        ? 'Are you sure you want to update this property listing?' 
        : 'Are you sure you want to create this property listing?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: this.isEditMode ? 'Update' : 'Create',
          handler: async () => {
            if (this.isEditMode) {
              await this.updateProperty();
            } else {
              await this.createProperty();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Create a new property in Firestore
   */
  private async createProperty(): Promise<void> {
    try {
      this.isSubmitting = true;

      const formValue = this.propertyForm.value;
      const currentUser = this.authService.currentUser;

      // Build images array
      const images: string[] = [formValue.image1];
      if (formValue.image2) images.push(formValue.image2);
      if (formValue.image3) images.push(formValue.image3);
      if (formValue.image4) images.push(formValue.image4);

      // Create property object
      const property: Omit<Property, 'id'> = {
        title: formValue.title,
        description: formValue.description,
        price: Number(formValue.price),
        location: formValue.location,
        address: formValue.address,
        bedrooms: Number(formValue.bedrooms),
        bathrooms: Number(formValue.bathrooms),
        areaSqm: Number(formValue.areaSqm),
        propertyType: formValue.propertyType,
        images: images,
        agentName: formValue.agentName,
        agentPhone: formValue.agentPhone,
        agentEmail: formValue.agentEmail,
        createdBy: currentUser!.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFeatured: formValue.isFeatured || false
      };

      // Only add optional fields if they have values
      if (formValue.eircode) {
        property.eircode = formValue.eircode;
      }
      if (formValue.latitude && formValue.longitude) {
        property.latitude = Number(formValue.latitude);
        property.longitude = Number(formValue.longitude);
      }

      // Save to Firestore
      const propertyId = await this.propertyService.create(property);

      await this.showToast('Property created successfully!', 'success');

      // Navigate to the newly created property detail page
      this.router.navigate(['/property-detail'], {
        queryParams: { id: propertyId }
      });

    } catch (error: any) {
      console.error('Error creating property:', error);
      
      let errorMessage = 'Failed to create property. ';
      
      if (error?.message) {
        errorMessage += error.message;
      } else if (error?.code) {
        errorMessage += `Error code: ${error.code}`;
      } else {
        errorMessage += 'Please check all fields and try again.';
      }
      
      await this.showToast(errorMessage, 'danger');
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Update an existing property in Firestore
   */
  private async updateProperty(): Promise<void> {
    if (!this.propertyId || !this.existingProperty) {
      await this.showToast('Property ID not found', 'danger');
      return;
    }

    try {
      this.isSubmitting = true;

      const formValue = this.propertyForm.value;

      // Build images array
      const images: string[] = [formValue.image1];
      if (formValue.image2) images.push(formValue.image2);
      if (formValue.image3) images.push(formValue.image3);
      if (formValue.image4) images.push(formValue.image4);

      // Create update object
      const updateData: Partial<Property> = {
        title: formValue.title,
        description: formValue.description,
        price: Number(formValue.price),
        location: formValue.location,
        address: formValue.address,
        bedrooms: Number(formValue.bedrooms),
        bathrooms: Number(formValue.bathrooms),
        areaSqm: Number(formValue.areaSqm),
        propertyType: formValue.propertyType,
        images: images,
        agentName: formValue.agentName,
        agentPhone: formValue.agentPhone,
        agentEmail: formValue.agentEmail,
        isFeatured: formValue.isFeatured || false
      };

      // Only add optional fields if they have values
      if (formValue.eircode) {
        updateData.eircode = formValue.eircode;
      }
      if (formValue.latitude && formValue.longitude) {
        updateData.latitude = Number(formValue.latitude);
        updateData.longitude = Number(formValue.longitude);
      }

      // Update in Firestore
      await this.propertyService.update(this.propertyId, updateData);

      await this.showToast('Property updated successfully!', 'success');

      // Navigate back to the property detail page
      this.router.navigate(['/property-detail'], {
        queryParams: { id: this.propertyId }
      });

    } catch (error: any) {
      console.error('Error updating property:', error);
      
      let errorMessage = 'Failed to update property. ';
      
      if (error?.message) {
        errorMessage += error.message;
      } else if (error?.code) {
        errorMessage += `Error code: ${error.code}`;
      } else {
        errorMessage += 'Please check all fields and try again.';
      }
      
      await this.showToast(errorMessage, 'danger');
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Show toast notification
   */
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