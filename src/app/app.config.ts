import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';

/**
 * app config
 * uses env vars for Firebase config
 * loads env vars from ../environments/environment.ts
*/

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideIonicAngular(),
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => getAuth()),
    ]
};