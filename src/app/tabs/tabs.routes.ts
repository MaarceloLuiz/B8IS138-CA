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
          import('../tab3/tab3.page').then((m) => m.Tab3Page),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];