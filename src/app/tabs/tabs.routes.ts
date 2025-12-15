import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../features/properties/property-list/property-list.page').then((m) => m.PropertyListPage),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('../features/bookings/booking-list/booking-list.page').then((m) => m.BookingListPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../features/profile/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];