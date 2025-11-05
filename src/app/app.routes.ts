import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login', // login as the default route 
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'property-list',
    loadComponent: () => import('./features/properties/property-list/property-list.page').then( m => m.PropertyListPage)
  },
  {
    path: 'property-detail',
    loadComponent: () => import('./features/properties/property-detail/property-detail.page').then( m => m.PropertyDetailPage)
  },
  {
    path: 'property-create',
    loadComponent: () => import('./features/properties/property-create/property-create.page').then( m => m.PropertyCreatePage)
  },
  {
    path: 'booking-form',
    loadComponent: () => import('./features/bookings/booking-form/booking-form.page').then( m => m.BookingFormPage)
  },
  {
    path: 'booking-list',
    loadComponent: () => import('./features/bookings/booking-list/booking-list.page').then( m => m.BookingListPage)
  },
  {
    path: 'property-map',
    loadComponent: () => import('./features/map/property-map/property-map.page').then( m => m.PropertyMapPage)
  },
];
